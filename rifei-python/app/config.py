"""
Configurações da aplicação Rifei
"""
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações carregadas do ambiente"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # Aplicação
    app_name: str = "Rifei"
    app_env: str = "development"
    app_debug: bool = True
    app_url: str = "http://localhost:8000"
    secret_key: str = "chave-padrao-mude-em-producao"
    
    # Banco de Dados
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/rifei"
    
    # Supabase (opcional)
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    supabase_service_key: Optional[str] = None
    
    # Mercado Pago
    mercadopago_access_token: Optional[str] = None
    mercadopago_public_key: Optional[str] = None
    mercadopago_webhook_secret: Optional[str] = None
    
    # JWT
    jwt_secret_key: str = "jwt-secret-mude-em-producao"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    
    # Email
    mail_server: Optional[str] = None
    mail_port: int = 587
    mail_username: Optional[str] = None
    mail_password: Optional[str] = None
    mail_from: Optional[str] = None
    
    # Redis
    redis_url: Optional[str] = None
    
    # Upload
    max_upload_size: int = 5242880  # 5MB
    upload_dir: str = "uploads"
    
    @property
    def is_development(self) -> bool:
        return self.app_env == "development"
    
    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    """Retorna instância cacheada das configurações"""
    return Settings()


# Instância global
settings = get_settings()
