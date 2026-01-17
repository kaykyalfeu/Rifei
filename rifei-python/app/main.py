"""
Rifei - Plataforma de Rifas e Sorteios
Aplicação principal FastAPI
"""
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse

from app.config import settings
from app.database import init_db, close_db
from app.dependencies import get_optional_user, OptionalUser
from app.models.models import User

# Importar routers
from app.routers import auth

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
# ROTAS PLACEHOLDER (para links funcionarem)
# ===========================================

@app.get("/marketplace", response_class=HTMLResponse)
async def marketplace(request: Request, user: OptionalUser):
    """Página do marketplace (placeholder)"""
    return templates.TemplateResponse(
        "pages/home.html",  # Temporariamente usa home
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
            "featured_rifas": MOCK_RIFAS,
        }
    )


@app.get("/rifa/{slug}", response_class=HTMLResponse)
async def rifa_detail(request: Request, slug: str, user: OptionalUser):
    """Página de detalhe da rifa (placeholder)"""
    rifa = next((r for r in MOCK_RIFAS if r["slug"] == slug), None)
    if not rifa:
        rifa = MOCK_RIFAS[0]  # Fallback
    
    return templates.TemplateResponse(
        "pages/home.html",  # Temporariamente usa home
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
            "featured_rifas": [rifa],
        }
    )


@app.get("/perfil", response_class=HTMLResponse)
async def perfil(request: Request, user: OptionalUser):
    """Página de perfil (placeholder)"""
    if not user:
        return RedirectResponse(url="/login?next=/perfil")
    
    return templates.TemplateResponse(
        "pages/home.html",
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
            "featured_rifas": [],
        }
    )


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, user: OptionalUser):
    """Página de dashboard (placeholder)"""
    if not user:
        return RedirectResponse(url="/login?next=/dashboard")
    
    return templates.TemplateResponse(
        "pages/home.html",
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
            "featured_rifas": [],
        }
    )


@app.get("/configuracoes", response_class=HTMLResponse)
async def configuracoes(request: Request, user: OptionalUser):
    """Página de configurações (placeholder)"""
    if not user:
        return RedirectResponse(url="/login?next=/configuracoes")
    
    return templates.TemplateResponse(
        "pages/home.html",
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
            "featured_rifas": [],
        }
    )


@app.get("/categoria/{slug}", response_class=HTMLResponse)
async def categoria(request: Request, slug: str, user: OptionalUser):
    """Página de categoria (placeholder)"""
    return templates.TemplateResponse(
        "pages/home.html",
        {
            "request": request,
            "user": user,
            "categories": MOCK_CATEGORIES,
            "featured_rifas": MOCK_RIFAS,
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
