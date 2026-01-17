"""
Schemas para Marketplace - Rifei
Validação de dados para rifas, categorias e marketplace
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict
from app.models.models import RifaStatus


# ===========================================
# CATEGORIA SCHEMAS
# ===========================================

class CategoryResponse(BaseModel):
    """Schema de resposta para categoria"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    icon: str
    description: Optional[str] = None
    is_active: bool
    order: int
    created_at: datetime

    # Contador de rifas (opcional, calculado dinamicamente)
    rifas_count: Optional[int] = None


# ===========================================
# RIFA SCHEMAS
# ===========================================

class RifaCreate(BaseModel):
    """Schema para criação de rifa"""
    title: str = Field(..., min_length=3, max_length=200)
    slug: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)

    # Imagens
    image_url: Optional[str] = None
    images: Optional[List[str]] = []

    # Configuração
    price: Decimal = Field(..., gt=0, le=10000)
    total_numbers: int = Field(..., ge=10, le=100000)
    min_numbers: int = Field(default=1, ge=1)
    max_numbers_per_user: Optional[int] = Field(default=None, ge=1)

    # Datas
    start_date: Optional[datetime] = None
    end_date: datetime

    # Categoria
    category_id: Optional[int] = None

    @field_validator('max_numbers_per_user')
    @classmethod
    def validate_max_numbers(cls, v, info):
        """Valida que max_numbers_per_user não excede total_numbers"""
        if v and 'total_numbers' in info.data:
            if v > info.data['total_numbers']:
                raise ValueError('max_numbers_per_user não pode exceder total_numbers')
        return v


class RifaUpdate(BaseModel):
    """Schema para atualização de rifa"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    price: Optional[Decimal] = Field(None, gt=0, le=10000)
    end_date: Optional[datetime] = None
    status: Optional[RifaStatus] = None
    is_featured: Optional[bool] = None
    category_id: Optional[int] = None


class RifaResponse(BaseModel):
    """Schema de resposta para rifa"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    description: str

    # Imagens
    image_url: Optional[str] = None
    images: Optional[dict] = None

    # Configuração
    price: Decimal
    total_numbers: int
    min_numbers: int
    max_numbers_per_user: Optional[int] = None

    # Status e datas
    status: RifaStatus
    start_date: Optional[datetime] = None
    end_date: datetime
    draw_date: Optional[datetime] = None

    # Resultado
    winner_number: Optional[int] = None
    winner_id: Optional[int] = None
    draw_proof: Optional[str] = None

    # Contadores
    sold_count: int
    view_count: int

    # Flags
    is_featured: bool
    is_verified: bool

    # Criador (ID e nome apenas)
    creator_id: int
    creator_name: Optional[str] = None
    creator_username: Optional[str] = None

    # Categoria
    category_id: Optional[int] = None
    category_name: Optional[str] = None

    # Timestamps
    created_at: datetime
    updated_at: datetime

    # Propriedades computadas
    progress_percent: Optional[float] = None
    available_count: Optional[int] = None


class RifaDetailResponse(RifaResponse):
    """Schema de resposta detalhada para rifa"""
    # Inclui tudo de RifaResponse mais:

    # Números disponíveis (opcional, lista de números)
    available_numbers: Optional[List[int]] = None

    # Estatísticas adicionais
    unique_buyers: Optional[int] = None
    last_purchase: Optional[datetime] = None


class RifaListItem(BaseModel):
    """Schema simplificado para listagem de rifas"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    image_url: Optional[str] = None
    price: Decimal
    total_numbers: int
    sold_count: int
    status: RifaStatus
    end_date: datetime
    is_featured: bool
    is_verified: bool
    creator_username: Optional[str] = None
    category_name: Optional[str] = None
    progress_percent: Optional[float] = None


# ===========================================
# FILTROS E BUSCA
# ===========================================

class RifaFilters(BaseModel):
    """Filtros para busca de rifas"""
    # Busca textual
    search: Optional[str] = Field(None, max_length=200)

    # Filtros
    category_id: Optional[int] = None
    status: Optional[RifaStatus] = None
    is_featured: Optional[bool] = None
    is_verified: Optional[bool] = None
    creator_id: Optional[int] = None

    # Faixa de preço
    min_price: Optional[Decimal] = Field(None, ge=0)
    max_price: Optional[Decimal] = Field(None, ge=0)

    # Ordenação
    sort_by: str = Field(default="created_at", pattern="^(created_at|end_date|price|sold_count|view_count)$")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")

    # Paginação
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)

    @field_validator('max_price')
    @classmethod
    def validate_price_range(cls, v, info):
        """Valida que max_price >= min_price"""
        if v and 'min_price' in info.data and info.data['min_price']:
            if v < info.data['min_price']:
                raise ValueError('max_price deve ser maior ou igual a min_price')
        return v


class RifaListResponse(BaseModel):
    """Schema de resposta para listagem paginada"""
    items: List[RifaListItem]
    total: int
    page: int
    per_page: int
    total_pages: int
    has_next: bool
    has_prev: bool


# ===========================================
# NÚMEROS DA RIFA
# ===========================================

class NumberReserveRequest(BaseModel):
    """Schema para reserva de números"""
    numbers: List[int] = Field(..., min_length=1, max_length=100)

    @field_validator('numbers')
    @classmethod
    def validate_unique_numbers(cls, v):
        """Valida que os números são únicos"""
        if len(v) != len(set(v)):
            raise ValueError('Números duplicados não são permitidos')
        return v


class NumberStatusResponse(BaseModel):
    """Schema de resposta para status de número"""
    number: int
    status: str  # disponivel, reservado, pago, premiado
    user_id: Optional[int] = None
    reserved_until: Optional[datetime] = None


class RifaNumbersResponse(BaseModel):
    """Schema de resposta para números de uma rifa"""
    rifa_id: int
    total_numbers: int
    available_count: int
    sold_count: int
    numbers: List[NumberStatusResponse]


# ===========================================
# ESTATÍSTICAS
# ===========================================

class RifaStats(BaseModel):
    """Estatísticas de uma rifa"""
    rifa_id: int
    total_numbers: int
    sold_count: int
    available_count: int
    progress_percent: float

    # Estatísticas de compradores
    unique_buyers: int
    total_revenue: Decimal

    # Tempo
    days_remaining: Optional[int] = None
    hours_remaining: Optional[int] = None

    # Últimas atividades
    last_purchase: Optional[datetime] = None
    last_view: Optional[datetime] = None


class MarketplaceStats(BaseModel):
    """Estatísticas gerais do marketplace"""
    total_rifas: int
    active_rifas: int
    completed_rifas: int
    total_users: int
    total_revenue: Decimal
    popular_categories: List[dict]


# ===========================================
# MENSAGENS
# ===========================================

class MessageResponse(BaseModel):
    """Resposta genérica com mensagem"""
    message: str
    success: bool = True
    data: Optional[dict] = None
