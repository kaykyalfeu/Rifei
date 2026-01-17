"""
Service de Autenticação - Rifei
Funções para hash de senha, JWT e verificação de usuários
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.models import User
from app.schemas.auth import UserCreate, TokenData


# ===========================================
# CONFIGURAÇÃO DE HASH DE SENHA
# ===========================================

# Contexto para hashing de senha usando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Gera hash bcrypt da senha"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha plain corresponde ao hash"""
    return pwd_context.verify(plain_password, hashed_password)


# ===========================================
# JWT - CRIAÇÃO E VERIFICAÇÃO DE TOKENS
# ===========================================

def create_access_token(
    data: dict, 
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Cria um token JWT de acesso
    
    Args:
        data: Dicionário com dados a incluir no token (ex: {"sub": user_id})
        expires_delta: Tempo de expiração customizado
        
    Returns:
        Token JWT codificado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.jwt_access_token_expire_minutes
        )
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.jwt_secret_key, 
        algorithm=settings.jwt_algorithm
    )
    
    return encoded_jwt


def create_refresh_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Cria um token JWT de refresh (para renovar o access token)
    
    Args:
        data: Dicionário com dados a incluir no token
        expires_delta: Tempo de expiração customizado
        
    Returns:
        Token JWT de refresh codificado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.jwt_refresh_token_expire_days
        )
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )
    
    return encoded_jwt


def decode_token(token: str) -> Optional[TokenData]:
    """
    Decodifica e valida um token JWT

    Args:
        token: Token JWT a ser decodificado

    Returns:
        TokenData com os dados do token ou None se inválido
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )

        user_id_str: str = payload.get("sub")
        email: str = payload.get("email")

        if user_id_str is None:
            return None

        # Converter string para int
        user_id = int(user_id_str)

        return TokenData(user_id=user_id, email=email)

    except (JWTError, ValueError, TypeError):
        return None


def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
    """
    Verifica se um token é válido e do tipo correto
    
    Args:
        token: Token JWT
        token_type: Tipo esperado ("access" ou "refresh")
        
    Returns:
        Payload do token ou None se inválido
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        
        if payload.get("type") != token_type:
            return None
            
        return payload
        
    except JWTError:
        return None


# ===========================================
# OPERAÇÕES DE USUÁRIO
# ===========================================

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Busca usuário por email"""
    result = await db.execute(
        select(User).where(User.email == email.lower())
    )
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Busca usuário por username"""
    result = await db.execute(
        select(User).where(User.username == username.lower())
    )
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """Busca usuário por ID"""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()


async def authenticate_user(
    db: AsyncSession, 
    email: str, 
    password: str
) -> Optional[User]:
    """
    Autentica um usuário por email e senha
    
    Args:
        db: Sessão do banco de dados
        email: Email do usuário
        password: Senha em texto plano
        
    Returns:
        Objeto User se autenticação bem sucedida, None caso contrário
    """
    user = await get_user_by_email(db, email)
    
    if not user:
        return None
        
    if not verify_password(password, user.password_hash):
        return None
        
    return user


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """
    Cria um novo usuário no banco de dados
    
    Args:
        db: Sessão do banco de dados
        user_data: Dados do usuário (validados pelo Pydantic)
        
    Returns:
        Objeto User criado
    """
    # Hash da senha
    password_hash = hash_password(user_data.password)
    
    # Criar objeto User
    user = User(
        email=user_data.email.lower(),
        username=user_data.username.lower(),
        name=user_data.name,
        password_hash=password_hash,
    )
    
    # Salvar no banco
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


async def check_email_exists(db: AsyncSession, email: str) -> bool:
    """Verifica se email já está cadastrado"""
    user = await get_user_by_email(db, email)
    return user is not None


async def check_username_exists(db: AsyncSession, username: str) -> bool:
    """Verifica se username já está em uso"""
    user = await get_user_by_username(db, username)
    return user is not None


# ===========================================
# HELPERS
# ===========================================

def get_token_expiry_seconds() -> int:
    """Retorna tempo de expiração do token em segundos"""
    return settings.jwt_access_token_expire_minutes * 60


def generate_tokens_for_user(user: User) -> dict:
    """
    Gera access token e refresh token para um usuário
    
    Args:
        user: Objeto User
        
    Returns:
        Dicionário com access_token, refresh_token e expires_in
    """
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": get_token_expiry_seconds()
    }
