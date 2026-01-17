"""
Router de Autenticação - Rifei
Rotas para login, cadastro, logout e perfil
"""
from datetime import timedelta
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.models import User
from app.schemas.auth import (
    UserCreate, 
    UserLogin, 
    UserResponse, 
    Token, 
    AuthResponse,
    MessageResponse
)
from app.services.auth import (
    authenticate_user,
    create_user,
    check_email_exists,
    check_username_exists,
    generate_tokens_for_user,
    create_access_token,
    get_token_expiry_seconds,
)
from app.dependencies import get_current_user, get_optional_user, OptionalUser


# ===========================================
# CONFIGURAÇÃO
# ===========================================

router = APIRouter()

# Templates
BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=BASE_DIR / "templates")


# ===========================================
# ROTAS DE PÁGINAS (HTML)
# ===========================================

@router.get("/login", response_class=HTMLResponse, name="login_page")
async def login_page(
    request: Request,
    user: OptionalUser,
    error: Optional[str] = None,
    next: Optional[str] = None,
):
    """Página de login"""
    # Se já logado, redirecionar para home
    if user:
        return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)
    
    return templates.TemplateResponse(
        "pages/login.html",
        {
            "request": request,
            "user": None,
            "error": error,
            "next": next,
        }
    )


@router.get("/cadastro", response_class=HTMLResponse, name="cadastro_page")
async def cadastro_page(
    request: Request,
    user: OptionalUser,
    error: Optional[str] = None,
):
    """Página de cadastro"""
    # Se já logado, redirecionar para home
    if user:
        return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)
    
    return templates.TemplateResponse(
        "pages/cadastro.html",
        {
            "request": request,
            "user": None,
            "error": error,
        }
    )


# ===========================================
# ROTAS DA API
# ===========================================

@router.post("/api/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def api_register(
    user_data: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Registra um novo usuário via API.
    
    Retorna o usuário criado e tokens de autenticação.
    """
    # Verificar se email já existe
    if await check_email_exists(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este email já está cadastrado"
        )
    
    # Verificar se username já existe
    if await check_username_exists(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este nome de usuário já está em uso"
        )
    
    # Criar usuário
    user = await create_user(db, user_data)
    
    # Gerar tokens
    tokens = generate_tokens_for_user(user)
    
    # Setar cookie de sessão
    response.set_cookie(
        key="session_token",
        value=tokens["access_token"],
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=tokens["expires_in"],
    )
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=Token(
            access_token=tokens["access_token"],
            token_type=tokens["token_type"],
            expires_in=tokens["expires_in"]
        ),
        message="Conta criada com sucesso! Bem-vindo ao Rifei!"
    )


@router.post("/api/auth/login", response_model=AuthResponse)
async def api_login(
    login_data: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Autentica um usuário e retorna tokens.
    """
    # Autenticar
    user = await authenticate_user(db, login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar se usuário está ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta conta foi desativada"
        )
    
    # Gerar tokens
    # Se "remember" estiver ativo, aumentar tempo de expiração
    if login_data.remember:
        expires_delta = timedelta(days=30)
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "username": user.username,
                "role": user.role.value,
            },
            expires_delta=expires_delta
        )
        expires_in = int(expires_delta.total_seconds())
    else:
        tokens = generate_tokens_for_user(user)
        access_token = tokens["access_token"]
        expires_in = tokens["expires_in"]
    
    # Setar cookie de sessão
    response.set_cookie(
        key="session_token",
        value=access_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=expires_in,
    )
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=expires_in
        ),
        message="Login realizado com sucesso!"
    )


@router.post("/api/auth/logout", response_model=MessageResponse)
async def api_logout(response: Response):
    """
    Realiza logout removendo o cookie de sessão.
    """
    response.delete_cookie(
        key="session_token",
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
    )
    
    return MessageResponse(
        message="Logout realizado com sucesso",
        success=True
    )


@router.get("/api/auth/me", response_model=UserResponse)
async def api_get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Retorna os dados do usuário autenticado.
    """
    return UserResponse.model_validate(current_user)


@router.get("/api/auth/check")
async def api_check_auth(user: OptionalUser):
    """
    Verifica se o usuário está autenticado.
    Útil para verificações rápidas via JS/HTMX.
    """
    if user:
        return {
            "authenticated": True,
            "user": {
                "id": user.id,
                "name": user.name,
                "username": user.username,
                "avatar_url": user.avatar_url,
            }
        }
    return {"authenticated": False}


@router.post("/api/auth/check-email")
async def api_check_email(
    email: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Verifica se um email já está cadastrado.
    Útil para validação em tempo real no formulário.
    """
    exists = await check_email_exists(db, email)
    return {"exists": exists}


@router.post("/api/auth/check-username")
async def api_check_username(
    username: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Verifica se um username já está em uso.
    Útil para validação em tempo real no formulário.
    """
    exists = await check_username_exists(db, username)
    return {"exists": exists}


# ===========================================
# ROTAS DE FORM (HTMX/FORM SUBMIT)
# ===========================================

@router.post("/auth/register", response_class=HTMLResponse)
async def form_register(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Processa cadastro via formulário HTML.
    Retorna redirecionamento ou página com erro.
    """
    form = await request.form()
    
    name = form.get("name", "").strip()
    username = form.get("username", "").strip()
    email = form.get("email", "").strip()
    password = form.get("password", "")
    
    errors = []
    
    # Validações básicas
    if not name or len(name) < 2:
        errors.append("Nome deve ter pelo menos 2 caracteres")
    
    if not username or len(username) < 3:
        errors.append("Username deve ter pelo menos 3 caracteres")
    
    if not email:
        errors.append("Email é obrigatório")
    
    if not password or len(password) < 6:
        errors.append("Senha deve ter pelo menos 6 caracteres")
    
    # Verificar duplicados
    if not errors:
        if await check_email_exists(db, email):
            errors.append("Este email já está cadastrado")
        
        if await check_username_exists(db, username):
            errors.append("Este nome de usuário já está em uso")
    
    # Se houver erros, retornar página com erros
    if errors:
        return templates.TemplateResponse(
            "pages/cadastro.html",
            {
                "request": request,
                "user": None,
                "error": errors[0],  # Mostrar primeiro erro
                "form_data": {"name": name, "username": username, "email": email},
            },
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        # Criar usuário
        user_data = UserCreate(
            name=name,
            username=username,
            email=email,
            password=password,
        )
        user = await create_user(db, user_data)
        
        # Gerar token e setar cookie
        tokens = generate_tokens_for_user(user)
        
        redirect = RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)
        redirect.set_cookie(
            key="session_token",
            value=tokens["access_token"],
            httponly=True,
            secure=settings.is_production,
            samesite="lax",
            max_age=tokens["expires_in"],
        )
        
        return redirect
        
    except Exception as e:
        return templates.TemplateResponse(
            "pages/cadastro.html",
            {
                "request": request,
                "user": None,
                "error": "Erro ao criar conta. Tente novamente.",
                "form_data": {"name": name, "username": username, "email": email},
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@router.post("/auth/login", response_class=HTMLResponse)
async def form_login(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Processa login via formulário HTML.
    Retorna redirecionamento ou página com erro.
    """
    form = await request.form()
    
    email = form.get("email", "").strip()
    password = form.get("password", "")
    remember = form.get("remember") == "on"
    next_url = form.get("next", "/")
    
    # Autenticar
    user = await authenticate_user(db, email, password)
    
    if not user:
        return templates.TemplateResponse(
            "pages/login.html",
            {
                "request": request,
                "user": None,
                "error": "Email ou senha incorretos",
                "form_data": {"email": email},
                "next": next_url,
            },
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    
    if not user.is_active:
        return templates.TemplateResponse(
            "pages/login.html",
            {
                "request": request,
                "user": None,
                "error": "Esta conta foi desativada",
                "form_data": {"email": email},
                "next": next_url,
            },
            status_code=status.HTTP_403_FORBIDDEN,
        )
    
    # Gerar token
    if remember:
        expires_delta = timedelta(days=30)
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "username": user.username,
                "role": user.role.value,
            },
            expires_delta=expires_delta
        )
        expires_in = int(expires_delta.total_seconds())
    else:
        tokens = generate_tokens_for_user(user)
        access_token = tokens["access_token"]
        expires_in = tokens["expires_in"]
    
    # Redirecionar
    redirect = RedirectResponse(url=next_url, status_code=status.HTTP_302_FOUND)
    redirect.set_cookie(
        key="session_token",
        value=access_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=expires_in,
    )
    
    return redirect


@router.get("/logout", response_class=HTMLResponse)
async def logout_page(response: Response):
    """
    Logout via GET (para links de logout).
    Remove cookie e redireciona para home.
    """
    redirect = RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)
    redirect.delete_cookie(
        key="session_token",
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
    )
    return redirect
