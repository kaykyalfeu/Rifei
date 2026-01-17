"""
Service de Pagamentos - Rifei
Integração completa com Mercado Pago (PIX e Cartão)
"""
import os
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional, List, Dict
import mercadopago
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.models import (
    Payment,
    Ticket,
    Rifa,
    User,
    PaymentStatus,
    PaymentMethod,
)


# ===========================================
# CONFIGURAÇÃO MERCADO PAGO
# ===========================================

def get_mp_sdk():
    """Retorna SDK do Mercado Pago configurado"""
    sdk = mercadopago.SDK(settings.mercadopago_access_token)
    return sdk


# ===========================================
# TAXAS E CÁLCULOS
# ===========================================

PLATFORM_FEE_PERCENT = Decimal("5.0")  # 5% de taxa da plataforma


def calculate_fees(amount: Decimal) -> Dict[str, Decimal]:
    """
    Calcula taxas do pagamento

    Args:
        amount: Valor bruto

    Returns:
        Dict com amount, fee, net_amount
    """
    fee = (amount * PLATFORM_FEE_PERCENT) / Decimal("100")
    net_amount = amount - fee

    return {
        "amount": amount,
        "fee": fee,
        "net_amount": net_amount,
    }


# ===========================================
# CRIAÇÃO DE PAGAMENTO
# ===========================================

async def create_payment(
    db: AsyncSession,
    rifa_id: int,
    user_id: int,
    numbers: List[int],
    amount: Decimal,
) -> Payment:
    """
    Cria um novo pagamento

    Args:
        db: Sessão do banco
        rifa_id: ID da rifa
        user_id: ID do usuário
        numbers: Lista de números comprados
        amount: Valor total

    Returns:
        Payment criado
    """
    fees = calculate_fees(amount)

    payment = Payment(
        rifa_id=rifa_id,
        user_id=user_id,
        amount=fees["amount"],
        fee=fees["fee"],
        net_amount=fees["net_amount"],
        status=PaymentStatus.PENDING,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
    )

    db.add(payment)
    await db.commit()
    await db.refresh(payment)

    return payment


# ===========================================
# MERCADO PAGO - PREFERÊNCIA (CHECKOUT)
# ===========================================

async def create_mp_preference(
    db: AsyncSession,
    payment: Payment,
    rifa: Rifa,
    user: User,
    numbers: List[int],
) -> Dict:
    """
    Cria preferência no Mercado Pago para checkout

    Args:
        db: Sessão do banco
        payment: Pagamento
        rifa: Rifa
        user: Usuário
        numbers: Números comprados

    Returns:
        Dict com dados da preferência
    """
    sdk = get_mp_sdk()

    # Criar item da preferência
    preference_data = {
        "items": [
            {
                "title": f"{rifa.title} - {len(numbers)} número(s)",
                "quantity": 1,
                "unit_price": float(payment.amount),
                "currency_id": "BRL",
            }
        ],
        "payer": {
            "name": user.name,
            "email": user.email,
        },
        "back_urls": {
            "success": f"{settings.app_url}/payment/success?payment_id={payment.id}",
            "failure": f"{settings.app_url}/payment/failure?payment_id={payment.id}",
            "pending": f"{settings.app_url}/payment/pending?payment_id={payment.id}",
        },
        "auto_return": "approved",
        "external_reference": str(payment.id),
        "statement_descriptor": "RIFEI",
        "notification_url": f"{settings.app_url}/api/webhooks/mercadopago",
        "expires": True,
        "expiration_date_from": datetime.now(timezone.utc).isoformat(),
        "expiration_date_to": payment.expires_at.isoformat(),
    }

    # Criar preferência
    preference_response = sdk.preference().create(preference_data)

    if preference_response["status"] == 201:
        preference = preference_response["response"]

        # Atualizar pagamento com ID da preferência
        payment.mp_preference_id = preference["id"]
        await db.commit()

        return {
            "preference_id": preference["id"],
            "init_point": preference["init_point"],
            "sandbox_init_point": preference.get("sandbox_init_point"),
        }
    else:
        raise Exception(f"Erro ao criar preferência: {preference_response}")


# ===========================================
# MERCADO PAGO - PIX
# ===========================================

async def create_pix_payment(
    db: AsyncSession,
    payment: Payment,
    rifa: Rifa,
    user: User,
    numbers: List[int],
) -> Dict:
    """
    Cria pagamento PIX no Mercado Pago

    Args:
        db: Sessão do banco
        payment: Pagamento
        rifa: Rifa
        user: Usuário
        numbers: Números comprados

    Returns:
        Dict com dados do PIX (QR Code, etc)
    """
    sdk = get_mp_sdk()

    # Criar pagamento PIX
    payment_data = {
        "transaction_amount": float(payment.amount),
        "description": f"{rifa.title} - {len(numbers)} número(s)",
        "payment_method_id": "pix",
        "payer": {
            "email": user.email,
            "first_name": user.name.split()[0] if user.name else "Cliente",
        },
        "external_reference": str(payment.id),
        "notification_url": f"{settings.app_url}/api/webhooks/mercadopago",
    }

    # Criar pagamento
    payment_response = sdk.payment().create(payment_data)

    if payment_response["status"] in [200, 201]:
        mp_payment = payment_response["response"]

        # Extrair dados do PIX
        pix_data = mp_payment.get("point_of_interaction", {}).get("transaction_data", {})

        # Atualizar pagamento
        payment.mp_payment_id = str(mp_payment["id"])
        payment.method = PaymentMethod.PIX
        payment.pix_qr_code = pix_data.get("qr_code")
        payment.pix_qr_code_base64 = pix_data.get("qr_code_base64")
        payment.pix_copy_paste = pix_data.get("qr_code")

        await db.commit()

        return {
            "mp_payment_id": mp_payment["id"],
            "qr_code": pix_data.get("qr_code"),
            "qr_code_base64": pix_data.get("qr_code_base64"),
            "ticket_url": pix_data.get("ticket_url"),
        }
    else:
        raise Exception(f"Erro ao criar pagamento PIX: {payment_response}")


# ===========================================
# WEBHOOK - PROCESSAR NOTIFICAÇÃO
# ===========================================

async def process_mp_notification(
    db: AsyncSession,
    notification_data: Dict,
) -> bool:
    """
    Processa notificação do webhook do Mercado Pago

    Args:
        db: Sessão do banco
        notification_data: Dados da notificação

    Returns:
        True se processado com sucesso
    """
    # Extrair dados
    notification_type = notification_data.get("type")

    if notification_type != "payment":
        return False

    # Obter ID do pagamento no MP
    payment_id = notification_data.get("data", {}).get("id")

    if not payment_id:
        return False

    # Buscar informações do pagamento no MP
    sdk = get_mp_sdk()
    payment_info = sdk.payment().get(payment_id)

    if payment_info["status"] != 200:
        return False

    mp_payment = payment_info["response"]

    # Buscar pagamento no nosso banco (por external_reference)
    external_ref = mp_payment.get("external_reference")

    if not external_ref:
        return False

    result = await db.execute(
        select(Payment).where(Payment.id == int(external_ref))
    )
    payment = result.scalar_one_or_none()

    if not payment:
        return False

    # Atualizar status
    mp_status = mp_payment.get("status")

    if mp_status == "approved":
        await approve_payment(db, payment, mp_payment)
    elif mp_status == "rejected":
        payment.status = PaymentStatus.REJECTED
    elif mp_status == "cancelled":
        payment.status = PaymentStatus.CANCELLED
    elif mp_status == "refunded":
        payment.status = PaymentStatus.REFUNDED
    else:
        payment.status = PaymentStatus.PENDING

    await db.commit()

    return True


# ===========================================
# APROVAÇÃO DE PAGAMENTO
# ===========================================

async def approve_payment(
    db: AsyncSession,
    payment: Payment,
    mp_payment_data: Optional[Dict] = None,
) -> bool:
    """
    Aprova um pagamento e cria os tickets

    Args:
        db: Sessão do banco
        payment: Pagamento
        mp_payment_data: Dados do pagamento do MP (opcional)

    Returns:
        True se aprovado com sucesso
    """
    # Verificar se já foi aprovado
    if payment.status == PaymentStatus.APPROVED:
        return False

    # Atualizar status
    payment.status = PaymentStatus.APPROVED
    payment.paid_at = datetime.now(timezone.utc)

    # Atualizar método de pagamento se disponível
    if mp_payment_data:
        payment_type = mp_payment_data.get("payment_type_id")
        if payment_type == "credit_card":
            payment.method = PaymentMethod.CREDIT_CARD
        elif payment_type == "debit_card":
            payment.method = PaymentMethod.DEBIT_CARD
        elif payment_type == "account_money":
            payment.method = PaymentMethod.PIX

    await db.commit()

    return True


async def create_tickets_from_payment(
    db: AsyncSession,
    payment_id: int,
    numbers: List[int],
) -> List[Ticket]:
    """
    Cria tickets a partir de um pagamento aprovado

    Args:
        db: Sessão do banco
        payment_id: ID do pagamento
        numbers: Lista de números

    Returns:
        Lista de tickets criados
    """
    # Buscar pagamento
    result = await db.execute(
        select(Payment).where(Payment.id == payment_id)
    )
    payment = result.scalar_one_or_none()

    if not payment or payment.status != PaymentStatus.APPROVED:
        raise ValueError("Pagamento não aprovado")

    # Criar tickets
    tickets = []
    for number in numbers:
        ticket = Ticket(
            number=number,
            rifa_id=payment.rifa_id,
            user_id=payment.user_id,
            payment_id=payment.id,
        )
        tickets.append(ticket)
        db.add(ticket)

    # Atualizar contador de vendas da rifa
    rifa_result = await db.execute(
        select(Rifa).where(Rifa.id == payment.rifa_id)
    )
    rifa = rifa_result.scalar_one_or_none()

    if rifa:
        rifa.sold_count += len(numbers)

    await db.commit()

    return tickets


# ===========================================
# CONSULTAS
# ===========================================

async def get_payment_by_id(
    db: AsyncSession,
    payment_id: int,
) -> Optional[Payment]:
    """Busca pagamento por ID"""
    result = await db.execute(
        select(Payment).where(Payment.id == payment_id)
    )
    return result.scalar_one_or_none()


async def get_user_payments(
    db: AsyncSession,
    user_id: int,
    limit: int = 20,
) -> List[Payment]:
    """Lista pagamentos de um usuário"""
    result = await db.execute(
        select(Payment)
        .where(Payment.user_id == user_id)
        .order_by(Payment.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_rifa_payments(
    db: AsyncSession,
    rifa_id: int,
    status: Optional[PaymentStatus] = None,
) -> List[Payment]:
    """Lista pagamentos de uma rifa"""
    query = select(Payment).where(Payment.rifa_id == rifa_id)

    if status:
        query = query.where(Payment.status == status)

    query = query.order_by(Payment.created_at.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


# ===========================================
# REEMBOLSO
# ===========================================

async def refund_payment(
    db: AsyncSession,
    payment_id: int,
) -> bool:
    """
    Reembolsa um pagamento

    Args:
        db: Sessão do banco
        payment_id: ID do pagamento

    Returns:
        True se reembolsado com sucesso
    """
    payment = await get_payment_by_id(db, payment_id)

    if not payment or payment.status != PaymentStatus.APPROVED:
        raise ValueError("Pagamento não pode ser reembolsado")

    # Reembolsar no Mercado Pago
    if payment.mp_payment_id:
        sdk = get_mp_sdk()
        refund_response = sdk.refund().create(payment.mp_payment_id)

        if refund_response["status"] != 201:
            raise Exception("Erro ao processar reembolso no Mercado Pago")

    # Atualizar status
    payment.status = PaymentStatus.REFUNDED

    # Remover tickets
    await db.execute(
        select(Ticket).where(Ticket.payment_id == payment.id)
    )
    tickets = (await db.execute(
        select(Ticket).where(Ticket.payment_id == payment.id)
    )).scalars().all()

    for ticket in tickets:
        await db.delete(ticket)

    # Atualizar contador da rifa
    rifa = await db.execute(select(Rifa).where(Rifa.id == payment.rifa_id))
    rifa = rifa.scalar_one_or_none()

    if rifa:
        rifa.sold_count -= len(tickets)

    await db.commit()

    return True


# ===========================================
# ESTATÍSTICAS
# ===========================================

async def get_payment_stats(
    db: AsyncSession,
    rifa_id: Optional[int] = None,
    user_id: Optional[int] = None,
) -> Dict:
    """
    Obtém estatísticas de pagamentos

    Args:
        db: Sessão do banco
        rifa_id: Filtrar por rifa (opcional)
        user_id: Filtrar por usuário (opcional)

    Returns:
        Dict com estatísticas
    """
    from sqlalchemy import func

    query = select(
        func.count(Payment.id).label("total"),
        func.sum(Payment.amount).label("total_amount"),
        func.count(Payment.id).filter(Payment.status == PaymentStatus.APPROVED).label("approved"),
        func.sum(Payment.amount).filter(Payment.status == PaymentStatus.APPROVED).label("approved_amount"),
    ).select_from(Payment)

    if rifa_id:
        query = query.where(Payment.rifa_id == rifa_id)

    if user_id:
        query = query.where(Payment.user_id == user_id)

    result = await db.execute(query)
    row = result.first()

    return {
        "total_payments": row.total or 0,
        "total_amount": row.total_amount or Decimal(0),
        "approved_payments": row.approved or 0,
        "approved_amount": row.approved_amount or Decimal(0),
    }
