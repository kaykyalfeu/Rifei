"""
Rifei - Plataforma de Rifas e Sorteios
Aplicação principal FastAPI
"""
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Request, Depends, Query
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import init_db, close_db, get_db
from app.dependencies import get_optional_user, OptionalUser, get_current_user, CurrentUser
from app.models.models import User, RifaStatus
from app.services import marketplace as marketplace_service
from app.schemas.marketplace import RifaFilters

# Importar routers
from app.routers import auth, marketplace

# Diretório base
BASE_DIR = Path(__file__).resolve().parent


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia ciclo de vida da aplicação"""
    # Startup
    print("🚀 Iniciando Rifei...")
    await init_db()
    print("✅ Banco de dados conectado")
    yield
    # Shutdown
    print("👋 Encerrando Rifei...")
    await close_db()


# Criar aplicação FastAPI
app = FastAPI(
    title=settings.app_name,
    description="Plataforma de Rifas e Sorteios com Feed Social",
    version="1.0.0",
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    lifespan=lifespan,
)

# Montar arquivos estáticos
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

# Configurar templates Jinja2
templates = Jinja2Templates(directory=BASE_DIR / "templates")


# ===========================================
# INCLUIR ROUTERS
# ===========================================

# Router de autenticação (inclui rotas de página e API)
app.include_router(auth.router, tags=["auth"])

# Router de marketplace (rifas e categorias)
app.include_router(marketplace.router)


# ===========================================
# Dados mockados para demonstração
# ===========================================

MOCK_CATEGORIES = [
    {"id": 1, "name": "Eletrônicos", "slug": "eletronicos", "icon": "📱", "count": 45},
    {"id": 2, "name": "Veículos", "slug": "veiculos", "icon": "🚗", "count": 23},
    {"id": 3, "name": "Viagens", "slug": "viagens", "icon": "✈️", "count": 18},
    {"id": 4, "name": "Games", "slug": "games", "icon": "🎮", "count": 34},
    {"id": 5, "name": "Casa", "slug": "casa", "icon": "🏠", "count": 28},
    {"id": 6, "name": "Moda", "slug": "moda", "icon": "👗", "count": 15},
    {"id": 7, "name": "Esportes", "slug": "esportes", "icon": "⚽", "count": 12},
    {"id": 8, "name": "Outros", "slug": "outros", "icon": "🎁", "count": 8},
]

MOCK_RIFAS = [
    {
        "id": 1,
        "title": "iPhone 15 Pro Max 256GB",
        "slug": "iphone-15-pro-max-256gb",
        "description": "iPhone 15 Pro Max novinho, lacrado, com nota fiscal!",
        "image_url": None,
        "price": 5.00,
        "total_numbers": 100,
        "sold_count": 78,
        "progress_percent": 78,
        "is_featured": True,
        "creator": {"name": "TechStore", "is_verified": True},
    },
    {
        "id": 2,
        "title": "PlayStation 5 + 3 Jogos",
        "slug": "playstation-5-3-jogos",
        "description": "PS5 com 3 jogos à sua escolha!",
        "image_url": None,
        "price": 3.00,
        "total_numbers": 200,
        "sold_count": 156,
        "progress_percent": 78,
        "is_featured": False,
        "creator": {"name": "GameWorld", "is_verified": True},
    },
    {
        "id": 3,
        "title": "Viagem para Cancún - Casal",
        "slug": "viagem-cancun-casal",
        "description": "Pacote completo para Cancún, 7 dias, all inclusive!",
        "image_url": None,
        "price": 10.00,
        "total_numbers": 500,
        "sold_count": 423,
        "progress_percent": 84.6,
        "is_featured": True,
        "creator": {"name": "ViagemDream", "is_verified": True},
    },
    {
        "id": 4,
        "title": "MacBook Air M3",
        "slug": "macbook-air-m3",
        "description": "MacBook Air com chip M3, 8GB RAM, 256GB SSD",
        "image_url": None,
        "price": 8.00,
        "total_numbers": 150,
        "sold_count": 89,
        "progress_percent": 59.3,
        "is_featured": False,
        "creator": {"name": "AppleBR", "is_verified": False},
    },
    {
        "id": 5,
        "title": "Moto Honda CB 500F 0km",
        "slug": "moto-honda-cb-500f-0km",
        "description": "Honda CB 500F zero quilômetro, documentação inclusa!",
        "image_url": None,
        "price": 15.00,
        "total_numbers": 1000,
        "sold_count": 734,
        "progress_percent": 73.4,
        "is_featured": True,
        "creator": {"name": "MotoShop", "is_verified": True},
    },
    {
        "id": 6,
        "title": "Smart TV 65\" 4K Samsung",
        "slug": "smart-tv-65-4k-samsung",
        "description": "TV Samsung 65 polegadas, 4K, Smart, nova!",
        "image_url": None,
        "price": 4.00,
        "total_numbers": 200,
        "sold_count": 145,
        "progress_percent": 72.5,
        "is_featured": False,
        "creator": {"name": "EletroMais", "is_verified": True},
    },
]


# ===========================================
# ROTAS PRINCIPAIS
# ===========================================

@app.get("/", response_class=HTMLResponse)
async def home(
    request: Request,
    user: OptionalUser,
):
    """Página inicial"""
    return templates.TemplateResponse(
        "pages/home.html",
        {
            "request": request,
            "user": user,  # Agora passa o usuário real se logado
            "categories": MOCK_CATEGORIES,
            "featured_rifas": [r for r in MOCK_RIFAS if r.get("is_featured")],
        }
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "app": settings.app_name}


# ===========================================
# ROTAS PRINCIPAIS DO MARKETPLACE
# ===========================================

@app.get("/marketplace", response_class=HTMLResponse)
async def marketplace_page(
    request: Request,
    user: OptionalUser,
    db: AsyncSession = Depends(get_db),
    search: Optional[str] = Query(None),
    category: Optional[int] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    sort: Optional[str] = Query("created_at:desc"),
    page: int = Query(1, ge=1),
):
    """Página do marketplace com rifas reais"""
    # Parse sort parameter
    sort_by, sort_order = sort.split(":") if ":" in sort else ("created_at", "desc")

    # Build filters
    filters = RifaFilters(
        search=search,
        category_id=category,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        per_page=12,
        status=RifaStatus.ACTIVE,
    )

    # Get rifas and categories from database
    rifas, total = await marketplace_service.list_rifas(db, filters)
    categories = await marketplace_service.list_categories(db)

    # Build pagination info
    total_pages = (total + filters.per_page - 1) // filters.per_page
    pagination = {
        "total": total,
        "page": page,
        "per_page": filters.per_page,
        "total_pages": total_pages,
        "has_prev": page > 1,
        "has_next": page < total_pages,
    }

    return templates.TemplateResponse(
        "pages/marketplace.html",
        {
            "request": request,
            "user": user,
            "rifas": rifas,
            "categories": categories,
            "filters": filters,
            "pagination": pagination,
        }
    )


@app.get("/rifa/{slug}", response_class=HTMLResponse)
async def rifa_detail_page(
    request: Request,
    slug: str,
    user: OptionalUser,
    db: AsyncSession = Depends(get_db),
):
    """Página de detalhe da rifa"""
    # Get rifa by slug
    rifa = await marketplace_service.get_rifa_by_slug(db, slug, increment_view=True)

    if not rifa:
        return RedirectResponse(url="/marketplace")

    # Get available numbers
    available_numbers = await marketplace_service.get_available_numbers(db, rifa.id)

    # Get categories for sidebar
    categories = await marketplace_service.list_categories(db)

    return templates.TemplateResponse(
        "pages/rifa_detail.html",
        {
            "request": request,
            "user": user,
            "rifa": rifa,
            "available_numbers": available_numbers,
            "categories": categories,
        }
    )


@app.get("/perfil", response_class=HTMLResponse)
async def perfil_page(
    request: Request,
    user: OptionalUser,
    db: AsyncSession = Depends(get_db),
):
    """Página de perfil do usuário"""
    if not user:
        return RedirectResponse(url="/login?next=/perfil")

    # Get user's created rifas
    created_rifas = await marketplace_service.get_rifas_by_creator(db, user.id)

    # Get categories for sidebar
    categories = await marketplace_service.list_categories(db)

    # Get participations (rifas where user bought tickets)
    # For now, we'll pass empty lists - this will be implemented with tickets service
    participated_rifas = []
    participations_count = 0

    return templates.TemplateResponse(
        "pages/perfil.html",
        {
            "request": request,
            "user": user,
            "created_rifas": created_rifas,
            "participated_rifas": participated_rifas,
            "participations_count": participations_count,
            "categories": categories,
        }
    )


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(
    request: Request,
    user: OptionalUser,
    db: AsyncSession = Depends(get_db),
):
    """Página de dashboard do usuário"""
    if not user:
        return RedirectResponse(url="/login?next=/dashboard")

    # Get user's rifas
    my_rifas = await marketplace_service.get_rifas_by_creator(db, user.id)

    # Get categories for sidebar
    categories = await marketplace_service.list_categories(db)

    # Calculate stats
    total_tickets_sold = sum(r.sold_count for r in my_rifas)
    total_revenue = sum(float(r.price) * r.sold_count for r in my_rifas)
    active_rifas = [r for r in my_rifas if r.status == RifaStatus.ACTIVE]

    stats = {
        "total_rifas": len(my_rifas),
        "active_rifas": len(active_rifas),
        "total_tickets_sold": total_tickets_sold,
        "total_revenue": total_revenue,
    }

    # Participations placeholder
    participations = []

    return templates.TemplateResponse(
        "pages/dashboard.html",
        {
            "request": request,
            "user": user,
            "my_rifas": my_rifas,
            "stats": stats,
            "participations": participations,
            "categories": categories,
        }
    )


@app.get("/configuracoes", response_class=HTMLResponse)
async def configuracoes_page(
    request: Request,
    user: OptionalUser,
    db: AsyncSession = Depends(get_db),
):
    """Página de configurações"""
    if not user:
        return RedirectResponse(url="/login?next=/configuracoes")

    categories = await marketplace_service.list_categories(db)

    return templates.TemplateResponse(
        "pages/configuracoes.html",
        {
            "request": request,
            "user": user,
            "categories": categories,
        }
    )


@app.get("/categoria/{slug}", response_class=HTMLResponse)
async def categoria_page(
    request: Request,
    slug: str,
    user: OptionalUser,
    db: AsyncSession = Depends(get_db),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query("created_at:desc"),
    page: int = Query(1, ge=1),
):
    """Página de categoria"""
    # Get category
    category = await marketplace_service.get_category_by_slug(db, slug)

    if not category:
        return RedirectResponse(url="/marketplace")

    # Parse sort
    sort_by, sort_order = sort.split(":") if ":" in sort else ("created_at", "desc")

    # Build filters
    filters = RifaFilters(
        search=search,
        category_id=category.id,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        per_page=12,
        status=RifaStatus.ACTIVE,
    )

    # Get rifas
    rifas, total = await marketplace_service.list_rifas(db, filters)

    # Get all categories for sidebar
    categories = await marketplace_service.list_categories(db)

    # Pagination
    total_pages = (total + filters.per_page - 1) // filters.per_page
    pagination = {
        "total": total,
        "page": page,
        "per_page": filters.per_page,
        "total_pages": total_pages,
        "has_prev": page > 1,
        "has_next": page < total_pages,
    }

    return templates.TemplateResponse(
        "pages/categoria.html",
        {
            "request": request,
            "user": user,
            "category": category,
            "rifas": rifas,
            "categories": categories,
            "pagination": pagination,
        }
    )


# ===========================================
# ROTAS ADICIONAIS (evitar 404 no menu/footer)
# ===========================================

@app.get("/criar", response_class=HTMLResponse)
async def criar_rifa_page(
    request: Request,
    user: OptionalUser,
    db: AsyncSession = Depends(get_db),
):
    """Página para criar nova rifa"""
    if not user:
        return RedirectResponse(url="/login?next=/criar")

    categories = await marketplace_service.list_categories(db)

    return templates.TemplateResponse(
        "pages/criar.html",
        {
            "request": request,
            "user": user,
            "categories": categories,
        }
    )


@app.get("/feed", response_class=HTMLResponse)
async def feed_page(
    request: Request,
    user: OptionalUser,
    db: AsyncSession = Depends(get_db),
):
    """Página de feed social"""
    categories = await marketplace_service.list_categories(db)

    return templates.TemplateResponse(
        "pages/feed.html",
        {
            "request": request,
            "user": user,
            "categories": categories,
            "feed_posts": [],  # Will be populated later
        }
    )


@app.get("/como-funciona", response_class=HTMLResponse)
async def como_funciona_page(
    request: Request,
    user: OptionalUser,
):
    """Página Como Funciona"""
    return templates.TemplateResponse(
        "pages/como-funciona.html",
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
        }
    )


@app.get("/ajuda", response_class=HTMLResponse)
async def ajuda_page(
    request: Request,
    user: OptionalUser,
):
    """Página de Ajuda/FAQ"""
    return templates.TemplateResponse(
        "pages/ajuda.html",
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
        }
    )


@app.get("/contato", response_class=HTMLResponse)
async def contato_page(
    request: Request,
    user: OptionalUser,
):
    """Página de Contato"""
    return templates.TemplateResponse(
        "pages/contato.html",
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
        }
    )


@app.get("/premium", response_class=HTMLResponse)
async def premium_page(
    request: Request,
    user: OptionalUser,
):
    """Página do Rifei Premium"""
    return templates.TemplateResponse(
        "pages/premium.html",
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
        }
    )


@app.get("/termos", response_class=HTMLResponse)
async def termos_page(
    request: Request,
    user: OptionalUser,
):
    """Página de Termos de Uso"""
    return templates.TemplateResponse(
        "pages/termos.html",
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
        }
    )


@app.get("/privacidade", response_class=HTMLResponse)
async def privacidade_page(
    request: Request,
    user: OptionalUser,
):
    """Página de Política de Privacidade"""
    return templates.TemplateResponse(
        "pages/privacidade.html",
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.is_development,
    )
