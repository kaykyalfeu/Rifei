"""
Schemas Pydantic para Autenticação - Rifei
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


# ===========================================
# SCHEMAS DE REQUEST
# ===========================================

class UserCreate(BaseModel):
    """Schema para criação de usuário (cadastro)"""
    name: str = Field(..., min_length=2, max_length=100, description="Nome completo")
    username: str = Field(..., min_length=3, max_length=50, description="Nome de usuário único")
    email: EmailStr = Field(..., description="Email válido")
    password: str = Field(..., min_length=6, max_length=100, description="Senha (mín. 6 caracteres)")
    
    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Valida formato do username (apenas letras, números, underscore)"""
        v = v.lower().strip()
        if not re.match(r'^[a-z0-9_]+$', v):
            raise ValueError("Username deve conter apenas letras, números e underscore")
        if v[0].isdigit():
            raise ValueError("Username não pode começar com número")
        return v
    
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Limpa e valida o nome"""
        return v.strip()
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Valida força da senha"""
        if len(v) < 6:
            raise ValueError("Senha deve ter pelo menos 6 caracteres")
        # Opcional: adicionar mais regras de complexidade
        # if not re.search(r'[A-Z]', v):
        #     raise ValueError("Senha deve conter pelo menos uma letra maiúscula")
        # if not re.search(r'[0-9]', v):
        #     raise ValueError("Senha deve conter pelo menos um número")
        return v


class UserLogin(BaseModel):
    """Schema para login"""
    email: EmailStr = Field(..., description="Email cadastrado")
    password: str = Field(..., description="Senha")
    remember: bool = Field(default=False, description="Manter conectado")


class PasswordChange(BaseModel):
    """Schema para alteração de senha"""
    current_password: str = Field(..., description="Senha atual")
    new_password: str = Field(..., min_length=6, max_length=100, description="Nova senha")
    
    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Nova senha deve ter pelo menos 6 caracteres")
        return v


class PasswordReset(BaseModel):
    """Schema para reset de senha"""
    email: EmailStr = Field(..., description="Email cadastrado")


class PasswordResetConfirm(BaseModel):
    """Schema para confirmar reset de senha"""
    token: str = Field(..., description="Token de reset")
    new_password: str = Field(..., min_length=6, max_length=100, description="Nova senha")


# ===========================================
# SCHEMAS DE RESPONSE
# ===========================================

class UserResponse(BaseModel):
    """Schema de resposta do usuário (sem dados sensíveis)"""
    id: int
    email: str
    name: str
    username: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    level: int
    xp: int
    total_wins: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserPublicResponse(BaseModel):
    """Schema de usuário para exibição pública"""
    id: int
    name: str
    username: str
    avatar_url: Optional[str] = None
    is_verified: bool
    level: int
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema de resposta do token JWT"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # segundos


class TokenData(BaseModel):
    """Dados extraídos do token JWT"""
    user_id: Optional[int] = None
    email: Optional[str] = None


class AuthResponse(BaseModel):
    """Resposta completa de autenticação"""
    user: UserResponse
    token: Token
    message: str = "Login realizado com sucesso"


class MessageResponse(BaseModel):
    """Resposta simples com mensagem"""
    message: str
    success: bool = True
