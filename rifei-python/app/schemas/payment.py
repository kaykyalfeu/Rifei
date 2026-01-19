"""
Schemas para Sistema de Pagamentos - Rifei
Integração com Mercado Pago
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

from app.models.models import PaymentStatus, PaymentMethod


# ===========================================
# CHECKOUT
# ===========================================

class CheckoutCreate(BaseModel):
    """Schema para iniciar checkout"""
    reservation_id: str
    payment_method: PaymentMethod = PaymentMethod.PIX


class CheckoutResponse(BaseModel):
    """Resposta do checkout"""
    payment_id: int
    reservation_id: str
    rifa_id: int
    numbers: List[int]
    amount: Decimal
    fee: Decimal
    net_amount: Decimal

    # Mercado Pago
    mp_payment_id: Optional[str] = None
    mp_preference_id: Optional[str] = None

    # PIX
    pix_qr_code: Optional[str] = None
    pix_qr_code_base64: Optional[str] = None
    pix_copy_paste: Optional[str] = None

    # Links
    checkout_url: Optional[str] = None
    expires_at: datetime

    status: PaymentStatus


# ===========================================
# PAYMENT
# ===========================================

class PaymentResponse(BaseModel):
    """Resposta de pagamento"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    rifa_id: int
    user_id: int
    amount: Decimal
    fee: Decimal
    net_amount: Decimal
    status: PaymentStatus
    method: Optional[PaymentMethod] = None

    # Mercado Pago
    mp_payment_id: Optional[str] = None
    mp_preference_id: Optional[str] = None

    # PIX
    pix_qr_code: Optional[str] = None
    pix_copy_paste: Optional[str] = None

    # Datas
    created_at: datetime
    paid_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    # Tickets comprados
    tickets_count: Optional[int] = None


class PaymentListItem(BaseModel):
    """Item de listagem de pagamentos"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    rifa_id: int
    rifa_title: Optional[str] = None
    amount: Decimal
    status: PaymentStatus
    method: Optional[PaymentMethod] = None
    created_at: datetime
    paid_at: Optional[datetime] = None


# ===========================================
# MERCADO PAGO WEBHOOK
# ===========================================

class MercadoPagoNotification(BaseModel):
    """Notificação do webhook do Mercado Pago"""
    id: Optional[int] = None
    live_mode: bool = True
    type: str  # payment, merchant_order
    date_created: Optional[str] = None
    user_id: Optional[int] = None
    api_version: Optional[str] = None
    action: str  # payment.created, payment.updated
    data: Dict[str, Any]


class MercadoPagoPaymentData(BaseModel):
    """Dados do pagamento do Mercado Pago"""
    id: str  # ID do pagamento no MP
    status: str  # approved, pending, rejected, cancelled, refunded
    status_detail: Optional[str] = None
    payment_type_id: Optional[str] = None  # pix, credit_card, debit_card
    payment_method_id: Optional[str] = None
    transaction_amount: float
    net_amount: Optional[float] = None
    total_paid_amount: Optional[float] = None
    fee_details: Optional[List[Dict]] = None
    payer: Optional[Dict] = None
    date_approved: Optional[str] = None
    date_created: Optional[str] = None


# ===========================================
# PREFERÊNCIA MERCADO PAGO
# ===========================================

class MPPreferenceItem(BaseModel):
    """Item da preferência do Mercado Pago"""
    title: str
    quantity: int
    unit_price: float
    currency_id: str = "BRL"


class MPPayer(BaseModel):
    """Dados do pagador"""
    email: str
    name: Optional[str] = None
    surname: Optional[str] = None


class MPBackUrls(BaseModel):
    """URLs de retorno"""
    success: str
    failure: str
    pending: str


class MPPreferenceCreate(BaseModel):
    """Schema para criar preferência no Mercado Pago"""
    items: List[MPPreferenceItem]
    payer: MPPayer
    back_urls: MPBackUrls
    auto_return: str = "approved"
    external_reference: str  # ID do pagamento no nosso sistema
    statement_descriptor: str = "RIFEI"
    notification_url: Optional[str] = None
    expires: bool = True
    expiration_date_from: Optional[str] = None
    expiration_date_to: Optional[str] = None


class MPPreferenceResponse(BaseModel):
    """Resposta da criação de preferência"""
    id: str
    init_point: str  # URL para checkout
    sandbox_init_point: Optional[str] = None
    date_created: str


# ===========================================
# PIX
# ===========================================

class PixPaymentCreate(BaseModel):
    """Criar pagamento PIX"""
    transaction_amount: float
    description: str
    payment_method_id: str = "pix"
    payer: Dict[str, str]  # {"email": "user@example.com"}
    external_reference: str  # ID do pagamento no nosso sistema


class PixPaymentResponse(BaseModel):
    """Resposta do pagamento PIX"""
    id: str  # ID do pagamento no MP
    status: str
    status_detail: str
    transaction_amount: float
    date_created: str
    date_approved: Optional[str] = None

    # Dados do PIX
    point_of_interaction: Optional[Dict] = None
    # point_of_interaction.transaction_data.qr_code
    # point_of_interaction.transaction_data.qr_code_base64


# ===========================================
# ESTATÍSTICAS
# ===========================================

class PaymentStats(BaseModel):
    """Estatísticas de pagamentos"""
    total_payments: int
    total_amount: Decimal
    approved_payments: int
    approved_amount: Decimal
    pending_payments: int
    pending_amount: Decimal
    rejected_payments: int
    by_method: Dict[str, int]
    by_status: Dict[str, int]


# ===========================================
# REFUND
# ===========================================

class RefundRequest(BaseModel):
    """Solicitação de reembolso"""
    payment_id: int
    reason: str = Field(..., min_length=10, max_length=500)


class RefundResponse(BaseModel):
    """Resposta de reembolso"""
    payment_id: int
    mp_refund_id: Optional[str] = None
    amount: Decimal
    status: str
    message: str
    refunded_at: datetime
