"""
Testes unitários para os Models do banco de dados - Rifei
Testa modelos, relacionamentos e propriedades computadas
"""
import pytest
from datetime import datetime, timedelta
from decimal import Decimal

from app.models.models import (
    User,
    Category,
    Rifa,
    Ticket,
    Payment,
    FeedPost,
    UserRole,
    RifaStatus,
    PaymentStatus,
    PaymentMethod,
)
from app.services.auth import hash_password


# ===========================================
# TESTES DE USER MODEL
# ===========================================

@pytest.mark.unit
@pytest.mark.database
@pytest.mark.asyncio
class TestUserModel:
    """Testes para o modelo User"""

    async def test_create_user(self, db_session):
        """Testa criação de usuário"""
        user = User(
            email="user@example.com",
            username="testuser",
            name="Test User",
            password_hash=hash_password("password"),
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        assert user.id is not None
        assert user.email == "user@example.com"
        assert user.username == "testuser"
        assert user.name == "Test User"
        assert user.role == UserRole.USER
        assert user.is_active is True
        assert user.is_verified is False
        assert user.level == 1
        assert user.xp == 0
        assert user.total_wins == 0
        assert user.total_spent == Decimal("0")

    async def test_user_default_values(self, db_session):
        """Testa valores padrão do usuário"""
        user = User(
            email="default@test.com",
            username="defaultuser",
            name="Default",
            password_hash="hash",
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        assert user.role == UserRole.USER
        assert user.is_active is True
        assert user.is_verified is False
        assert user.level == 1
        assert user.xp == 0
        assert user.total_wins == 0

    async def test_user_email_unique(self, db_session, test_user):
        """Testa constraint de email único"""
        duplicate_user = User(
            email=test_user.email,  # Email duplicado
            username="different",
            name="Different",
            password_hash="hash",
        )

        db_session.add(duplicate_user)

        with pytest.raises(Exception):  # Violação de constraint
            await db_session.commit()

    async def test_user_username_unique(self, db_session, test_user):
        """Testa constraint de username único"""
        duplicate_user = User(
            email="different@test.com",
            username=test_user.username,  # Username duplicado
            name="Different",
            password_hash="hash",
        )

        db_session.add(duplicate_user)

        with pytest.raises(Exception):  # Violação de constraint
            await db_session.commit()

    async def test_user_repr(self, test_user):
        """Testa representação string do usuário"""
        repr_str = repr(test_user)

        assert "User" in repr_str
        assert test_user.username in repr_str

    async def test_user_timestamps(self, db_session):
        """Testa criação automática de timestamps"""
        user = User(
            email="time@test.com",
            username="timeuser",
            name="Time",
            password_hash="hash",
        )

        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        assert user.created_at is not None
        assert user.updated_at is not None
        assert isinstance(user.created_at, datetime)
        assert isinstance(user.updated_at, datetime)


# ===========================================
# TESTES DE CATEGORY MODEL
# ===========================================

@pytest.mark.unit
@pytest.mark.database
@pytest.mark.asyncio
class TestCategoryModel:
    """Testes para o modelo Category"""

    async def test_create_category(self, db_session):
        """Testa criação de categoria"""
        category = Category(
            name="Eletrônicos",
            slug="eletronicos",
            icon="📱",
            description="Smartphones e gadgets",
        )

        db_session.add(category)
        await db_session.commit()
        await db_session.refresh(category)

        assert category.id is not None
        assert category.name == "Eletrônicos"
        assert category.slug == "eletronicos"
        assert category.icon == "📱"
        assert category.is_active is True
        assert category.order == 0

    async def test_category_default_icon(self, db_session):
        """Testa ícone padrão da categoria"""
        category = Category(
            name="Test",
            slug="test",
        )

        db_session.add(category)
        await db_session.commit()
        await db_session.refresh(category)

        assert category.icon == "🎁"

    async def test_category_name_unique(self, db_session, test_category):
        """Testa constraint de nome único"""
        duplicate = Category(
            name=test_category.name,
            slug="different-slug",
        )

        db_session.add(duplicate)

        with pytest.raises(Exception):
            await db_session.commit()

    async def test_category_slug_unique(self, db_session, test_category):
        """Testa constraint de slug único"""
        duplicate = Category(
            name="Different Name",
            slug=test_category.slug,
        )

        db_session.add(duplicate)

        with pytest.raises(Exception):
            await db_session.commit()

    async def test_category_repr(self, test_category):
        """Testa representação string da categoria"""
        repr_str = repr(test_category)

        assert "Category" in repr_str
        assert test_category.name in repr_str


# ===========================================
# TESTES DE RIFA MODEL
# ===========================================

@pytest.mark.unit
@pytest.mark.database
@pytest.mark.asyncio
class TestRifaModel:
    """Testes para o modelo Rifa"""

    async def test_create_rifa(self, db_session, test_creator, test_category):
        """Testa criação de rifa"""
        rifa = Rifa(
            title="iPhone 15",
            slug="iphone-15",
            description="iPhone novo",
            price=Decimal("10.00"),
            total_numbers=100,
            end_date=datetime.utcnow() + timedelta(days=30),
            creator_id=test_creator.id,
            category_id=test_category.id,
        )

        db_session.add(rifa)
        await db_session.commit()
        await db_session.refresh(rifa)

        assert rifa.id is not None
        assert rifa.title == "iPhone 15"
        assert rifa.price == Decimal("10.00")
        assert rifa.total_numbers == 100
        assert rifa.status == RifaStatus.DRAFT
        assert rifa.sold_count == 0
        assert rifa.view_count == 0
        assert rifa.is_featured is False
        assert rifa.is_verified is False

    async def test_rifa_progress_percent_property(self, db_session, test_rifa):
        """Testa propriedade computada progress_percent"""
        # Rifa sem vendas
        assert test_rifa.progress_percent == 0.0

        # Simular vendas
        test_rifa.sold_count = 250  # 250 de 1000
        await db_session.commit()
        await db_session.refresh(test_rifa)

        assert test_rifa.progress_percent == 25.0

        # 100% vendido
        test_rifa.sold_count = 1000
        await db_session.commit()
        await db_session.refresh(test_rifa)

        assert test_rifa.progress_percent == 100.0

    async def test_rifa_available_count_property(self, db_session, test_rifa):
        """Testa propriedade computada available_count"""
        # Todos disponíveis
        assert test_rifa.available_count == 1000

        # Vender alguns
        test_rifa.sold_count = 300
        await db_session.commit()
        await db_session.refresh(test_rifa)

        assert test_rifa.available_count == 700

    async def test_rifa_slug_unique(self, db_session, test_rifa, test_creator):
        """Testa constraint de slug único"""
        duplicate = Rifa(
            title="Different Title",
            slug=test_rifa.slug,  # Slug duplicado
            description="Test",
            price=Decimal("5.00"),
            total_numbers=50,
            end_date=datetime.utcnow() + timedelta(days=15),
            creator_id=test_creator.id,
        )

        db_session.add(duplicate)

        with pytest.raises(Exception):
            await db_session.commit()

    async def test_rifa_repr(self, test_rifa):
        """Testa representação string da rifa"""
        repr_str = repr(test_rifa)

        assert "Rifa" in repr_str
        assert test_rifa.title in repr_str

    async def test_rifa_relationships(self, db_session, test_rifa):
        """Testa relacionamentos da rifa"""
        await db_session.refresh(test_rifa, ["creator", "category"])

        assert test_rifa.creator is not None
        assert test_rifa.creator.username == "testcreator"
        assert test_rifa.category is not None
        assert test_rifa.category.name == "Eletrônicos"


# ===========================================
# TESTES DE TICKET MODEL
# ===========================================

@pytest.mark.unit
@pytest.mark.database
@pytest.mark.asyncio
class TestTicketModel:
    """Testes para o modelo Ticket"""

    async def test_create_ticket(self, db_session, test_rifa, test_user):
        """Testa criação de ticket"""
        ticket = Ticket(
            number=42,
            rifa_id=test_rifa.id,
            user_id=test_user.id,
        )

        db_session.add(ticket)
        await db_session.commit()
        await db_session.refresh(ticket)

        assert ticket.id is not None
        assert ticket.number == 42
        assert ticket.is_winner is False
        assert ticket.rifa_id == test_rifa.id
        assert ticket.user_id == test_user.id

    async def test_ticket_unique_number_per_rifa(self, db_session, test_rifa, test_user):
        """Testa constraint de número único por rifa"""
        ticket1 = Ticket(
            number=10,
            rifa_id=test_rifa.id,
            user_id=test_user.id,
        )

        db_session.add(ticket1)
        await db_session.commit()

        # Tentar criar ticket com mesmo número na mesma rifa
        ticket2 = Ticket(
            number=10,  # Mesmo número
            rifa_id=test_rifa.id,  # Mesma rifa
            user_id=test_user.id,
        )

        db_session.add(ticket2)

        with pytest.raises(Exception):  # Violação de constraint
            await db_session.commit()

    async def test_ticket_repr(self, db_session, test_rifa, test_user):
        """Testa representação string do ticket"""
        ticket = Ticket(
            number=99,
            rifa_id=test_rifa.id,
            user_id=test_user.id,
        )

        db_session.add(ticket)
        await db_session.commit()

        repr_str = repr(ticket)

        assert "Ticket" in repr_str
        assert "#99" in repr_str


# ===========================================
# TESTES DE PAYMENT MODEL
# ===========================================

@pytest.mark.unit
@pytest.mark.database
@pytest.mark.asyncio
class TestPaymentModel:
    """Testes para o modelo Payment"""

    async def test_create_payment(self, db_session, test_rifa, test_user):
        """Testa criação de pagamento"""
        payment = Payment(
            amount=Decimal("100.00"),
            fee=Decimal("5.00"),
            net_amount=Decimal("95.00"),
            status=PaymentStatus.PENDING,
            method=PaymentMethod.PIX,
            user_id=test_user.id,
            rifa_id=test_rifa.id,
        )

        db_session.add(payment)
        await db_session.commit()
        await db_session.refresh(payment)

        assert payment.id is not None
        assert payment.amount == Decimal("100.00")
        assert payment.fee == Decimal("5.00")
        assert payment.net_amount == Decimal("95.00")
        assert payment.status == PaymentStatus.PENDING
        assert payment.method == PaymentMethod.PIX

    async def test_payment_default_values(self, db_session, test_rifa, test_user):
        """Testa valores padrão do pagamento"""
        payment = Payment(
            amount=Decimal("50.00"),
            user_id=test_user.id,
            rifa_id=test_rifa.id,
        )

        db_session.add(payment)
        await db_session.commit()
        await db_session.refresh(payment)

        assert payment.status == PaymentStatus.PENDING
        assert payment.fee == Decimal("0")
        assert payment.net_amount == Decimal("0")

    async def test_payment_mp_payment_id_unique(self, db_session, test_rifa, test_user):
        """Testa constraint de mp_payment_id único"""
        payment1 = Payment(
            mp_payment_id="MP123456",
            amount=Decimal("10.00"),
            user_id=test_user.id,
            rifa_id=test_rifa.id,
        )

        db_session.add(payment1)
        await db_session.commit()

        # Tentar criar pagamento com mesmo mp_payment_id
        payment2 = Payment(
            mp_payment_id="MP123456",  # Duplicado
            amount=Decimal("20.00"),
            user_id=test_user.id,
            rifa_id=test_rifa.id,
        )

        db_session.add(payment2)

        with pytest.raises(Exception):
            await db_session.commit()

    async def test_payment_repr(self, db_session, test_rifa, test_user):
        """Testa representação string do pagamento"""
        payment = Payment(
            amount=Decimal("75.00"),
            status=PaymentStatus.APPROVED,
            user_id=test_user.id,
            rifa_id=test_rifa.id,
        )

        db_session.add(payment)
        await db_session.commit()

        repr_str = repr(payment)

        assert "Payment" in repr_str
        assert str(payment.id) in repr_str
        assert "approved" in repr_str.lower()


# ===========================================
# TESTES DE FEEDPOST MODEL
# ===========================================

@pytest.mark.unit
@pytest.mark.database
@pytest.mark.asyncio
class TestFeedPostModel:
    """Testes para o modelo FeedPost"""

    async def test_create_feed_post(self, db_session, test_user, test_rifa):
        """Testa criação de post no feed"""
        post = FeedPost(
            type="winner",
            content="Parabéns ao ganhador!",
            user_id=test_user.id,
            rifa_id=test_rifa.id,
            metadata_={"prize": "iPhone 15"},
        )

        db_session.add(post)
        await db_session.commit()
        await db_session.refresh(post)

        assert post.id is not None
        assert post.type == "winner"
        assert post.content == "Parabéns ao ganhador!"
        assert post.likes_count == 0
        assert post.comments_count == 0
        assert post.metadata_ == {"prize": "iPhone 15"}

    async def test_feed_post_default_counters(self, db_session, test_user):
        """Testa contadores padrão do post"""
        post = FeedPost(
            type="general",
            content="Post de teste",
            user_id=test_user.id,
        )

        db_session.add(post)
        await db_session.commit()
        await db_session.refresh(post)

        assert post.likes_count == 0
        assert post.comments_count == 0

    async def test_feed_post_repr(self, db_session, test_user):
        """Testa representação string do post"""
        post = FeedPost(
            type="achievement",
            content="Desbloqueou uma conquista!",
            user_id=test_user.id,
        )

        db_session.add(post)
        await db_session.commit()

        repr_str = repr(post)

        assert "FeedPost" in repr_str
        assert str(post.id) in repr_str
        assert "achievement" in repr_str


# ===========================================
# TESTES DE ENUMS
# ===========================================

@pytest.mark.unit
class TestEnums:
    """Testes para os Enums do sistema"""

    def test_user_role_enum(self):
        """Testa enum UserRole"""
        assert UserRole.USER.value == "user"
        assert UserRole.CREATOR.value == "creator"
        assert UserRole.ADMIN.value == "admin"

    def test_rifa_status_enum(self):
        """Testa enum RifaStatus"""
        assert RifaStatus.DRAFT.value == "draft"
        assert RifaStatus.ACTIVE.value == "active"
        assert RifaStatus.COMPLETED.value == "completed"
        assert RifaStatus.CANCELLED.value == "cancelled"

    def test_payment_status_enum(self):
        """Testa enum PaymentStatus"""
        assert PaymentStatus.PENDING.value == "pending"
        assert PaymentStatus.APPROVED.value == "approved"
        assert PaymentStatus.REJECTED.value == "rejected"
        assert PaymentStatus.REFUNDED.value == "refunded"
        assert PaymentStatus.CANCELLED.value == "cancelled"

    def test_payment_method_enum(self):
        """Testa enum PaymentMethod"""
        assert PaymentMethod.PIX.value == "pix"
        assert PaymentMethod.CREDIT_CARD.value == "credit_card"
        assert PaymentMethod.DEBIT_CARD.value == "debit_card"
