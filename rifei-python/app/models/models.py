"""
Models do banco de dados - Rifei
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import (
    String, Integer, Text, Boolean, DateTime, Numeric, 
    ForeignKey, Enum as SQLEnum, JSON, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


# ===========================================
# ENUMS
# ===========================================

class UserRole(str, enum.Enum):
    USER = "user"
    CREATOR = "creator"
    ADMIN = "admin"


class RifaStatus(str, enum.Enum):
    DRAFT = "draft"           # Rascunho
    ACTIVE = "active"         # Ativa (vendendo)
    COMPLETED = "completed"   # Finalizada (sorteio realizado)
    CANCELLED = "cancelled"   # Cancelada


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentMethod(str, enum.Enum):
    PIX = "pix"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"


# ===========================================
# MIXINS
# ===========================================

class TimestampMixin:
    """Mixin para campos de timestamp"""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


# ===========================================
# MODELS
# ===========================================

class User(Base, TimestampMixin):
    """Usuário da plataforma"""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Perfil
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Status e permissões
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.USER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Gamificação
    level: Mapped[int] = mapped_column(Integer, default=1)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    total_wins: Mapped[int] = mapped_column(Integer, default=0)
    total_spent: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    
    # Relacionamentos
    rifas: Mapped[List["Rifa"]] = relationship(
        "Rifa",
        back_populates="creator",
        foreign_keys="[Rifa.creator_id]"
    )
    tickets: Mapped[List["Ticket"]] = relationship("Ticket", back_populates="user")
    payments: Mapped[List["Payment"]] = relationship("Payment", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.username}>"


class Category(Base, TimestampMixin):
    """Categoria de rifas"""
    __tablename__ = "categories"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    icon: Mapped[str] = mapped_column(String(50), default="🎁")
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relacionamentos
    rifas: Mapped[List["Rifa"]] = relationship("Rifa", back_populates="category")
    
    def __repr__(self):
        return f"<Category {self.name}>"


class Rifa(Base, TimestampMixin):
    """Rifa/Sorteio"""
    __tablename__ = "rifas"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Básico
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Imagens
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    images: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    
    # Configuração da rifa
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    total_numbers: Mapped[int] = mapped_column(Integer, nullable=False)
    min_numbers: Mapped[int] = mapped_column(Integer, default=1)
    max_numbers_per_user: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Status e datas
    status: Mapped[RifaStatus] = mapped_column(SQLEnum(RifaStatus), default=RifaStatus.DRAFT)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    draw_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Resultado
    winner_number: Mapped[Optional[int]] = mapped_column(Integer)
    winner_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"))
    draw_proof: Mapped[Optional[str]] = mapped_column(String(500))  # URL do vídeo/prova
    
    # Contadores (cache)
    sold_count: Mapped[int] = mapped_column(Integer, default=0)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Flags
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relacionamentos
    creator_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    creator: Mapped["User"] = relationship("User", back_populates="rifas")
    
    category_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("categories.id"))
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="rifas")
    
    tickets: Mapped[List["Ticket"]] = relationship("Ticket", back_populates="rifa")
    
    # Índices
    __table_args__ = (
        Index("ix_rifas_status_end_date", "status", "end_date"),
        Index("ix_rifas_creator_status", "creator_id", "status"),
    )
    
    @property
    def progress_percent(self) -> float:
        if self.total_numbers == 0:
            return 0
        return (self.sold_count / self.total_numbers) * 100
    
    @property
    def available_count(self) -> int:
        return self.total_numbers - self.sold_count
    
    def __repr__(self):
        return f"<Rifa {self.title}>"


class Ticket(Base, TimestampMixin):
    """Número comprado em uma rifa"""
    __tablename__ = "tickets"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Número
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Status
    is_winner: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relacionamentos
    rifa_id: Mapped[int] = mapped_column(Integer, ForeignKey("rifas.id"), nullable=False)
    rifa: Mapped["Rifa"] = relationship("Rifa", back_populates="tickets")
    
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="tickets")
    
    payment_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("payments.id"))
    payment: Mapped[Optional["Payment"]] = relationship("Payment", back_populates="tickets")
    
    # Índices (garantir unicidade: um número por rifa)
    __table_args__ = (
        Index("ix_tickets_rifa_number", "rifa_id", "number", unique=True),
        Index("ix_tickets_user_rifa", "user_id", "rifa_id"),
    )
    
    def __repr__(self):
        return f"<Ticket #{self.number} - Rifa {self.rifa_id}>"


class Payment(Base, TimestampMixin):
    """Pagamento"""
    __tablename__ = "payments"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Mercado Pago
    mp_payment_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True)
    mp_preference_id: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Valores
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    net_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    
    # Status e método
    status: Mapped[PaymentStatus] = mapped_column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    method: Mapped[Optional[PaymentMethod]] = mapped_column(SQLEnum(PaymentMethod))
    
    # Metadados
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSON, default=dict)
    
    # Datas
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # PIX
    pix_qr_code: Mapped[Optional[str]] = mapped_column(Text)
    pix_qr_code_base64: Mapped[Optional[str]] = mapped_column(Text)
    pix_copy_paste: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relacionamentos
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="payments")
    
    rifa_id: Mapped[int] = mapped_column(Integer, ForeignKey("rifas.id"), nullable=False)
    
    tickets: Mapped[List["Ticket"]] = relationship("Ticket", back_populates="payment")
    
    def __repr__(self):
        return f"<Payment {self.id} - {self.status}>"


class FeedPost(Base, TimestampMixin):
    """Post no feed social"""
    __tablename__ = "feed_posts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Tipo de post
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # winner, new_rifa, achievement, comment
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Metadados específicos do tipo
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSON, default=dict)
    
    # Contadores
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    comments_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relacionamentos
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    rifa_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("rifas.id"))
    
    def __repr__(self):
        return f"<FeedPost {self.id} - {self.type}>"
