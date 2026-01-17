"""
Router de Marketplace - Rifei
Rotas para listagem, busca e visualização de rifas
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pathlib import Path

from app.config import settings
from app.database import get_db
from app.models.models import User, Rifa, UserRole, RifaStatus
from app.dependencies import get_current_user, get_optional_user, OptionalUser
from app.schemas.marketplace import (
    RifaResponse,
    RifaDetailResponse,
    RifaListResponse,
    RifaListItem,
    RifaCreate,
    RifaUpdate,
    RifaFilters,
    CategoryResponse,
    RifaStats,
    MarketplaceStats,
    MessageResponse,
)
from app.services import marketplace as marketplace_service


# ===========================================
# CONFIGURAÇÃO
# ===========================================

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


# ===========================================
# ROTAS DE API - LISTAGEM E BUSCA
# ===========================================

@router.get("/api/rifas", response_model=RifaListResponse)
async def api_list_rifas(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    status: Optional[RifaStatus] = Query(None),
    is_featured: Optional[bool] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Lista rifas com filtros e paginação.
    """
    # Criar objeto de filtros
    filters = RifaFilters(
        search=search,
        category_id=category_id,
        status=status,
        is_featured=is_featured,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        per_page=per_page,
    )

    # Buscar rifas
    rifas, total = await marketplace_service.list_rifas(db, filters)

    # Converter para lista de items
    items = []
    for rifa in rifas:
        item = RifaListItem(
            id=rifa.id,
            title=rifa.title,
            slug=rifa.slug,
            image_url=rifa.image_url,
            price=rifa.price,
            total_numbers=rifa.total_numbers,
            sold_count=rifa.sold_count,
            status=rifa.status,
            end_date=rifa.end_date,
            is_featured=rifa.is_featured,
            is_verified=rifa.is_verified,
            creator_username=rifa.creator.username if rifa.creator else None,
            category_name=rifa.category.name if rifa.category else None,
            progress_percent=rifa.progress_percent,
        )
        items.append(item)

    # Calcular paginação
    total_pages = (total + per_page - 1) // per_page
    has_next = page < total_pages
    has_prev = page > 1

    return RifaListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev,
    )


@router.get("/api/rifas/featured", response_model=list[RifaListItem])
async def api_featured_rifas(
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Retorna rifas em destaque."""
    rifas = await marketplace_service.get_featured_rifas(db, limit)

    items = []
    for rifa in rifas:
        item = RifaListItem(
            id=rifa.id,
            title=rifa.title,
            slug=rifa.slug,
            image_url=rifa.image_url,
            price=rifa.price,
            total_numbers=rifa.total_numbers,
            sold_count=rifa.sold_count,
            status=rifa.status,
            end_date=rifa.end_date,
            is_featured=rifa.is_featured,
            is_verified=rifa.is_verified,
            creator_username=rifa.creator.username if rifa.creator else None,
            category_name=rifa.category.name if rifa.category else None,
            progress_percent=rifa.progress_percent,
        )
        items.append(item)

    return items


@router.get("/api/rifas/ending-soon", response_model=list[RifaListItem])
async def api_ending_soon_rifas(
    days: int = Query(3, ge=1, le=30),
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Retorna rifas terminando em breve."""
    rifas = await marketplace_service.get_ending_soon_rifas(db, days, limit)

    items = []
    for rifa in rifas:
        item = RifaListItem(
            id=rifa.id,
            title=rifa.title,
            slug=rifa.slug,
            image_url=rifa.image_url,
            price=rifa.price,
            total_numbers=rifa.total_numbers,
            sold_count=rifa.sold_count,
            status=rifa.status,
            end_date=rifa.end_date,
            is_featured=rifa.is_featured,
            is_verified=rifa.is_verified,
            creator_username=rifa.creator.username if rifa.creator else None,
            category_name=rifa.category.name if rifa.category else None,
            progress_percent=rifa.progress_percent,
        )
        items.append(item)

    return items


# ===========================================
# ROTAS DE API - DETALHES
# ===========================================

@router.get("/api/rifas/{rifa_id}", response_model=RifaDetailResponse)
async def api_get_rifa(
    rifa_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Retorna detalhes de uma rifa específica."""
    rifa = await marketplace_service.get_rifa_by_id(db, rifa_id, increment_view=True)

    if not rifa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rifa não encontrada"
        )

    # Buscar números disponíveis
    available_numbers = await marketplace_service.get_available_numbers(db, rifa.id)

    # Buscar estatísticas
    stats = await marketplace_service.get_rifa_stats(db, rifa.id)

    return RifaDetailResponse(
        id=rifa.id,
        title=rifa.title,
        slug=rifa.slug,
        description=rifa.description,
        image_url=rifa.image_url,
        images=rifa.images,
        price=rifa.price,
        total_numbers=rifa.total_numbers,
        min_numbers=rifa.min_numbers,
        max_numbers_per_user=rifa.max_numbers_per_user,
        status=rifa.status,
        start_date=rifa.start_date,
        end_date=rifa.end_date,
        draw_date=rifa.draw_date,
        winner_number=rifa.winner_number,
        winner_id=rifa.winner_id,
        draw_proof=rifa.draw_proof,
        sold_count=rifa.sold_count,
        view_count=rifa.view_count,
        is_featured=rifa.is_featured,
        is_verified=rifa.is_verified,
        creator_id=rifa.creator_id,
        creator_name=rifa.creator.name if rifa.creator else None,
        creator_username=rifa.creator.username if rifa.creator else None,
        category_id=rifa.category_id,
        category_name=rifa.category.name if rifa.category else None,
        created_at=rifa.created_at,
        updated_at=rifa.updated_at,
        progress_percent=rifa.progress_percent,
        available_count=rifa.available_count,
        available_numbers=available_numbers[:100],  # Limitar a 100
        unique_buyers=stats.get("unique_buyers"),
        last_purchase=stats.get("last_purchase"),
    )


@router.get("/api/rifas/slug/{slug}", response_model=RifaDetailResponse)
async def api_get_rifa_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Retorna detalhes de uma rifa por slug."""
    rifa = await marketplace_service.get_rifa_by_slug(db, slug, increment_view=True)

    if not rifa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rifa não encontrada"
        )

    # Mesma lógica do endpoint anterior
    available_numbers = await marketplace_service.get_available_numbers(db, rifa.id)
    stats = await marketplace_service.get_rifa_stats(db, rifa.id)

    return RifaDetailResponse(
        id=rifa.id,
        title=rifa.title,
        slug=rifa.slug,
        description=rifa.description,
        image_url=rifa.image_url,
        images=rifa.images,
        price=rifa.price,
        total_numbers=rifa.total_numbers,
        min_numbers=rifa.min_numbers,
        max_numbers_per_user=rifa.max_numbers_per_user,
        status=rifa.status,
        start_date=rifa.start_date,
        end_date=rifa.end_date,
        draw_date=rifa.draw_date,
        winner_number=rifa.winner_number,
        winner_id=rifa.winner_id,
        draw_proof=rifa.draw_proof,
        sold_count=rifa.sold_count,
        view_count=rifa.view_count,
        is_featured=rifa.is_featured,
        is_verified=rifa.is_verified,
        creator_id=rifa.creator_id,
        creator_name=rifa.creator.name if rifa.creator else None,
        creator_username=rifa.creator.username if rifa.creator else None,
        category_id=rifa.category_id,
        category_name=rifa.category.name if rifa.category else None,
        created_at=rifa.created_at,
        updated_at=rifa.updated_at,
        progress_percent=rifa.progress_percent,
        available_count=rifa.available_count,
        available_numbers=available_numbers[:100],
        unique_buyers=stats.get("unique_buyers"),
        last_purchase=stats.get("last_purchase"),
    )


# ===========================================
# ROTAS DE API - CATEGORIAS
# ===========================================

@router.get("/api/categories", response_model=list[CategoryResponse])
async def api_list_categories(
    db: AsyncSession = Depends(get_db),
):
    """Lista todas as categorias ativas."""
    categories = await marketplace_service.list_categories(db, active_only=True)

    return [
        CategoryResponse(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            icon=cat.icon,
            description=cat.description,
            is_active=cat.is_active,
            order=cat.order,
            created_at=cat.created_at,
        )
        for cat in categories
    ]


# ===========================================
# ROTAS DE API - ESTATÍSTICAS
# ===========================================

@router.get("/api/rifas/{rifa_id}/stats", response_model=RifaStats)
async def api_rifa_stats(
    rifa_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Retorna estatísticas de uma rifa."""
    rifa = await marketplace_service.get_rifa_by_id(db, rifa_id)

    if not rifa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rifa não encontrada"
        )

    stats = await marketplace_service.get_rifa_stats(db, rifa_id)

    return RifaStats(**stats)


@router.get("/api/stats", response_model=MarketplaceStats)
async def api_marketplace_stats(
    db: AsyncSession = Depends(get_db),
):
    """Retorna estatísticas gerais do marketplace."""
    stats = await marketplace_service.get_marketplace_stats(db)

    return MarketplaceStats(**stats)


# ===========================================
# ROTAS DE API - CRIAÇÃO E EDIÇÃO (CRIADORES)
# ===========================================

@router.post("/api/rifas", response_model=RifaResponse, status_code=status.HTTP_201_CREATED)
async def api_create_rifa(
    rifa_data: RifaCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Cria uma nova rifa.
    Requer usuário autenticado com role CREATOR ou ADMIN.
    """
    # Verificar permissões
    if current_user.role not in [UserRole.CREATOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas criadores podem criar rifas"
        )

    # Verificar se slug já existe
    if await marketplace_service.check_slug_exists(db, rifa_data.slug):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este slug já está em uso"
        )

    # Criar rifa
    rifa = await marketplace_service.create_rifa(db, rifa_data, current_user.id)

    return RifaResponse(
        id=rifa.id,
        title=rifa.title,
        slug=rifa.slug,
        description=rifa.description,
        image_url=rifa.image_url,
        images=rifa.images,
        price=rifa.price,
        total_numbers=rifa.total_numbers,
        min_numbers=rifa.min_numbers,
        max_numbers_per_user=rifa.max_numbers_per_user,
        status=rifa.status,
        start_date=rifa.start_date,
        end_date=rifa.end_date,
        draw_date=rifa.draw_date,
        winner_number=rifa.winner_number,
        winner_id=rifa.winner_id,
        draw_proof=rifa.draw_proof,
        sold_count=rifa.sold_count,
        view_count=rifa.view_count,
        is_featured=rifa.is_featured,
        is_verified=rifa.is_verified,
        creator_id=rifa.creator_id,
        category_id=rifa.category_id,
        created_at=rifa.created_at,
        updated_at=rifa.updated_at,
        progress_percent=rifa.progress_percent,
        available_count=rifa.available_count,
    )


@router.put("/api/rifas/{rifa_id}", response_model=RifaResponse)
async def api_update_rifa(
    rifa_id: int,
    rifa_data: RifaUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Atualiza uma rifa.
    Apenas o criador ou admin pode atualizar.
    """
    # Buscar rifa
    rifa = await marketplace_service.get_rifa_by_id(db, rifa_id)

    if not rifa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rifa não encontrada"
        )

    # Verificar permissões
    if rifa.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para editar esta rifa"
        )

    # Atualizar rifa
    rifa = await marketplace_service.update_rifa(db, rifa, rifa_data)

    return RifaResponse(
        id=rifa.id,
        title=rifa.title,
        slug=rifa.slug,
        description=rifa.description,
        image_url=rifa.image_url,
        images=rifa.images,
        price=rifa.price,
        total_numbers=rifa.total_numbers,
        min_numbers=rifa.min_numbers,
        max_numbers_per_user=rifa.max_numbers_per_user,
        status=rifa.status,
        start_date=rifa.start_date,
        end_date=rifa.end_date,
        draw_date=rifa.draw_date,
        winner_number=rifa.winner_number,
        winner_id=rifa.winner_id,
        draw_proof=rifa.draw_proof,
        sold_count=rifa.sold_count,
        view_count=rifa.view_count,
        is_featured=rifa.is_featured,
        is_verified=rifa.is_verified,
        creator_id=rifa.creator_id,
        category_id=rifa.category_id,
        created_at=rifa.created_at,
        updated_at=rifa.updated_at,
        progress_percent=rifa.progress_percent,
        available_count=rifa.available_count,
    )


@router.delete("/api/rifas/{rifa_id}", response_model=MessageResponse)
async def api_delete_rifa(
    rifa_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Deleta uma rifa.
    Apenas o criador ou admin pode deletar.
    Apenas rifas sem vendas podem ser deletadas.
    """
    # Buscar rifa
    rifa = await marketplace_service.get_rifa_by_id(db, rifa_id)

    if not rifa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rifa não encontrada"
        )

    # Verificar permissões
    if rifa.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para deletar esta rifa"
        )

    # Verificar se tem vendas
    if rifa.sold_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar rifas com números já vendidos"
        )

    # Deletar rifa
    await marketplace_service.delete_rifa(db, rifa)

    return MessageResponse(
        message="Rifa deletada com sucesso",
        success=True
    )
