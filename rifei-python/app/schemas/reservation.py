"""
Schemas para Sistema de Reserva Temporária - Rifei
"""
from datetime import datetime
from typing import List
from pydantic import BaseModel, Field


class ReservationCreate(BaseModel):
    """Schema para criar reserva"""
    rifa_id: int
    numbers: List[int] = Field(..., min_length=1, max_length=100)


class ReservationResponse(BaseModel):
    """Schema de resposta de reserva"""
    id: str  # UUID
    rifa_id: int
    user_id: int
    numbers: List[int]
    expires_at: datetime
    total_amount: float
    status: str  # pending, confirmed, expired, cancelled


class ReservationCheck(BaseModel):
    """Schema para verificar status da reserva"""
    id: str
    is_valid: bool
    expires_at: datetime
    time_remaining: int  # segundos
