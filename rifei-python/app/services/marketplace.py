"""
Service de Marketplace - Rifei
Funções para gestão de rifas, categorias e marketplace
"""
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional, List, Tuple
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.models import (
    Rifa,
    Category,
    User,
    Ticket,
    RifaStatus,
)
from app.schemas.marketplace import (
    RifaCreate,
    RifaUpdate,
    RifaFilters,
    RifaListItem,
)


# ===========================================
# RIFAS - CRUD
# ===========================================

async def create_rifa(
    db: AsyncSession,
    rifa_data: RifaCreate,
    creator_id: int
) -> Rifa:
    """
    Cria uma nova rifa

    Args:
        db: Sessão do banco de dados
        rifa_data: Dados da rifa
        creator_id: ID do criador

    Returns:
        Rifa criada
    """
    rifa = Rifa(
        **rifa_data.model_dump(exclude={'images'}),
        creator_id=creator_id,
        images=rifa_data.images or [],
        status=RifaStatus.DRAFT,
    )

    db.add(rifa)
    await db.commit()
    await db.refresh(rifa)

    return rifa


async def get_rifa_by_id(
    db: AsyncSession,
    rifa_id: int,
    increment_view: bool = False
) -> Optional[Rifa]:
    """
    Busca rifa por ID

    Args:
        db: Sessão do banco de dados
        rifa_id: ID da rifa
        increment_view: Se True, incrementa contador de visualizações

    Returns:
        Rifa encontrada ou None
    """
    result = await db.execute(
        select(Rifa)
        .where(Rifa.id == rifa_id)
        .options(
            selectinload(Rifa.creator),
            selectinload(Rifa.category)
        )
    )
    rifa = result.scalar_one_or_none()

    if rifa and increment_view:
        rifa.view_count += 1
        await db.commit()
        await db.refresh(rifa)

    return rifa


async def get_rifa_by_slug(
    db: AsyncSession,
    slug: str,
    increment_view: bool = False
) -> Optional[Rifa]:
    """Busca rifa por slug"""
    result = await db.execute(
        select(Rifa)
        .where(Rifa.slug == slug)
        .options(
            selectinload(Rifa.creator),
            selectinload(Rifa.category)
        )
    )
    rifa = result.scalar_one_or_none()

    if rifa and increment_view:
        rifa.view_count += 1
        await db.commit()
        await db.refresh(rifa)

    return rifa


async def update_rifa(
    db: AsyncSession,
    rifa: Rifa,
    rifa_data: RifaUpdate
) -> Rifa:
    """
    Atualiza dados de uma rifa

    Args:
        db: Sessão do banco de dados
        rifa: Rifa a ser atualizada
        rifa_data: Novos dados

    Returns:
        Rifa atualizada
    """
    update_data = rifa_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(rifa, field, value)

    await db.commit()
    await db.refresh(rifa)

    return rifa


async def delete_rifa(db: AsyncSession, rifa: Rifa) -> None:
    """
    Deleta uma rifa (apenas se não tiver vendas)

    Args:
        db: Sessão do banco de dados
        rifa: Rifa a ser deletada
    """
    await db.delete(rifa)
    await db.commit()


async def check_slug_exists(db: AsyncSession, slug: str, exclude_id: Optional[int] = None) -> bool:
    """Verifica se slug já está em uso"""
    query = select(Rifa).where(Rifa.slug == slug)

    if exclude_id:
        query = query.where(Rifa.id != exclude_id)

    result = await db.execute(query)
    return result.scalar_one_or_none() is not None


# ===========================================
# LISTAGEM E BUSCA
# ===========================================

async def list_rifas(
    db: AsyncSession,
    filters: RifaFilters
) -> Tuple[List[Rifa], int]:
    """
    Lista rifas com filtros e paginação

    Args:
        db: Sessão do banco de dados
        filters: Filtros de busca

    Returns:
        Tupla (rifas, total)
    """
    # Query base
    query = select(Rifa).options(
        selectinload(Rifa.creator),
        selectinload(Rifa.category)
    )

    # Aplicar filtros
    conditions = []

    # Busca textual
    if filters.search:
        search_term = f"%{filters.search}%"
        conditions.append(
            or_(
                Rifa.title.ilike(search_term),
                Rifa.description.ilike(search_term)
            )
        )

    # Categoria
    if filters.category_id:
        conditions.append(Rifa.category_id == filters.category_id)

    # Status
    if filters.status:
        conditions.append(Rifa.status == filters.status)
    else:
        # Por padrão, mostrar apenas rifas ativas
        conditions.append(Rifa.status == RifaStatus.ACTIVE)

    # Featured e Verified
    if filters.is_featured is not None:
        conditions.append(Rifa.is_featured == filters.is_featured)

    if filters.is_verified is not None:
        conditions.append(Rifa.is_verified == filters.is_verified)

    # Criador
    if filters.creator_id:
        conditions.append(Rifa.creator_id == filters.creator_id)

    # Faixa de preço
    if filters.min_price is not None:
        conditions.append(Rifa.price >= filters.min_price)

    if filters.max_price is not None:
        conditions.append(Rifa.price <= filters.max_price)

    # Aplicar condições
    if conditions:
        query = query.where(and_(*conditions))

    # Total de resultados (antes da paginação)
    count_query = select(func.count()).select_from(Rifa)
    if conditions:
        count_query = count_query.where(and_(*conditions))

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Ordenação
    sort_column = getattr(Rifa, filters.sort_by, Rifa.created_at)
    if filters.sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    # Paginação
    offset = (filters.page - 1) * filters.per_page
    query = query.limit(filters.per_page).offset(offset)

    # Executar query
    result = await db.execute(query)
    rifas = result.scalars().all()

    return list(rifas), total


async def get_featured_rifas(
    db: AsyncSession,
    limit: int = 6
) -> List[Rifa]:
    """
    Busca rifas em destaque

    Args:
        db: Sessão do banco de dados
        limit: Número máximo de rifas

    Returns:
        Lista de rifas em destaque
    """
    result = await db.execute(
        select(Rifa)
        .where(
            and_(
                Rifa.is_featured == True,
                Rifa.status == RifaStatus.ACTIVE
            )
        )
        .options(
            selectinload(Rifa.creator),
            selectinload(Rifa.category)
        )
        .order_by(desc(Rifa.created_at))
        .limit(limit)
    )

    return list(result.scalars().all())


async def get_ending_soon_rifas(
    db: AsyncSession,
    days: int = 3,
    limit: int = 6
) -> List[Rifa]:
    """
    Busca rifas que estão terminando em breve

    Args:
        db: Sessão do banco de dados
        days: Número de dias
        limit: Número máximo de rifas

    Returns:
        Lista de rifas terminando em breve
    """
    end_threshold = datetime.now(timezone.utc) + timedelta(days=days)

    result = await db.execute(
        select(Rifa)
        .where(
            and_(
                Rifa.status == RifaStatus.ACTIVE,
                Rifa.end_date <= end_threshold,
                Rifa.end_date > datetime.now(timezone.utc)
            )
        )
        .options(
            selectinload(Rifa.creator),
            selectinload(Rifa.category)
        )
        .order_by(asc(Rifa.end_date))
        .limit(limit)
    )

    return list(result.scalars().all())


async def get_rifas_by_creator(
    db: AsyncSession,
    creator_id: int,
    status: Optional[RifaStatus] = None,
    limit: Optional[int] = None
) -> List[Rifa]:
    """
    Busca rifas de um criador específico

    Args:
        db: Sessão do banco de dados
        creator_id: ID do criador
        status: Filtro de status (opcional)
        limit: Número máximo de rifas

    Returns:
        Lista de rifas do criador
    """
    query = select(Rifa).where(Rifa.creator_id == creator_id)

    if status:
        query = query.where(Rifa.status == status)

    query = query.order_by(desc(Rifa.created_at))

    if limit:
        query = query.limit(limit)

    result = await db.execute(query)
    return list(result.scalars().all())


# ===========================================
# CATEGORIAS
# ===========================================

async def list_categories(
    db: AsyncSession,
    active_only: bool = True
) -> List[Category]:
    """
    Lista todas as categorias

    Args:
        db: Sessão do banco de dados
        active_only: Se True, apenas categorias ativas

    Returns:
        Lista de categorias
    """
    query = select(Category)

    if active_only:
        query = query.where(Category.is_active == True)

    query = query.order_by(Category.order, Category.name)

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_category_by_id(db: AsyncSession, category_id: int) -> Optional[Category]:
    """Busca categoria por ID"""
    result = await db.execute(
        select(Category).where(Category.id == category_id)
    )
    return result.scalar_one_or_none()


async def get_category_by_slug(db: AsyncSession, slug: str) -> Optional[Category]:
    """Busca categoria por slug"""
    result = await db.execute(
        select(Category).where(Category.slug == slug)
    )
    return result.scalar_one_or_none()


# ===========================================
# NÚMEROS DA RIFA
# ===========================================

async def get_available_numbers(
    db: AsyncSession,
    rifa_id: int
) -> List[int]:
    """
    Retorna lista de números disponíveis de uma rifa

    Args:
        db: Sessão do banco de dados
        rifa_id: ID da rifa

    Returns:
        Lista de números disponíveis
    """
    # Buscar a rifa
    rifa = await get_rifa_by_id(db, rifa_id)
    if not rifa:
        return []

    # Buscar números já vendidos
    result = await db.execute(
        select(Ticket.number)
        .where(Ticket.rifa_id == rifa_id)
    )
    sold_numbers = set(result.scalars().all())

    # Retornar números disponíveis
    all_numbers = set(range(1, rifa.total_numbers + 1))
    available = sorted(list(all_numbers - sold_numbers))

    return available


async def check_numbers_available(
    db: AsyncSession,
    rifa_id: int,
    numbers: List[int]
) -> Tuple[bool, List[int]]:
    """
    Verifica se números estão disponíveis

    Args:
        db: Sessão do banco de dados
        rifa_id: ID da rifa
        numbers: Lista de números a verificar

    Returns:
        Tupla (todos_disponiveis, números_indisponíveis)
    """
    # Buscar números já vendidos
    result = await db.execute(
        select(Ticket.number)
        .where(
            and_(
                Ticket.rifa_id == rifa_id,
                Ticket.number.in_(numbers)
            )
        )
    )
    sold_numbers = set(result.scalars().all())

    unavailable = sorted(list(sold_numbers))
    all_available = len(unavailable) == 0

    return all_available, unavailable


# ===========================================
# ESTATÍSTICAS
# ===========================================

async def get_rifa_stats(db: AsyncSession, rifa_id: int) -> dict:
    """
    Obtém estatísticas de uma rifa

    Args:
        db: Sessão do banco de dados
        rifa_id: ID da rifa

    Returns:
        Dicionário com estatísticas
    """
    rifa = await get_rifa_by_id(db, rifa_id)
    if not rifa:
        return {}

    # Compradores únicos
    unique_buyers_result = await db.execute(
        select(func.count(func.distinct(Ticket.user_id)))
        .where(Ticket.rifa_id == rifa_id)
    )
    unique_buyers = unique_buyers_result.scalar() or 0

    # Receita total
    total_revenue = rifa.price * rifa.sold_count

    # Tempo restante
    now = datetime.now(timezone.utc)
    time_diff = rifa.end_date - now if rifa.end_date > now else timedelta(0)
    days_remaining = time_diff.days
    hours_remaining = time_diff.seconds // 3600

    # Última compra
    last_purchase_result = await db.execute(
        select(Ticket.created_at)
        .where(Ticket.rifa_id == rifa_id)
        .order_by(desc(Ticket.created_at))
        .limit(1)
    )
    last_purchase = last_purchase_result.scalar_one_or_none()

    return {
        "rifa_id": rifa.id,
        "total_numbers": rifa.total_numbers,
        "sold_count": rifa.sold_count,
        "available_count": rifa.available_count,
        "progress_percent": rifa.progress_percent,
        "unique_buyers": unique_buyers,
        "total_revenue": total_revenue,
        "days_remaining": days_remaining if days_remaining >= 0 else 0,
        "hours_remaining": hours_remaining if days_remaining >= 0 else 0,
        "last_purchase": last_purchase,
    }


async def get_marketplace_stats(db: AsyncSession) -> dict:
    """
    Obtém estatísticas gerais do marketplace

    Args:
        db: Sessão do banco de dados

    Returns:
        Dicionário com estatísticas
    """
    # Total de rifas
    total_rifas_result = await db.execute(
        select(func.count()).select_from(Rifa)
    )
    total_rifas = total_rifas_result.scalar()

    # Rifas ativas
    active_rifas_result = await db.execute(
        select(func.count())
        .select_from(Rifa)
        .where(Rifa.status == RifaStatus.ACTIVE)
    )
    active_rifas = active_rifas_result.scalar()

    # Rifas completas
    completed_rifas_result = await db.execute(
        select(func.count())
        .select_from(Rifa)
        .where(Rifa.status == RifaStatus.COMPLETED)
    )
    completed_rifas = completed_rifas_result.scalar()

    # Total de usuários
    total_users_result = await db.execute(
        select(func.count()).select_from(User)
    )
    total_users = total_users_result.scalar()

    # Receita total estimada
    revenue_result = await db.execute(
        select(func.sum(Rifa.price * Rifa.sold_count)).select_from(Rifa)
    )
    total_revenue = revenue_result.scalar() or Decimal(0)

    # Categorias populares
    popular_categories_result = await db.execute(
        select(
            Category.name,
            func.count(Rifa.id).label('count')
        )
        .join(Rifa, Category.id == Rifa.category_id)
        .where(Rifa.status == RifaStatus.ACTIVE)
        .group_by(Category.name)
        .order_by(desc('count'))
        .limit(5)
    )
    popular_categories = [
        {"name": row.name, "count": row.count}
        for row in popular_categories_result.all()
    ]

    return {
        "total_rifas": total_rifas,
        "active_rifas": active_rifas,
        "completed_rifas": completed_rifas,
        "total_users": total_users,
        "total_revenue": total_revenue,
        "popular_categories": popular_categories,
    }
