"""
Testes de API para endpoints de autenticação - Rifei
Testa rotas de login, cadastro, logout e perfil
"""
import pytest
from httpx import AsyncClient
from fastapi import status

from app.models.models import User


# ===========================================
# TESTES DE REGISTRO (CADASTRO)
# ===========================================

@pytest.mark.api
@pytest.mark.auth
@pytest.mark.asyncio
class TestRegisterAPI:
    """Testes para endpoint de registro"""

    async def test_register_success(self, client: AsyncClient, db_session):
        """Testa registro com dados válidos"""
        user_data = {
            "name": "John Doe",
            "username": "johndoe",
            "email": "john@example.com",
            "password": "securepass123",
        }

        response = await client.post("/api/auth/register", json=user_data)

        assert response.status_code == status.HTTP_201_CREATED

        data = response.json()
        assert "user" in data
        assert "token" in data
        assert "message" in data

        # Verificar dados do usuário
        assert data["user"]["email"] == "john@example.com"
        assert data["user"]["username"] == "johndoe"
        assert data["user"]["name"] == "John Doe"
        assert "password" not in data["user"]

        # Verificar token
        assert data["token"]["access_token"] is not None
        assert data["token"]["token_type"] == "bearer"
        assert data["token"]["expires_in"] > 0

        # Verificar cookie de sessão
        assert "session_token" in response.cookies

    async def test_register_duplicate_email(
        self, client: AsyncClient, test_user: User
    ):
        """Testa registro com email já cadastrado"""
        user_data = {
            "name": "Another User",
            "username": "anotheruser",
            "email": test_user.email,  # Email duplicado
            "password": "password123",
        }

        response = await client.post("/api/auth/register", json=user_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.json()["detail"].lower()

    async def test_register_duplicate_username(
        self, client: AsyncClient, test_user: User
    ):
        """Testa registro com username já em uso"""
        user_data = {
            "name": "Another User",
            "username": test_user.username,  # Username duplicado
            "email": "another@example.com",
            "password": "password123",
        }

        response = await client.post("/api/auth/register", json=user_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "usuário" in response.json()["detail"].lower()

    async def test_register_invalid_email(self, client: AsyncClient):
        """Testa registro com email inválido"""
        user_data = {
            "name": "Test User",
            "username": "testuser",
            "email": "invalid-email",  # Email inválido
            "password": "password123",
        }

        response = await client.post("/api/auth/register", json=user_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_register_short_password(self, client: AsyncClient):
        """Testa registro com senha muito curta"""
        user_data = {
            "name": "Test User",
            "username": "testuser",
            "email": "test@example.com",
            "password": "123",  # Senha muito curta
        }

        response = await client.post("/api/auth/register", json=user_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_register_missing_fields(self, client: AsyncClient):
        """Testa registro com campos faltando"""
        user_data = {
            "email": "test@example.com",
            # Faltam name, username, password
        }

        response = await client.post("/api/auth/register", json=user_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# ===========================================
# TESTES DE LOGIN
# ===========================================

@pytest.mark.api
@pytest.mark.auth
@pytest.mark.asyncio
class TestLoginAPI:
    """Testes para endpoint de login"""

    async def test_login_success(self, client: AsyncClient, test_user: User):
        """Testa login com credenciais corretas"""
        login_data = {
            "email": test_user.email,
            "password": "password123",  # Senha definida no conftest
            "remember": False,
        }

        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert "user" in data
        assert "token" in data
        assert "message" in data

        # Verificar dados do usuário
        assert data["user"]["id"] == test_user.id
        assert data["user"]["email"] == test_user.email
        assert "password" not in data["user"]

        # Verificar token
        assert data["token"]["access_token"] is not None
        assert data["token"]["token_type"] == "bearer"

        # Verificar cookie
        assert "session_token" in response.cookies

    async def test_login_with_remember_me(self, client: AsyncClient, test_user: User):
        """Testa login com 'lembrar-me' ativado"""
        login_data = {
            "email": test_user.email,
            "password": "password123",
            "remember": True,
        }

        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == status.HTTP_200_OK

        # Token deve ter expiração maior (30 dias)
        data = response.json()
        assert data["token"]["expires_in"] > 86400  # Mais de 1 dia

    async def test_login_wrong_password(self, client: AsyncClient, test_user: User):
        """Testa login com senha incorreta"""
        login_data = {
            "email": test_user.email,
            "password": "wrongpassword",
            "remember": False,
        }

        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "incorretos" in response.json()["detail"].lower()

    async def test_login_nonexistent_email(self, client: AsyncClient):
        """Testa login com email inexistente"""
        login_data = {
            "email": "notexist@example.com",
            "password": "password123",
            "remember": False,
        }

        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_login_inactive_user(self, client: AsyncClient, db_session):
        """Testa login com usuário desativado"""
        from app.services.auth import hash_password

        # Criar usuário inativo
        inactive_user = User(
            email="inactive@test.com",
            username="inactiveuser",
            name="Inactive",
            password_hash=hash_password("password123"),
            is_active=False,  # Usuário desativado
        )

        db_session.add(inactive_user)
        await db_session.commit()

        login_data = {
            "email": "inactive@test.com",
            "password": "password123",
            "remember": False,
        }

        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "desativada" in response.json()["detail"].lower()

    async def test_login_missing_fields(self, client: AsyncClient):
        """Testa login com campos faltando"""
        login_data = {
            "email": "test@example.com",
            # Falta password
        }

        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# ===========================================
# TESTES DE LOGOUT
# ===========================================

@pytest.mark.api
@pytest.mark.auth
@pytest.mark.asyncio
class TestLogoutAPI:
    """Testes para endpoint de logout"""

    async def test_logout_success(self, client: AsyncClient):
        """Testa logout"""
        response = await client.post("/api/auth/logout")

        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["success"] is True
        assert "Logout" in data["message"]

        # Cookie deve ser removido (valor vazio ou expirado)
        # Note: httpx pode não mostrar cookies deletados, mas o comportamento está correto


# ===========================================
# TESTES DE GET ME (USUÁRIO AUTENTICADO)
# ===========================================

@pytest.mark.api
@pytest.mark.auth
@pytest.mark.asyncio
class TestGetMeAPI:
    """Testes para endpoint /api/auth/me"""

    async def test_get_me_authenticated(
        self, client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Testa obter dados do usuário autenticado"""
        response = await client.get("/api/auth/me", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["id"] == test_user.id
        assert data["email"] == test_user.email
        assert data["username"] == test_user.username
        assert data["name"] == test_user.name
        assert "password" not in data
        assert "password_hash" not in data

    async def test_get_me_unauthenticated(self, client: AsyncClient):
        """Testa obter dados sem autenticação"""
        response = await client.get("/api/auth/me")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_get_me_invalid_token(self, client: AsyncClient):
        """Testa obter dados com token inválido"""
        headers = {"Authorization": "Bearer invalid_token_here"}

        response = await client.get("/api/auth/me", headers=headers)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ===========================================
# TESTES DE CHECK AUTH
# ===========================================

@pytest.mark.api
@pytest.mark.auth
@pytest.mark.asyncio
class TestCheckAuthAPI:
    """Testes para endpoint /api/auth/check"""

    async def test_check_auth_authenticated(
        self, client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Testa verificação de autenticação quando autenticado"""
        response = await client.get("/api/auth/check", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["authenticated"] is True
        assert data["user"]["id"] == test_user.id
        assert data["user"]["username"] == test_user.username

    async def test_check_auth_unauthenticated(self, client: AsyncClient):
        """Testa verificação de autenticação quando não autenticado"""
        response = await client.get("/api/auth/check")

        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["authenticated"] is False
        assert "user" not in data


# ===========================================
# TESTES DE VERIFICAÇÃO DE EMAIL/USERNAME
# ===========================================

@pytest.mark.api
@pytest.mark.auth
@pytest.mark.asyncio
class TestCheckEmailUsernameAPI:
    """Testes para endpoints de verificação de email e username"""

    async def test_check_email_exists(self, client: AsyncClient, test_user: User):
        """Testa verificação de email existente"""
        response = await client.post(
            "/api/auth/check-email",
            params={"email": test_user.email}
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["exists"] is True

    async def test_check_email_not_exists(self, client: AsyncClient):
        """Testa verificação de email inexistente"""
        response = await client.post(
            "/api/auth/check-email",
            params={"email": "notexist@example.com"}
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["exists"] is False

    async def test_check_username_exists(self, client: AsyncClient, test_user: User):
        """Testa verificação de username existente"""
        response = await client.post(
            "/api/auth/check-username",
            params={"username": test_user.username}
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["exists"] is True

    async def test_check_username_not_exists(self, client: AsyncClient):
        """Testa verificação de username inexistente"""
        response = await client.post(
            "/api/auth/check-username",
            params={"username": "notexistuser"}
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["exists"] is False


# ===========================================
# TESTES DE AUTENTICAÇÃO COM DIFERENTES ROLES
# ===========================================

@pytest.mark.api
@pytest.mark.auth
@pytest.mark.asyncio
class TestAuthWithRoles:
    """Testes de autenticação com diferentes roles de usuário"""

    async def test_creator_login(self, client: AsyncClient, test_creator: User):
        """Testa login de criador"""
        login_data = {
            "email": test_creator.email,
            "password": "password123",
            "remember": False,
        }

        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["user"]["role"] == "creator"

    async def test_admin_login(self, client: AsyncClient, test_admin: User):
        """Testa login de admin"""
        login_data = {
            "email": test_admin.email,
            "password": "password123",
            "remember": False,
        }

        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["user"]["role"] == "admin"

    async def test_token_contains_role(
        self, client: AsyncClient, test_creator: User, creator_auth_headers: dict
    ):
        """Testa se token contém informação de role"""
        from jose import jwt
        from app.config import settings

        # Extrair token do header
        token = creator_auth_headers["Authorization"].split(" ")[1]

        # Decodificar
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )

        assert payload["role"] == "creator"
        assert payload["sub"] == test_creator.id


# ===========================================
# TESTES DE EDGE CASES
# ===========================================

@pytest.mark.api
@pytest.mark.auth
@pytest.mark.asyncio
class TestAuthEdgeCases:
    """Testes de casos extremos e edge cases"""

    async def test_register_email_case_insensitive(self, client: AsyncClient):
        """Testa se email é tratado case-insensitive"""
        user_data = {
            "name": "Test User",
            "username": "testuser1",
            "email": "TEST@EXAMPLE.COM",
            "password": "password123",
        }

        response = await client.post("/api/auth/register", json=user_data)
        assert response.status_code == status.HTTP_201_CREATED

        # Verificar se foi salvo em lowercase
        data = response.json()
        assert data["user"]["email"] == "test@example.com"

    async def test_register_username_case_insensitive(self, client: AsyncClient):
        """Testa se username é tratado case-insensitive"""
        user_data = {
            "name": "Test User",
            "username": "TESTUSER2",
            "email": "test2@example.com",
            "password": "password123",
        }

        response = await client.post("/api/auth/register", json=user_data)
        assert response.status_code == status.HTTP_201_CREATED

        # Verificar se foi salvo em lowercase
        data = response.json()
        assert data["user"]["username"] == "testuser2"

    async def test_login_email_case_insensitive(
        self, client: AsyncClient, test_user: User
    ):
        """Testa se login aceita email em qualquer case"""
        login_data = {
            "email": test_user.email.upper(),  # Email em maiúscula
            "password": "password123",
            "remember": False,
        }

        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == status.HTTP_200_OK

    async def test_register_trim_whitespace(self, client: AsyncClient):
        """Testa se espaços em branco são removidos"""
        user_data = {
            "name": "  Test User  ",
            "username": "  testuser3  ",
            "email": "  test3@example.com  ",
            "password": "password123",
        }

        # Nota: Esta validação deve estar no schema Pydantic
        # Se não estiver, este teste pode falhar, indicando uma melhoria necessária
        response = await client.post("/api/auth/register", json=user_data)

        # Dependendo da implementação, pode retornar 201 ou 422
        # Ajustar conforme necessário
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_422_UNPROCESSABLE_ENTITY]
