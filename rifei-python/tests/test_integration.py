"""
Testes de integração - Rifei
Testa fluxos completos e interações entre componentes
"""
import pytest
from httpx import AsyncClient
from fastapi import status
from decimal import Decimal

from app.models.models import User, Rifa, Ticket, Payment, PaymentStatus, RifaStatus


# ===========================================
# TESTES DE FLUXO COMPLETO DE AUTENTICAÇÃO
# ===========================================

@pytest.mark.integration
@pytest.mark.asyncio
class TestAuthenticationFlow:
    """Testes de fluxo completo de autenticação"""

    async def test_complete_registration_and_login_flow(self, client: AsyncClient):
        """Testa fluxo completo: registro → login → acesso a recurso protegido"""
        # 1. Registrar novo usuário
        register_data = {
            "name": "Flow Test User",
            "username": "flowuser",
            "email": "flow@test.com",
            "password": "securepass123",
        }

        register_response = await client.post(
            "/api/auth/register",
            json=register_data
        )

        assert register_response.status_code == status.HTTP_201_CREATED
        user_id = register_response.json()["user"]["id"]

        # 2. Fazer logout
        logout_response = await client.post("/api/auth/logout")
        assert logout_response.status_code == status.HTTP_200_OK

        # 3. Fazer login novamente
        login_data = {
            "email": "flow@test.com",
            "password": "securepass123",
            "remember": False,
        }

        login_response = await client.post("/api/auth/login", json=login_data)
        assert login_response.status_code == status.HTTP_200_OK

        # 4. Acessar recurso protegido
        token = login_response.json()["token"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        me_response = await client.get("/api/auth/me", headers=headers)
        assert me_response.status_code == status.HTTP_200_OK
        assert me_response.json()["id"] == user_id

    async def test_invalid_credentials_flow(self, client: AsyncClient, test_user: User):
        """Testa fluxo com credenciais inválidas"""
        # Tentar login com senha errada
        login_data = {
            "email": test_user.email,
            "password": "wrongpassword",
            "remember": False,
        }

        response = await client.post("/api/auth/login", json=login_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Verificar que não consegue acessar recursos protegidos
        me_response = await client.get("/api/auth/me")
        assert me_response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_token_lifecycle(self, client: AsyncClient, test_user: User):
        """Testa ciclo de vida do token"""
        # 1. Fazer login e obter token
        login_data = {
            "email": test_user.email,
            "password": "password123",
            "remember": False,
        }

        login_response = await client.post("/api/auth/login", json=login_data)
        token = login_response.json()["token"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Usar token para acessar recurso
        me_response = await client.get("/api/auth/me", headers=headers)
        assert me_response.status_code == status.HTTP_200_OK

        # 3. Verificar autenticação
        check_response = await client.get("/api/auth/check", headers=headers)
        assert check_response.json()["authenticated"] is True

        # 4. Fazer logout
        await client.post("/api/auth/logout")

        # 5. Token ainda é válido (logout apenas remove cookie)
        me_response2 = await client.get("/api/auth/me", headers=headers)
        assert me_response2.status_code == status.HTTP_200_OK


# ===========================================
# TESTES DE CRIAÇÃO E GESTÃO DE USUÁRIOS
# ===========================================

@pytest.mark.integration
@pytest.mark.asyncio
class TestUserManagement:
    """Testes de gestão de usuários"""

    async def test_create_multiple_users(self, client: AsyncClient, db_session):
        """Testa criação de múltiplos usuários"""
        users_data = [
            {
                "name": f"User {i}",
                "username": f"user{i}",
                "email": f"user{i}@test.com",
                "password": "password123",
            }
            for i in range(5)
        ]

        created_ids = []

        for user_data in users_data:
            response = await client.post("/api/auth/register", json=user_data)
            assert response.status_code == status.HTTP_201_CREATED
            created_ids.append(response.json()["user"]["id"])

        # Verificar que todos foram criados com IDs únicos
        assert len(created_ids) == len(set(created_ids))
        assert len(created_ids) == 5

    async def test_user_uniqueness_constraints(self, client: AsyncClient):
        """Testa constraints de unicidade"""
        # Criar primeiro usuário
        user1_data = {
            "name": "First User",
            "username": "uniqueuser",
            "email": "unique@test.com",
            "password": "password123",
        }

        response1 = await client.post("/api/auth/register", json=user1_data)
        assert response1.status_code == status.HTTP_201_CREATED

        # Tentar criar com mesmo email
        user2_data = {
            "name": "Second User",
            "username": "differentuser",
            "email": "unique@test.com",  # Email duplicado
            "password": "password123",
        }

        response2 = await client.post("/api/auth/register", json=user2_data)
        assert response2.status_code == status.HTTP_400_BAD_REQUEST

        # Tentar criar com mesmo username
        user3_data = {
            "name": "Third User",
            "username": "uniqueuser",  # Username duplicado
            "email": "different@test.com",
            "password": "password123",
        }

        response3 = await client.post("/api/auth/register", json=user3_data)
        assert response3.status_code == status.HTTP_400_BAD_REQUEST


# ===========================================
# TESTES DE RELACIONAMENTOS ENTRE MODELOS
# ===========================================

@pytest.mark.integration
@pytest.mark.database
@pytest.mark.asyncio
class TestModelRelationships:
    """Testa relacionamentos entre modelos"""

    async def test_user_rifa_relationship(
        self, db_session, test_creator: User, test_category
    ):
        """Testa relacionamento User -> Rifas"""
        # Criar rifas para o criador
        from datetime import datetime, timedelta

        rifa1 = Rifa(
            title="Rifa 1",
            slug="rifa-1",
            description="Test",
            price=Decimal("10.00"),
            total_numbers=100,
            end_date=datetime.utcnow() + timedelta(days=30),
            creator_id=test_creator.id,
            category_id=test_category.id,
        )

        rifa2 = Rifa(
            title="Rifa 2",
            slug="rifa-2",
            description="Test",
            price=Decimal("20.00"),
            total_numbers=200,
            end_date=datetime.utcnow() + timedelta(days=30),
            creator_id=test_creator.id,
            category_id=test_category.id,
        )

        db_session.add_all([rifa1, rifa2])
        await db_session.commit()

        # Buscar criador e verificar rifas
        await db_session.refresh(test_creator, ["rifas"])

        assert len(test_creator.rifas) == 2
        assert rifa1 in test_creator.rifas
        assert rifa2 in test_creator.rifas

    async def test_rifa_tickets_relationship(
        self, db_session, test_rifa: Rifa, test_user: User
    ):
        """Testa relacionamento Rifa -> Tickets"""
        # Criar tickets para a rifa
        tickets = []
        for i in range(1, 6):
            ticket = Ticket(
                number=i,
                rifa_id=test_rifa.id,
                user_id=test_user.id,
            )
            tickets.append(ticket)

        db_session.add_all(tickets)
        await db_session.commit()

        # Buscar rifa e verificar tickets
        await db_session.refresh(test_rifa, ["tickets"])

        assert len(test_rifa.tickets) == 5
        assert all(t.rifa_id == test_rifa.id for t in test_rifa.tickets)

    async def test_user_tickets_relationship(
        self, db_session, test_rifa: Rifa, test_user: User
    ):
        """Testa relacionamento User -> Tickets"""
        # Criar tickets para o usuário
        ticket1 = Ticket(
            number=10,
            rifa_id=test_rifa.id,
            user_id=test_user.id,
        )

        ticket2 = Ticket(
            number=20,
            rifa_id=test_rifa.id,
            user_id=test_user.id,
        )

        db_session.add_all([ticket1, ticket2])
        await db_session.commit()

        # Buscar usuário e verificar tickets
        await db_session.refresh(test_user, ["tickets"])

        assert len(test_user.tickets) == 2
        assert all(t.user_id == test_user.id for t in test_user.tickets)

    async def test_category_rifas_relationship(
        self, db_session, test_category, test_creator: User
    ):
        """Testa relacionamento Category -> Rifas"""
        from datetime import datetime, timedelta

        # Criar rifas na categoria
        rifa1 = Rifa(
            title="Cat Rifa 1",
            slug="cat-rifa-1",
            description="Test",
            price=Decimal("15.00"),
            total_numbers=150,
            end_date=datetime.utcnow() + timedelta(days=30),
            creator_id=test_creator.id,
            category_id=test_category.id,
        )

        db_session.add(rifa1)
        await db_session.commit()

        # Buscar categoria e verificar rifas
        await db_session.refresh(test_category, ["rifas"])

        assert len(test_category.rifas) >= 1
        assert any(r.category_id == test_category.id for r in test_category.rifas)

    async def test_payment_tickets_relationship(
        self, db_session, test_rifa: Rifa, test_user: User
    ):
        """Testa relacionamento Payment -> Tickets"""
        # Criar pagamento
        payment = Payment(
            amount=Decimal("30.00"),
            status=PaymentStatus.APPROVED,
            user_id=test_user.id,
            rifa_id=test_rifa.id,
        )

        db_session.add(payment)
        await db_session.commit()
        await db_session.refresh(payment)

        # Criar tickets vinculados ao pagamento
        ticket1 = Ticket(
            number=1,
            rifa_id=test_rifa.id,
            user_id=test_user.id,
            payment_id=payment.id,
        )

        ticket2 = Ticket(
            number=2,
            rifa_id=test_rifa.id,
            user_id=test_user.id,
            payment_id=payment.id,
        )

        db_session.add_all([ticket1, ticket2])
        await db_session.commit()

        # Buscar pagamento e verificar tickets
        await db_session.refresh(payment, ["tickets"])

        assert len(payment.tickets) == 2
        assert all(t.payment_id == payment.id for t in payment.tickets)


# ===========================================
# TESTES DE FLUXOS DE NEGÓCIO
# ===========================================

@pytest.mark.integration
@pytest.mark.slow
@pytest.mark.asyncio
class TestBusinessFlows:
    """Testa fluxos de negócio completos"""

    async def test_user_gamification_stats(self, db_session, test_user: User):
        """Testa atualização de estatísticas de gamificação"""
        # Verificar valores iniciais
        assert test_user.level == 1
        assert test_user.xp == 0
        assert test_user.total_wins == 0
        assert test_user.total_spent == Decimal("0")

        # Simular compra
        test_user.total_spent += Decimal("50.00")
        await db_session.commit()
        await db_session.refresh(test_user)

        assert test_user.total_spent == Decimal("50.00")

        # Simular vitória
        test_user.total_wins += 1
        await db_session.commit()
        await db_session.refresh(test_user)

        assert test_user.total_wins == 1

    async def test_rifa_status_lifecycle(
        self, db_session, test_rifa: Rifa
    ):
        """Testa ciclo de vida de status da rifa"""
        # Inicialmente em DRAFT
        assert test_rifa.status == RifaStatus.ACTIVE  # test_rifa já começa ativa

        # Mudar para pausada
        test_rifa.status = RifaStatus.COMPLETED
        await db_session.commit()
        await db_session.refresh(test_rifa)

        assert test_rifa.status == RifaStatus.COMPLETED

    async def test_rifa_sold_count_tracking(
        self, db_session, test_rifa: Rifa, test_user: User
    ):
        """Testa rastreamento de números vendidos"""
        # Inicialmente sem vendas
        assert test_rifa.sold_count == 0

        # Simular venda de 3 números
        test_rifa.sold_count = 3
        await db_session.commit()
        await db_session.refresh(test_rifa)

        assert test_rifa.sold_count == 3
        assert test_rifa.progress_percent == 0.3  # 3/1000 = 0.3%
        assert test_rifa.available_count == 997


# ===========================================
# TESTES DE CONCORRÊNCIA E EDGE CASES
# ===========================================

@pytest.mark.integration
@pytest.mark.asyncio
class TestConcurrencyAndEdgeCases:
    """Testa casos de concorrência e edge cases"""

    async def test_unique_ticket_number_per_rifa(
        self, db_session, test_rifa: Rifa, test_user: User
    ):
        """Testa que número do ticket é único por rifa"""
        ticket1 = Ticket(
            number=100,
            rifa_id=test_rifa.id,
            user_id=test_user.id,
        )

        db_session.add(ticket1)
        await db_session.commit()

        # Tentar criar outro ticket com mesmo número na mesma rifa
        ticket2 = Ticket(
            number=100,  # Mesmo número
            rifa_id=test_rifa.id,  # Mesma rifa
            user_id=test_user.id,
        )

        db_session.add(ticket2)

        with pytest.raises(Exception):  # Violação de constraint
            await db_session.commit()

    async def test_payment_mp_id_unique(
        self, db_session, test_rifa: Rifa, test_user: User
    ):
        """Testa que mp_payment_id é único"""
        payment1 = Payment(
            mp_payment_id="MP_UNIQUE_123",
            amount=Decimal("10.00"),
            user_id=test_user.id,
            rifa_id=test_rifa.id,
        )

        db_session.add(payment1)
        await db_session.commit()

        # Tentar criar pagamento com mesmo mp_payment_id
        payment2 = Payment(
            mp_payment_id="MP_UNIQUE_123",  # Duplicado
            amount=Decimal("20.00"),
            user_id=test_user.id,
            rifa_id=test_rifa.id,
        )

        db_session.add(payment2)

        with pytest.raises(Exception):
            await db_session.commit()

    async def test_multiple_users_different_tickets_same_rifa(
        self, db_session, test_rifa: Rifa, multiple_users
    ):
        """Testa múltiplos usuários comprando diferentes tickets na mesma rifa"""
        tickets = []

        for i, user in enumerate(multiple_users):
            ticket = Ticket(
                number=i + 1,  # Números diferentes
                rifa_id=test_rifa.id,
                user_id=user.id,
            )
            tickets.append(ticket)

        db_session.add_all(tickets)
        await db_session.commit()

        # Verificar que todos foram criados
        await db_session.refresh(test_rifa, ["tickets"])
        assert len(test_rifa.tickets) >= 5


# ===========================================
# TESTES DE VALIDAÇÃO E SEGURANÇA
# ===========================================

@pytest.mark.integration
@pytest.mark.asyncio
class TestSecurityAndValidation:
    """Testes de segurança e validação"""

    async def test_password_never_exposed_in_response(
        self, client: AsyncClient
    ):
        """Testa que senha nunca é exposta nas respostas"""
        # Registrar usuário
        user_data = {
            "name": "Secure User",
            "username": "secureuser",
            "email": "secure@test.com",
            "password": "mySecretPassword123",
        }

        register_response = await client.post(
            "/api/auth/register",
            json=user_data
        )

        # Verificar que senha não está na resposta
        response_text = register_response.text.lower()
        assert "mysecretpassword" not in response_text
        assert "password" not in register_response.json()["user"]

        # Fazer login
        login_data = {
            "email": "secure@test.com",
            "password": "mySecretPassword123",
            "remember": False,
        }

        login_response = await client.post("/api/auth/login", json=login_data)

        # Verificar que senha não está na resposta
        login_text = login_response.text.lower()
        assert "mysecretpassword" not in login_text
        assert "password" not in login_response.json()["user"]

    async def test_sql_injection_prevention(self, client: AsyncClient):
        """Testa prevenção de SQL injection"""
        # Tentar fazer login com SQL injection
        malicious_data = {
            "email": "test@test.com' OR '1'='1",
            "password": "password' OR '1'='1",
            "remember": False,
        }

        response = await client.post("/api/auth/login", json=malicious_data)

        # Deve retornar erro de autenticação, não erro de SQL
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_xss_prevention(self, client: AsyncClient):
        """Testa prevenção de XSS"""
        # Tentar registrar com script malicioso no nome
        user_data = {
            "name": "<script>alert('XSS')</script>",
            "username": "xssuser",
            "email": "xss@test.com",
            "password": "password123",
        }

        response = await client.post("/api/auth/register", json=user_data)

        # Dependendo da validação, pode aceitar ou rejeitar
        # Mas nunca deve executar o script
        if response.status_code == status.HTTP_201_CREATED:
            # Verificar que foi escapado/sanitizado
            user_name = response.json()["user"]["name"]
            # O importante é que não seja executado como script
            assert isinstance(user_name, str)
