"""
Configuração global de fixtures para testes - Rifei
"""
import asyncio
import os
from typing import AsyncGenerator, Generator
from decimal import Decimal

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import create_engine, event
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import Settings, get_settings
from app.database import Base, get_db
from app.main import app
from app.models.models import User, Category, Rifa, UserRole, RifaStatus
from app.services.auth import hash_password


# ===========================================
# CONFIGURAÇÃO DE AMBIENTE
# ===========================================

@pytest.fixture(scope="session")
def test_settings() -> Settings:
    """Retorna configurações de teste"""
    # Força carregamento do .env.test
    os.environ["APP_ENV"] = "testing"

    return Settings(
        app_name="Rifei Test",
        app_env="testing",
        app_debug=True,
        database_url="sqlite+aiosqlite:///:memory:",
        secret_key="test-secret-key",
        jwt_secret_key="test-jwt-secret",
        jwt_algorithm="HS256",
        jwt_access_token_expire_minutes=30,
        jwt_refresh_token_expire_days=7,
    )


@pytest.fixture(scope="session", autouse=True)
def override_settings(test_settings: Settings):
    """Sobrescreve as configurações globais para testes"""
    app.dependency_overrides[get_settings] = lambda: test_settings
    yield
    app.dependency_overrides.clear()


# ===========================================
# DATABASE E SESSION
# ===========================================

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Cria um event loop para toda a sessão de testes"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """
    Cria um engine de banco de dados SQLite in-memory para testes.
    Recria o banco a cada teste.
    """
    # Engine assíncrono com SQLite in-memory
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )

    # Criar todas as tabelas
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Limpar
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """
    Cria uma sessão de banco de dados para cada teste.
    """
    # Criar sessionmaker
    async_session_maker = async_sessionmaker(
        db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    async with async_session_maker() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Cliente HTTP assíncrono para testar a API.
    """
    # Override da dependency de DB
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


# ===========================================
# FIXTURES DE DADOS
# ===========================================

@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """
    Cria um usuário de teste padrão.
    """
    user = User(
        email="user@test.com",
        username="testuser",
        name="Test User",
        password_hash=hash_password("password123"),
        is_active=True,
        is_verified=False,
        role=UserRole.USER,
    )

    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return user


@pytest_asyncio.fixture
async def test_creator(db_session: AsyncSession) -> User:
    """
    Cria um usuário criador de rifas de teste.
    """
    creator = User(
        email="creator@test.com",
        username="testcreator",
        name="Test Creator",
        password_hash=hash_password("password123"),
        is_active=True,
        is_verified=True,
        role=UserRole.CREATOR,
    )

    db_session.add(creator)
    await db_session.commit()
    await db_session.refresh(creator)

    return creator


@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession) -> User:
    """
    Cria um usuário admin de teste.
    """
    admin = User(
        email="admin@test.com",
        username="testadmin",
        name="Test Admin",
        password_hash=hash_password("password123"),
        is_active=True,
        is_verified=True,
        role=UserRole.ADMIN,
    )

    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)

    return admin


@pytest_asyncio.fixture
async def test_category(db_session: AsyncSession) -> Category:
    """
    Cria uma categoria de teste.
    """
    category = Category(
        name="Eletrônicos",
        slug="eletronicos",
        icon="📱",
        description="Smartphones, computadores e gadgets",
        is_active=True,
        order=1,
    )

    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)

    return category


@pytest_asyncio.fixture
async def test_rifa(db_session: AsyncSession, test_creator: User, test_category: Category) -> Rifa:
    """
    Cria uma rifa de teste ativa.
    """
    from datetime import datetime, timedelta

    rifa = Rifa(
        title="iPhone 15 Pro Max",
        slug="iphone-15-pro-max",
        description="iPhone 15 Pro Max 256GB Titânio",
        price=Decimal("10.00"),
        total_numbers=1000,
        min_numbers=1,
        max_numbers_per_user=50,
        status=RifaStatus.ACTIVE,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=30),
        creator_id=test_creator.id,
        category_id=test_category.id,
        is_featured=True,
        is_verified=True,
    )

    db_session.add(rifa)
    await db_session.commit()
    await db_session.refresh(rifa)

    return rifa


@pytest_asyncio.fixture
async def multiple_users(db_session: AsyncSession) -> list[User]:
    """
    Cria múltiplos usuários de teste.
    """
    users = []
    for i in range(5):
        user = User(
            email=f"user{i}@test.com",
            username=f"testuser{i}",
            name=f"Test User {i}",
            password_hash=hash_password("password123"),
            is_active=True,
            role=UserRole.USER,
        )
        db_session.add(user)
        users.append(user)

    await db_session.commit()

    for user in users:
        await db_session.refresh(user)

    return users


# ===========================================
# FIXTURES DE AUTENTICAÇÃO
# ===========================================

@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """
    Retorna headers de autenticação com token JWT válido.
    """
    from app.services.auth import generate_tokens_for_user

    tokens = generate_tokens_for_user(test_user)

    return {
        "Authorization": f"Bearer {tokens['access_token']}"
    }


@pytest.fixture
def creator_auth_headers(test_creator: User) -> dict:
    """
    Retorna headers de autenticação para criador.
    """
    from app.services.auth import generate_tokens_for_user

    tokens = generate_tokens_for_user(test_creator)

    return {
        "Authorization": f"Bearer {tokens['access_token']}"
    }


@pytest.fixture
def admin_auth_headers(test_admin: User) -> dict:
    """
    Retorna headers de autenticação para admin.
    """
    from app.services.auth import generate_tokens_for_user

    tokens = generate_tokens_for_user(test_admin)

    return {
        "Authorization": f"Bearer {tokens['access_token']}"
    }


# ===========================================
# FIXTURES DE DADOS MOCKADOS
# ===========================================

@pytest.fixture
def sample_user_data() -> dict:
    """Dados de exemplo para criação de usuário"""
    return {
        "name": "John Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "password": "securepassword123",
    }


@pytest.fixture
def sample_rifa_data() -> dict:
    """Dados de exemplo para criação de rifa"""
    from datetime import datetime, timedelta

    return {
        "title": "MacBook Pro M3",
        "slug": "macbook-pro-m3",
        "description": "MacBook Pro 14\" M3 Pro 512GB",
        "price": 25.00,
        "total_numbers": 500,
        "min_numbers": 1,
        "max_numbers_per_user": 25,
        "end_date": (datetime.utcnow() + timedelta(days=15)).isoformat(),
    }


# ===========================================
# HELPERS
# ===========================================

@pytest.fixture
def temp_upload_dir(tmp_path):
    """Cria diretório temporário para uploads durante testes"""
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    return upload_dir
