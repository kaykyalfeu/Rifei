# 🧪 Guia de Testes - Rifei

Este documento descreve a estrutura de testes do projeto Rifei e como utilizá-la.

## 📋 Índice

- [Estrutura de Testes](#estrutura-de-testes)
- [Executando Testes](#executando-testes)
- [Tipos de Testes](#tipos-de-testes)
- [Coverage](#coverage)
- [CI/CD](#cicd)
- [Boas Práticas](#boas-práticas)

## 🗂️ Estrutura de Testes

```
tests/
├── __init__.py
├── conftest.py              # Configurações e fixtures globais
├── test_auth_service.py     # Testes unitários de autenticação
├── test_models.py           # Testes de models do banco
├── test_auth_api.py         # Testes de API endpoints
└── test_integration.py      # Testes de integração e fluxos
```

### Fixtures Disponíveis

**Banco de Dados:**
- `db_engine` - Engine SQLite in-memory
- `db_session` - Sessão de banco para testes
- `client` - Cliente HTTP assíncrono

**Dados de Teste:**
- `test_user` - Usuário comum
- `test_creator` - Usuário criador
- `test_admin` - Usuário administrador
- `test_category` - Categoria de rifas
- `test_rifa` - Rifa ativa
- `multiple_users` - Lista de 5 usuários

**Autenticação:**
- `auth_headers` - Headers com token de usuário comum
- `creator_auth_headers` - Headers com token de criador
- `admin_auth_headers` - Headers com token de admin

**Dados Mock:**
- `sample_user_data` - Dados para criação de usuário
- `sample_rifa_data` - Dados para criação de rifa
- `temp_upload_dir` - Diretório temporário para uploads

## 🚀 Executando Testes

### Comandos Básicos

```bash
# Todos os testes
make test
# ou
pytest

# Testes com coverage
make test-cov

# Testes rápidos (sem slow tests)
make test-fast

# Apenas testes unitários
make test-unit
# ou
pytest -m "unit"

# Apenas testes de integração
make test-integration
# ou
pytest -m "integration"

# Apenas testes de API
make test-api
# ou
pytest -m "api"

# Apenas testes de autenticação
make test-auth
# ou
pytest -m "auth"

# Testes verbose
pytest -vv

# Re-executar apenas testes que falharam
pytest --lf

# Executar teste específico
pytest tests/test_auth_service.py::TestPasswordHashing::test_hash_password_generates_hash
```

### Comandos do Makefile

```bash
make help              # Ver todos os comandos disponíveis
make install           # Instalar dependências
make test              # Executar todos os testes
make test-cov          # Testes com coverage e abrir relatório
make test-fast         # Testes rápidos
make lint              # Verificar código
make format            # Formatar código
make clean             # Limpar arquivos temporários
make run               # Iniciar servidor
```

## 📊 Tipos de Testes

### 1. Testes Unitários (`@pytest.mark.unit`)

Testam funções e métodos individuais isoladamente.

**Exemplo:**
```python
@pytest.mark.unit
def test_hash_password_generates_hash():
    """Testa se hash_password gera um hash válido"""
    password = "mySecurePassword123"
    hashed = hash_password(password)

    assert hashed is not None
    assert isinstance(hashed, str)
```

**Arquivo:** `test_auth_service.py`, `test_models.py`

### 2. Testes de API (`@pytest.mark.api`)

Testam endpoints HTTP da API.

**Exemplo:**
```python
@pytest.mark.api
@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    """Testa registro com dados válidos"""
    user_data = {
        "name": "John Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "password": "securepass123",
    }

    response = await client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201
```

**Arquivo:** `test_auth_api.py`

### 3. Testes de Integração (`@pytest.mark.integration`)

Testam fluxos completos e interações entre componentes.

**Exemplo:**
```python
@pytest.mark.integration
@pytest.mark.asyncio
async def test_complete_registration_and_login_flow(client: AsyncClient):
    """Testa fluxo: registro → logout → login → acesso protegido"""
    # 1. Registrar
    # 2. Logout
    # 3. Login
    # 4. Acessar recurso protegido
```

**Arquivo:** `test_integration.py`

### 4. Testes de Banco de Dados (`@pytest.mark.database`)

Testam operações e relacionamentos do banco.

**Exemplo:**
```python
@pytest.mark.database
@pytest.mark.asyncio
async def test_user_rifa_relationship(db_session, test_creator):
    """Testa relacionamento User -> Rifas"""
    # Criar rifas e verificar relacionamento
```

### 5. Testes Lentos (`@pytest.mark.slow`)

Testes que demoram mais tempo.

```bash
# Pular testes lentos
pytest -m "not slow"
```

## 📈 Coverage

### Gerar Relatório de Coverage

```bash
# Terminal
pytest --cov=app --cov-report=term-missing

# HTML (abre no navegador)
make test-cov

# XML (para CI/CD)
pytest --cov=app --cov-report=xml
```

### Configuração de Coverage

Arquivo: `.coveragerc`

- **Meta:** >80% de cobertura
- **Branch coverage:** Habilitado
- **Relatórios:** HTML, XML, Terminal

### Interpretar Relatório

```
Name                           Stmts   Miss Branch BrPart  Cover
----------------------------------------------------------------
app/services/auth.py             120      5     30      2    94%
app/models/models.py             150     10     20      1    92%
----------------------------------------------------------------
TOTAL                            500     25     80      5    93%
```

- **Stmts:** Total de linhas
- **Miss:** Linhas não cobertas
- **Branch:** Total de branches (if/else)
- **BrPart:** Branches parcialmente cobertos
- **Cover:** % de cobertura

## 🔄 CI/CD

### GitHub Actions

Workflow configurado em `.github/workflows/tests.yml`

**Executa em:**
- Push para `main`, `develop`, `claude/**`
- Pull Requests para `main`, `develop`

**Jobs:**

1. **Test** (Python 3.11, 3.12)
   - Lint com ruff
   - Format check com black
   - Testes unitários
   - Testes de integração
   - Testes de API
   - Coverage report
   - Upload para Codecov

2. **Quality**
   - Verificação de qualidade de código
   - Ruff
   - Black

### Badges

Adicione ao README.md:

```markdown
![Tests](https://github.com/seu-usuario/rifei/workflows/Tests%20and%20Coverage/badge.svg)
[![codecov](https://codecov.io/gh/seu-usuario/rifei/branch/main/graph/badge.svg)](https://codecov.io/gh/seu-usuario/rifei)
```

## ✅ Boas Práticas

### 1. Nomenclatura de Testes

```python
# ✅ Bom
def test_user_registration_with_valid_data():
    pass

# ❌ Ruim
def test_user():
    pass
```

### 2. Arrange-Act-Assert (AAA)

```python
def test_example():
    # Arrange (preparar)
    user_data = {"name": "Test"}

    # Act (executar)
    result = create_user(user_data)

    # Assert (verificar)
    assert result.name == "Test"
```

### 3. Um Conceito por Teste

```python
# ✅ Bom - testa uma coisa
def test_password_hashing():
    hashed = hash_password("test")
    assert hashed != "test"

# ❌ Ruim - testa múltiplas coisas
def test_auth_everything():
    # testa hash
    # testa jwt
    # testa login
    # testa logout
```

### 4. Use Fixtures

```python
# ✅ Bom - usa fixture
def test_login(test_user):
    assert test_user.email == "user@test.com"

# ❌ Ruim - cria dados no teste
def test_login(db_session):
    user = User(email="user@test.com", ...)
    db_session.add(user)
    # ...
```

### 5. Testes Independentes

Cada teste deve ser independente e poder rodar sozinho.

```python
# ✅ Bom - não depende de outros testes
def test_create_user():
    user = create_user(...)
    assert user.id is not None

# ❌ Ruim - depende de ordem
def test_update_user():
    # assume que test_create_user já rodou
    user = get_user(1)  # ❌
```

### 6. Mensagens de Assert

```python
# ✅ Bom - com mensagem clara
assert user.is_active, "Usuário deve estar ativo após criação"

# ❌ Ruim - sem contexto
assert user.is_active
```

### 7. Marcadores

Use marcadores para organizar:

```python
@pytest.mark.unit
@pytest.mark.auth
@pytest.mark.slow
def test_complex_auth_flow():
    pass
```

## 🐛 Debug de Testes

### Ver output de print

```bash
pytest -s
```

### Parar no primeiro erro

```bash
pytest -x
```

### Ver traceback completo

```bash
pytest --tb=long
```

### Debug com pdb

```python
def test_something():
    import pdb; pdb.set_trace()
    # código do teste
```

### Ver warnings

```bash
pytest -v --tb=short -W all
```

## 📚 Recursos

- [Pytest Documentation](https://docs.pytest.org/)
- [pytest-asyncio](https://pytest-asyncio.readthedocs.io/)
- [Coverage.py](https://coverage.readthedocs.io/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)

---

**Dúvidas?** Abra uma issue no repositório ou consulte a documentação do pytest.
