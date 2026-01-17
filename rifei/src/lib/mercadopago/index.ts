// ===========================================
// MERCADO PAGO - STUB TEMPORÁRIO
// ===========================================
// Este é um arquivo temporário para permitir o build sem o SDK do Mercado Pago
// Quando configurar o Mercado Pago, instale o pacote e restaure o arquivo original

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
// FUNÇÕES STUB
// ===========================================

/**
 * Cria uma preferência de pagamento no Mercado Pago
 * TODO: Implementar quando Mercado Pago estiver configurado
 */
export async function criarPreferencia(params: CriarPreferenciaParams): Promise<PreferenciaResponse> {
  console.warn('⚠️ Mercado Pago não configurado. Usando stub.')

  // Retorna dados mock para não quebrar o código
  return {
    id: 'stub-preference-id',
    init_point: 'https://www.mercadopago.com.br/checkout/stub',
    sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/stub',
  }
}

/**
 * Busca informações de um pagamento pelo ID
 * TODO: Implementar quando Mercado Pago estiver configurado
 */
export async function buscarPagamento(paymentId: string): Promise<PaymentInfo | null> {
  console.warn('⚠️ Mercado Pago não configurado. Usando stub.')
  return null
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

// Cliente stub
export const mercadoPagoClient = null
