"""
Router de Pagamentos - Rifei
Checkout, PIX, Cartão e Webhooks do Mercado Pago
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.models import User, Payment, PaymentStatus
from app.dependencies import get_current_user, get_optional_user
from app.schemas.payment import (
    CheckoutCreate,
    CheckoutResponse,
    PaymentResponse,
    PaymentListItem,
    MercadoPagoNotification,
    RefundRequest,
    RefundResponse,
)
from app.services import payment as payment_service
from app.services import marketplace as marketplace_service


# ===========================================
# CONFIGURAÇÃO
# ===========================================

router = APIRouter(prefix="/payment", tags=["payment"])


# ===========================================
# CHECKOUT
# ===========================================

@router.post("/api/checkout/create", response_model=CheckoutResponse)
async def api_create_checkout(
    data: CheckoutCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Cria checkout para pagamento.
    Suporta PIX e Cartão.
    """
    # TODO: Buscar reserva e validar
    # Por enquanto, vamos simular com dados mock
    rifa_id = 1
    numbers = [1, 2, 3]
    amount = 30.00

    # Buscar rifa
    rifa = await marketplace_service.get_rifa_by_id(db, rifa_id)

    if not rifa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rifa não encontrada"
        )

    # Criar pagamento
    from decimal import Decimal
    payment = await payment_service.create_payment(
        db=db,
        rifa_id=rifa.id,
        user_id=current_user.id,
        numbers=numbers,
        amount=Decimal(str(amount)),
    )

    # Criar checkout no Mercado Pago
    if data.payment_method.value == "pix":
        # Criar pagamento PIX
        pix_data = await payment_service.create_pix_payment(
            db=db,
            payment=payment,
            rifa=rifa,
            user=current_user,
            numbers=numbers,
        )

        return CheckoutResponse(
            payment_id=payment.id,
            reservation_id=data.reservation_id,
            rifa_id=rifa.id,
            numbers=numbers,
            amount=payment.amount,
            fee=payment.fee,
            net_amount=payment.net_amount,
            mp_payment_id=pix_data["mp_payment_id"],
            pix_qr_code=pix_data["qr_code"],
            pix_qr_code_base64=pix_data["qr_code_base64"],
            expires_at=payment.expires_at,
            status=payment.status,
        )
    else:
        # Criar preferência para cartão
        preference_data = await payment_service.create_mp_preference(
            db=db,
            payment=payment,
            rifa=rifa,
            user=current_user,
            numbers=numbers,
        )

        return CheckoutResponse(
            payment_id=payment.id,
            reservation_id=data.reservation_id,
            rifa_id=rifa.id,
            numbers=numbers,
            amount=payment.amount,
            fee=payment.fee,
            net_amount=payment.net_amount,
            mp_preference_id=preference_data["preference_id"],
            checkout_url=preference_data["init_point"],
            expires_at=payment.expires_at,
            status=payment.status,
        )


@router.get("/api/checkout/{payment_id}", response_model=PaymentResponse)
async def api_get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Busca informações de um pagamento.
    """
    payment = await payment_service.get_payment_by_id(db, payment_id)

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )

    # Verificar permissões
    if payment.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para ver este pagamento"
        )

    return PaymentResponse.model_validate(payment)


# ===========================================
# WEBHOOK MERCADO PAGO
# ===========================================

@router.post("/api/webhooks/mercadopago")
async def webhook_mercadopago(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Webhook para receber notificações do Mercado Pago.

    Eventos:
    - payment.created
    - payment.updated
    """
    try:
        # Obter dados da notificação
        notification_data = await request.json()

        # Processar notificação
        success = await payment_service.process_mp_notification(
            db=db,
            notification_data=notification_data,
        )

        if success:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"message": "Notificação processada"}
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"message": "Notificação não processada"}
            )

    except Exception as e:
        print(f"Erro ao processar webhook: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Erro ao processar notificação"}
        )


# ===========================================
# HISTÓRICO DE PAGAMENTOS
# ===========================================

@router.get("/api/payments/me", response_model=List[PaymentListItem])
async def api_my_payments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Lista pagamentos do usuário autenticado.
    """
    payments = await payment_service.get_user_payments(
        db=db,
        user_id=current_user.id,
    )

    return [
        PaymentListItem.model_validate(payment)
        for payment in payments
    ]


@router.get("/api/rifas/{rifa_id}/payments", response_model=List[PaymentListItem])
async def api_rifa_payments(
    rifa_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Lista pagamentos de uma rifa.
    Apenas o criador da rifa ou admin pode ver.
    """
    # Buscar rifa
    rifa = await marketplace_service.get_rifa_by_id(db, rifa_id)

    if not rifa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rifa não encontrada"
        )

    # Verificar permissões
    if rifa.creator_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para ver estes pagamentos"
        )

    payments = await payment_service.get_rifa_payments(
        db=db,
        rifa_id=rifa_id,
    )

    return [
        PaymentListItem.model_validate(payment)
        for payment in payments
    ]


# ===========================================
# REEMBOLSO
# ===========================================

@router.post("/api/payments/{payment_id}/refund", response_model=RefundResponse)
async def api_refund_payment(
    payment_id: int,
    refund_data: RefundRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Solicita reembolso de um pagamento.
    Apenas admin pode reembolsar.
    """
    # Verificar permissões
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem processar reembolsos"
        )

    # Buscar pagamento
    payment = await payment_service.get_payment_by_id(db, payment_id)

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )

    # Processar reembolso
    try:
        success = await payment_service.refund_payment(db, payment_id)

        if success:
            from datetime import datetime, timezone
            return RefundResponse(
                payment_id=payment_id,
                mp_refund_id=payment.mp_payment_id,
                amount=payment.amount,
                status="refunded",
                message="Reembolso processado com sucesso",
                refunded_at=datetime.now(timezone.utc),
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao processar reembolso"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar reembolso: {str(e)}"
        )


# ===========================================
# PÁGINAS HTML (RETORNO DO CHECKOUT)
# ===========================================

@router.get("/success")
async def payment_success(
    request: Request,
    payment_id: int,
):
    """Página de sucesso do pagamento"""
    # TODO: Renderizar template
    return {"message": "Pagamento aprovado!", "payment_id": payment_id}


@router.get("/pending")
async def payment_pending(
    request: Request,
    payment_id: int,
):
    """Página de pagamento pendente"""
    # TODO: Renderizar template
    return {"message": "Pagamento pendente", "payment_id": payment_id}


@router.get("/failure")
async def payment_failure(
    request: Request,
    payment_id: int,
):
    """Página de falha no pagamento"""
    # TODO: Renderizar template
    return {"message": "Pagamento rejeitado", "payment_id": payment_id}
