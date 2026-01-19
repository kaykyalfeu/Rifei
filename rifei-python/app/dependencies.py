"""
Dependencies do FastAPI - Rifei
Funções de dependência para injeção em rotas
"""
from typing import Optional, Annotated
from fastapi import Depends, HTTPException, status, Request, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.models import User, UserRole
from app.services.auth import verify_token, get_user_by_id


# ===========================================
# SEGURANÇA
# ===========================================

# Bearer token opcional (para rotas que podem funcionar com ou sem auth)
security = HTTPBearer(auto_error=False)


# ===========================================
# DEPENDENCY: OBTER USUÁRIO ATUAL
# ===========================================

async def get_current_user(
    request: Request,
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)],
    db: AsyncSession = Depends(get_db),
    session_token: Optional[str] = Cookie(default=None, alias="session_token")
) -> User:
    """
    Obtém o usuário atual autenticado.
    
    Verifica nesta ordem:
    1. Bearer token no header Authorization
    2. Token no cookie "session_token"
    
    Raises:
        HTTPException 401: Se não autenticado ou token inválido
    """
    token = None
    
    # 1. Tentar obter token do header Authorization
    if credentials:
        token = credentials.credentials
    
    # 2. Se não houver header, tentar cookie
    if not token and session_token:
        token = session_token
    
    # 3. Sem token = não autenticado
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 4. Verificar token (DEVE ser do tipo "access", não "refresh")
    payload = verify_token(token, token_type="access")

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido, expirado ou tipo incorreto",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 5. Extrair user_id do payload
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: usuário não identificado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: ID de usuário malformado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 6. Buscar usuário no banco
    user = await get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
        )

    # 7. Verificar se usuário está ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário desativado",
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Obtém o usuário atual e verifica se está ativo.
    Atalho para rotas que requerem usuário ativo.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário desativado"
        )
    return current_user


async def get_optional_user(
    request: Request,
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)],
    db: AsyncSession = Depends(get_db),
    session_token: Optional[str] = Cookie(default=None, alias="session_token")
) -> Optional[User]:
    """
    Tenta obter o usuário atual, mas retorna None se não autenticado.
    
    Útil para rotas que funcionam tanto com quanto sem autenticação,
    mas mostram conteúdo diferente para usuários logados.
    """
    token = None
    
    # Tentar obter token do header
    if credentials:
        token = credentials.credentials
    
    # Tentar obter do cookie
    if not token and session_token:
        token = session_token
    
    # Sem token = usuário não logado (mas não é erro)
    if not token:
        return None

    # Verificar token (DEVE ser do tipo "access", não "refresh")
    payload = verify_token(token, token_type="access")

    if not payload:
        return None

    # Extrair user_id do payload
    user_id_str = payload.get("sub")
    if not user_id_str:
        return None

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        return None

    # Buscar usuário
    user = await get_user_by_id(db, user_id)

    if not user or not user.is_active:
        return None

    return user


# ===========================================
# DEPENDENCY: VERIFICAR ROLES
# ===========================================

def require_role(required_roles: list[UserRole]):
    """
    Factory de dependency para verificar se usuário tem uma das roles requeridas.
    
    Uso:
        @router.get("/admin", dependencies=[Depends(require_role([UserRole.ADMIN]))])
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissão insuficiente para esta ação"
            )
        return current_user
    
    return role_checker


async def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Verifica se o usuário atual é admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores"
        )
    return current_user


async def get_creator_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Verifica se o usuário é criador ou admin"""
    allowed_roles = [UserRole.CREATOR, UserRole.ADMIN]
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a criadores"
        )
    return current_user


# ===========================================
# DEPENDENCY: VERIFICAÇÃO DE OWNERSHIP
# ===========================================

def require_owner_or_admin(resource_user_id_param: str = "user_id"):
    """
    Factory para verificar se o usuário atual é dono do recurso ou admin.
    
    Uso:
        @router.delete("/users/{user_id}", dependencies=[Depends(require_owner_or_admin("user_id"))])
    """
    async def owner_checker(
        request: Request,
        current_user: User = Depends(get_current_user)
    ) -> User:
        resource_user_id = request.path_params.get(resource_user_id_param)
        
        if resource_user_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID do recurso não encontrado"
            )
        
        # Admin pode acessar qualquer recurso
        if current_user.role == UserRole.ADMIN:
            return current_user
        
        # Verificar se é o dono
        if int(resource_user_id) != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar este recurso"
            )
        
        return current_user
    
    return owner_checker


# ===========================================
# TYPE HINTS PARA DEPENDENCIES
# ===========================================

# Tipos anotados para uso mais limpo nas rotas
CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[Optional[User], Depends(get_optional_user)]
ActiveUser = Annotated[User, Depends(get_current_active_user)]
AdminUser = Annotated[User, Depends(get_admin_user)]
CreatorUser = Annotated[User, Depends(get_creator_user)]
