"""
Testes unitários para o serviço de autenticação - Rifei
Testa funções de hash, JWT, e operações de usuário
"""
import pytest
from datetime import datetime, timedelta, timezone
from jose import jwt

from app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_token,
    get_user_by_email,
    get_user_by_username,
    get_user_by_id,
    authenticate_user,
    create_user,
    check_email_exists,
    check_username_exists,
    generate_tokens_for_user,
    get_token_expiry_seconds,
)
from app.config import settings
from app.schemas.auth import UserCreate
from app.models.models import User


# ===========================================
# TESTES DE HASH DE SENHA
# ===========================================

@pytest.mark.unit
@pytest.mark.auth
class TestPasswordHashing:
    """Testes para hash e verificação de senha"""

    def test_hash_password_generates_hash(self):
        """Testa se hash_password gera um hash válido"""
        password = "mySecurePassword123"
        hashed = hash_password(password)

        assert hashed is not None
        assert isinstance(hashed, str)
        assert len(hashed) > 0
        assert hashed != password  # Hash deve ser diferente da senha

    def test_hash_password_generates_different_hashes(self):
        """Testa se a mesma senha gera hashes diferentes (salt)"""
        password = "samePassword"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        assert hash1 != hash2  # Bcrypt usa salt aleatório

    def test_verify_password_with_correct_password(self):
        """Testa verificação com senha correta"""
        password = "correctPassword"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_with_wrong_password(self):
        """Testa verificação com senha incorreta"""
        password = "correctPassword"
        wrong_password = "wrongPassword"
        hashed = hash_password(password)

        assert verify_password(wrong_password, hashed) is False

    def test_verify_password_case_sensitive(self):
        """Testa se verificação é case-sensitive"""
        password = "CaseSensitive"
        hashed = hash_password(password)

        assert verify_password("casesensitive", hashed) is False
        assert verify_password("CASESENSITIVE", hashed) is False


# ===========================================
# TESTES DE JWT
# ===========================================

@pytest.mark.unit
@pytest.mark.auth
class TestJWTTokens:
    """Testes para criação e decodificação de tokens JWT"""

    def test_create_access_token(self):
        """Testa criação de access token"""
        data = {"sub": "123", "email": "test@example.com"}
        token = create_access_token(data)

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

        # Decodificar e verificar payload
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )

        assert payload["sub"] == "123"
        assert payload["email"] == "test@example.com"
        assert payload["type"] == "access"
        assert "exp" in payload
        assert "iat" in payload

    def test_create_access_token_with_custom_expiry(self):
        """Testa criação de token com expiração customizada"""
        data = {"sub": "123"}
        expires_delta = timedelta(hours=2)
        token = create_access_token(data, expires_delta)

        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )

        # Verificar se expiração está aproximadamente 2 horas no futuro
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        expected_time = datetime.now(timezone.utc) + expires_delta
        diff = abs((exp_time - expected_time).total_seconds())

        assert diff < 5  # Diferença menor que 5 segundos

    def test_create_refresh_token(self):
        """Testa criação de refresh token"""
        data = {"sub": "456"}
        token = create_refresh_token(data)

        assert token is not None
        assert isinstance(token, str)

        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )

        assert payload["sub"] == "456"
        assert payload["type"] == "refresh"
        assert "exp" in payload
        assert "iat" in payload

    def test_decode_token_valid(self):
        """Testa decodificação de token válido"""
        data = {"sub": "789", "email": "user@test.com"}
        token = create_access_token(data)

        token_data = decode_token(token)

        assert token_data is not None
        assert token_data.user_id == 789
        assert token_data.email == "user@test.com"

    def test_decode_token_invalid(self):
        """Testa decodificação de token inválido"""
        invalid_token = "invalid.token.here"

        token_data = decode_token(invalid_token)

        assert token_data is None

    def test_decode_token_expired(self):
        """Testa decodificação de token expirado"""
        data = {"sub": "100"}
        # Token que expira em -1 segundo (já expirado)
        expires_delta = timedelta(seconds=-1)
        token = create_access_token(data, expires_delta)

        token_data = decode_token(token)

        assert token_data is None

    def test_verify_token_correct_type(self):
        """Testa verificação de token com tipo correto"""
        data = {"sub": "200"}
        access_token = create_access_token(data)

        payload = verify_token(access_token, "access")

        assert payload is not None
        assert payload["type"] == "access"
        assert payload["sub"] == "200"

    def test_verify_token_wrong_type(self):
        """Testa verificação de token com tipo errado"""
        data = {"sub": "300"}
        access_token = create_access_token(data)

        # Tentar verificar como refresh token
        payload = verify_token(access_token, "refresh")

        assert payload is None

    def test_verify_token_invalid(self):
        """Testa verificação de token inválido"""
        invalid_token = "totally.invalid.token"

        payload = verify_token(invalid_token)

        assert payload is None


# ===========================================
# TESTES DE OPERAÇÕES DE USUÁRIO
# ===========================================

@pytest.mark.unit
@pytest.mark.auth
@pytest.mark.database
@pytest.mark.asyncio
class TestUserOperations:
    """Testes para operações CRUD de usuários"""

    async def test_get_user_by_email_exists(self, db_session, test_user):
        """Testa buscar usuário por email existente"""
        user = await get_user_by_email(db_session, test_user.email)

        assert user is not None
        assert user.id == test_user.id
        assert user.email == test_user.email

    async def test_get_user_by_email_case_insensitive(self, db_session, test_user):
        """Testa busca case-insensitive por email"""
        user = await get_user_by_email(db_session, test_user.email.upper())

        assert user is not None
        assert user.id == test_user.id

    async def test_get_user_by_email_not_exists(self, db_session):
        """Testa buscar usuário por email inexistente"""
        user = await get_user_by_email(db_session, "notexist@test.com")

        assert user is None

    async def test_get_user_by_username_exists(self, db_session, test_user):
        """Testa buscar usuário por username existente"""
        user = await get_user_by_username(db_session, test_user.username)

        assert user is not None
        assert user.id == test_user.id
        assert user.username == test_user.username

    async def test_get_user_by_username_case_insensitive(self, db_session, test_user):
        """Testa busca case-insensitive por username"""
        user = await get_user_by_username(db_session, test_user.username.upper())

        assert user is not None
        assert user.id == test_user.id

    async def test_get_user_by_username_not_exists(self, db_session):
        """Testa buscar usuário por username inexistente"""
        user = await get_user_by_username(db_session, "notexistuser")

        assert user is None

    async def test_get_user_by_id_exists(self, db_session, test_user):
        """Testa buscar usuário por ID existente"""
        user = await get_user_by_id(db_session, test_user.id)

        assert user is not None
        assert user.id == test_user.id
        assert user.email == test_user.email

    async def test_get_user_by_id_not_exists(self, db_session):
        """Testa buscar usuário por ID inexistente"""
        user = await get_user_by_id(db_session, 99999)

        assert user is None

    async def test_authenticate_user_success(self, db_session, test_user):
        """Testa autenticação com credenciais corretas"""
        user = await authenticate_user(
            db_session,
            test_user.email,
            "password123"  # Senha definida no conftest.py
        )

        assert user is not None
        assert user.id == test_user.id
        assert user.email == test_user.email

    async def test_authenticate_user_wrong_password(self, db_session, test_user):
        """Testa autenticação com senha incorreta"""
        user = await authenticate_user(
            db_session,
            test_user.email,
            "wrongpassword"
        )

        assert user is None

    async def test_authenticate_user_wrong_email(self, db_session):
        """Testa autenticação com email inexistente"""
        user = await authenticate_user(
            db_session,
            "notexist@test.com",
            "password123"
        )

        assert user is None

    async def test_create_user_success(self, db_session):
        """Testa criação de novo usuário"""
        user_data = UserCreate(
            name="New User",
            username="newuser",
            email="new@test.com",
            password="newpassword123"
        )

        user = await create_user(db_session, user_data)

        assert user is not None
        assert user.id is not None
        assert user.name == "New User"
        assert user.username == "newuser"
        assert user.email == "new@test.com"
        assert user.password_hash != "newpassword123"  # Deve estar hasheada
        assert verify_password("newpassword123", user.password_hash)

    async def test_create_user_email_lowercase(self, db_session):
        """Testa se email é salvo em lowercase"""
        user_data = UserCreate(
            name="Test",
            username="testuser2",
            email="UPPERCASE@TEST.COM",
            password="password123"
        )

        user = await create_user(db_session, user_data)

        assert user.email == "uppercase@test.com"

    async def test_create_user_username_lowercase(self, db_session):
        """Testa se username é salvo em lowercase"""
        user_data = UserCreate(
            name="Test",
            username="UPPERCASE",
            email="test2@test.com",
            password="password123"
        )

        user = await create_user(db_session, user_data)

        assert user.username == "uppercase"

    async def test_check_email_exists_true(self, db_session, test_user):
        """Testa verificação de email existente"""
        exists = await check_email_exists(db_session, test_user.email)

        assert exists is True

    async def test_check_email_exists_false(self, db_session):
        """Testa verificação de email inexistente"""
        exists = await check_email_exists(db_session, "notexist@test.com")

        assert exists is False

    async def test_check_username_exists_true(self, db_session, test_user):
        """Testa verificação de username existente"""
        exists = await check_username_exists(db_session, test_user.username)

        assert exists is True

    async def test_check_username_exists_false(self, db_session):
        """Testa verificação de username inexistente"""
        exists = await check_username_exists(db_session, "notexistuser")

        assert exists is False


# ===========================================
# TESTES DE HELPERS
# ===========================================

@pytest.mark.unit
@pytest.mark.auth
class TestAuthHelpers:
    """Testes para funções auxiliares de autenticação"""

    def test_get_token_expiry_seconds(self):
        """Testa cálculo de expiração em segundos"""
        seconds = get_token_expiry_seconds()

        expected = settings.jwt_access_token_expire_minutes * 60
        assert seconds == expected
        assert isinstance(seconds, int)

    @pytest.mark.asyncio
    async def test_generate_tokens_for_user(self, test_user):
        """Testa geração de tokens para usuário"""
        tokens = generate_tokens_for_user(test_user)

        assert "access_token" in tokens
        assert "refresh_token" in tokens
        assert "token_type" in tokens
        assert "expires_in" in tokens

        assert tokens["token_type"] == "bearer"
        assert isinstance(tokens["access_token"], str)
        assert isinstance(tokens["refresh_token"], str)
        assert isinstance(tokens["expires_in"], int)

        # Verificar se access token contém dados do usuário
        access_payload = jwt.decode(
            tokens["access_token"],
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )

        assert access_payload["sub"] == test_user.id
        assert access_payload["email"] == test_user.email
        assert access_payload["username"] == test_user.username
        assert access_payload["type"] == "access"

        # Verificar se refresh token contém dados básicos
        refresh_payload = jwt.decode(
            tokens["refresh_token"],
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )

        assert refresh_payload["sub"] == test_user.id
        assert refresh_payload["type"] == "refresh"

    @pytest.mark.asyncio
    async def test_generate_tokens_different_for_different_users(
        self, test_user, test_creator
    ):
        """Testa se tokens gerados são diferentes para usuários diferentes"""
        tokens1 = generate_tokens_for_user(test_user)
        tokens2 = generate_tokens_for_user(test_creator)

        assert tokens1["access_token"] != tokens2["access_token"]
        assert tokens1["refresh_token"] != tokens2["refresh_token"]
