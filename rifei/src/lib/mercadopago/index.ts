import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// Configuração do cliente Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  },
})

// Instâncias de API
const preferenceClient = new Preference(client)
const paymentClient = new Payment(client)

// ===========================================
// TIPOS
// ===========================================

export interface CriarPreferenciaParams {
  pagamentoId: string
  rifaTitulo: string
  rifaSlug: string
  quantidade: number
  precoUnitario: number
  compradorEmail: string
  compradorNome: string
}

export interface PreferenciaResponse {
  id: string
  init_point: string
  sandbox_init_point: string
}

export interface WebhookPayload {
  action: string
  api_version: string
  data: {
    id: string
  }
  date_created: string
  id: number
  live_mode: boolean
  type: string
  user_id: string
}

export interface PaymentInfo {
  id: number
  status: string
  status_detail: string
  payment_method_id: string
  payment_type_id: string
  transaction_amount: number
  external_reference: string
  payer: {
    email: string
    identification?: {
      type: string
      number: string
    }
  }
}

// ===========================================
// FUNÇÕES
// ===========================================

/**
 * Cria uma preferência de pagamento no Mercado Pago
 */
export async function criarPreferencia(params: CriarPreferenciaParams): Promise<PreferenciaResponse> {
  const {
    pagamentoId,
    rifaTitulo,
    rifaSlug,
    quantidade,
    precoUnitario,
    compradorEmail,
    compradorNome,
  } = params

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const preferencia = await preferenceClient.create({
    body: {
      // Itens do carrinho
      items: [
        {
          id: pagamentoId,
          title: `${quantidade}x Números - ${rifaTitulo}`,
          description: `Compra de ${quantidade} número(s) na rifa "${rifaTitulo}"`,
          quantity: 1,
          unit_price: quantidade * precoUnitario,
          currency_id: 'BRL',
          category_id: 'entertainment',
        },
      ],

      // Dados do comprador
      payer: {
        email: compradorEmail,
        name: compradorNome,
      },

      // URLs de retorno
      back_urls: {
        success: `${appUrl}/rifa/${rifaSlug}?pagamento=sucesso`,
        failure: `${appUrl}/rifa/${rifaSlug}?pagamento=falha`,
        pending: `${appUrl}/rifa/${rifaSlug}?pagamento=pendente`,
      },
      auto_return: 'approved',

      // Referência externa (nosso ID de pagamento)
      external_reference: pagamentoId,

      // Configurações
      statement_descriptor: 'RIFEI',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos

      // Webhook
      notification_url: `${appUrl}/api/webhooks/mercadopago`,

      // Meios de pagamento
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 1, // Apenas à vista
      },
    },
  })

  return {
    id: preferencia.id!,
    init_point: preferencia.init_point!,
    sandbox_init_point: preferencia.sandbox_init_point!,
  }
}

/**
 * Busca informações de um pagamento pelo ID
 */
export async function buscarPagamento(paymentId: string): Promise<PaymentInfo | null> {
  try {
    const payment = await paymentClient.get({ id: paymentId })
    
    return {
      id: payment.id!,
      status: payment.status!,
      status_detail: payment.status_detail!,
      payment_method_id: payment.payment_method_id!,
      payment_type_id: payment.payment_type_id!,
      transaction_amount: payment.transaction_amount!,
      external_reference: payment.external_reference!,
      payer: {
        email: payment.payer?.email || '',
        identification: payment.payer?.identification ? {
          type: payment.payer.identification.type || '',
          number: payment.payer.identification.number || '',
        } : undefined,
      },
    }
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error)
    return null
  }
}

/**
 * Verifica se um pagamento foi aprovado
 */
export function isPagamentoAprovado(status: string): boolean {
  return status === 'approved'
}

/**
 * Verifica se um pagamento está pendente
 */
export function isPagamentoPendente(status: string): boolean {
  return ['pending', 'in_process', 'in_mediation'].includes(status)
}

/**
 * Verifica se um pagamento foi recusado
 */
export function isPagamentoRecusado(status: string): boolean {
  return ['rejected', 'cancelled', 'refunded', 'charged_back'].includes(status)
}

/**
 * Traduz o status do pagamento para português
 */
export function traduzirStatusPagamento(status: string): string {
  const traducoes: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    authorized: 'Autorizado',
    in_process: 'Em processamento',
    in_mediation: 'Em mediação',
    rejected: 'Recusado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
    charged_back: 'Estornado',
  }
  return traducoes[status] || status
}

/**
 * Traduz o detalhe do status para uma mensagem amigável
 */
export function traduzirStatusDetail(statusDetail: string): string {
  const traducoes: Record<string, string> = {
    accredited: 'Pagamento aprovado',
    pending_contingency: 'Pagamento pendente de análise',
    pending_review_manual: 'Pagamento em análise manual',
    cc_rejected_bad_filled_card_number: 'Número do cartão incorreto',
    cc_rejected_bad_filled_date: 'Data de validade incorreta',
    cc_rejected_bad_filled_other: 'Dados do cartão incorretos',
    cc_rejected_bad_filled_security_code: 'CVV incorreto',
    cc_rejected_blacklist: 'Cartão não permitido',
    cc_rejected_call_for_authorize: 'Ligue para autorizar',
    cc_rejected_card_disabled: 'Cartão desabilitado',
    cc_rejected_card_error: 'Erro no cartão',
    cc_rejected_duplicated_payment: 'Pagamento duplicado',
    cc_rejected_high_risk: 'Pagamento recusado por risco',
    cc_rejected_insufficient_amount: 'Saldo insuficiente',
    cc_rejected_invalid_installments: 'Parcelamento inválido',
    cc_rejected_max_attempts: 'Limite de tentativas excedido',
    cc_rejected_other_reason: 'Recusado pelo banco',
  }
  return traducoes[statusDetail] || 'Processando pagamento'
}

// Exportar cliente para uso direto se necessário
export { client as mercadoPagoClient }
