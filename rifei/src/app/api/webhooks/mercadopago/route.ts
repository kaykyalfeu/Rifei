import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { buscarPagamento, isPagamentoAprovado, isPagamentoRecusado } from '@/lib/mercadopago'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature')
    const requestId = request.headers.get('x-request-id')

    // Verificar assinatura do webhook (opcional, mas recomendado)
    if (process.env.WEBHOOK_SECRET && signature) {
      const [ts, v1] = signature.split(',').reduce((acc, part) => {
        const [key, value] = part.split('=')
        if (key === 'ts') acc[0] = value
        if (key === 'v1') acc[1] = value
        return acc
      }, ['', ''])

      const manifest = `id:${requestId};request-id:${requestId};ts:${ts};`
      const expectedSignature = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(manifest)
        .digest('hex')

      if (v1 !== expectedSignature) {
        console.error('Webhook signature mismatch')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const data = JSON.parse(body)

    // Apenas processar notificações de pagamento
    if (data.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = data.data?.id?.toString()

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID not found' }, { status: 400 })
    }

    // Buscar detalhes do pagamento no Mercado Pago
    const paymentInfo = await buscarPagamento(paymentId)

    if (!paymentInfo) {
      console.error('Payment not found in Mercado Pago:', paymentId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // O external_reference é o nosso ID de pagamento interno
    const pagamentoId = paymentInfo.external_reference

    if (!pagamentoId) {
      console.error('External reference not found')
      return NextResponse.json({ error: 'External reference not found' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Buscar pagamento no nosso banco
    const { data: pagamento, error: fetchError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('id', pagamentoId)
      .single()

    if (fetchError || !pagamento) {
      console.error('Payment not found in database:', pagamentoId)
      return NextResponse.json({ error: 'Payment not found in database' }, { status: 404 })
    }

    // Processar baseado no status
    if (isPagamentoAprovado(paymentInfo.status)) {
      // Pagamento aprovado - confirmar números
      const { error: confirmError } = await supabase.rpc('confirmar_pagamento', {
        p_pagamento_id: pagamentoId,
        p_mp_payment_id: paymentId,
        p_mp_status: paymentInfo.status,
      })

      if (confirmError) {
        console.error('Error confirming payment:', confirmError)
        return NextResponse.json({ error: 'Error confirming payment' }, { status: 500 })
      }

      // Criar notificação para o comprador
      await supabase.from('notificacoes').insert({
        usuario_id: pagamento.usuario_id,
        tipo: 'compra',
        titulo: '✅ Compra confirmada!',
        mensagem: `Seus ${pagamento.quantidade_numeros} números foram confirmados. Boa sorte!`,
        rifa_id: pagamento.rifa_id,
        action_url: `/rifa/${pagamento.rifa_id}`,
      })

      // Criar notificação para o criador
      const { data: rifa } = await supabase
        .from('rifas')
        .select('criador_id, titulo')
        .eq('id', pagamento.rifa_id)
        .single()

      if (rifa) {
        await supabase.from('notificacoes').insert({
          usuario_id: rifa.criador_id,
          tipo: 'venda',
          titulo: '💰 Nova venda!',
          mensagem: `${pagamento.quantidade_numeros} números vendidos na rifa "${rifa.titulo}"`,
          rifa_id: pagamento.rifa_id,
          usuario_origem_id: pagamento.usuario_id,
        })
      }

      console.log('Payment confirmed:', pagamentoId)
    } else if (isPagamentoRecusado(paymentInfo.status)) {
      // Pagamento recusado - liberar números
      await supabase
        .from('pagamentos')
        .update({
          status: 'recusado',
          mp_payment_id: paymentId,
          mp_status: paymentInfo.status,
          mp_status_detail: paymentInfo.status_detail,
        })
        .eq('id', pagamentoId)

      // Liberar números reservados
      await supabase
        .from('numeros_rifa')
        .update({
          status: 'disponivel',
          usuario_id: null,
          pagamento_id: null,
          reservado_ate: null,
        })
        .eq('pagamento_id', pagamentoId)

      // Notificar o comprador
      await supabase.from('notificacoes').insert({
        usuario_id: pagamento.usuario_id,
        tipo: 'sistema',
        titulo: '❌ Pagamento não aprovado',
        mensagem: 'Seu pagamento não foi aprovado. Os números foram liberados.',
        rifa_id: pagamento.rifa_id,
      })

      console.log('Payment rejected:', pagamentoId)
    } else {
      // Pagamento pendente - apenas atualizar status
      await supabase
        .from('pagamentos')
        .update({
          mp_payment_id: paymentId,
          mp_status: paymentInfo.status,
          mp_status_detail: paymentInfo.status_detail,
        })
        .eq('id', pagamentoId)

      console.log('Payment pending:', pagamentoId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mercado Pago pode enviar GET para verificar se o endpoint está ativo
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
