# 🎯 RIFEI - Resumo para Continuidade

## O que é o projeto
Plataforma de rifas/sorteios online com feed social, gamificação e pagamentos via Mercado Pago.

## Stack escolhida
- **Backend**: FastAPI (Python 3.11+)
- **Templates**: Jinja2 + HTMX
- **Estilização**: Tailwind CSS (via CDN)
- **Interatividade**: Alpine.js
- **Banco de dados**: PostgreSQL + SQLAlchemy Async
- **Autenticação**: JWT + Sessions (Cookies)
- **Pagamentos**: Mercado Pago

## ✅ Parte 1 (Concluída): Estrutura Base
- Configuração FastAPI (`app/config.py`, `app/database.py`)
- Models completos (`app/models/models.py`):
  - User (com roles, gamificação, níveis)
  - Category
  - Rifa (com status, números, progresso)
  - Ticket (número comprado)
  - Payment (integração MP)
  - FeedPost
- Templates base:
  - `layouts/base.html` (com Tailwind, HTMX, Alpine.js, Lucide icons)
  - `components/header.html` (responsivo, dark mode, menu user)
  - `components/sidebar.html` (categorias, conquistas)
  - `pages/home.html` (landing page completa)
- Arquivos estáticos (CSS, JS, favicon)
- README, requirements.txt, .env.example

## ✅ Parte 2 (Concluída): Autenticação
- **Schemas Pydantic** (`app/schemas/auth.py`):
  - UserCreate, UserLogin, UserResponse
  - Token, TokenData, AuthResponse
  - PasswordChange, PasswordReset
- **Service de Auth** (`app/services/auth.py`):
  - Hash de senha com bcrypt
  - Criação/verificação JWT
  - Funções: authenticate_user, create_user, get_user_by_*
- **Dependencies** (`app/dependencies.py`):
  - get_current_user (obrigatório)
  - get_optional_user (opcional - para páginas públicas)
  - require_role, get_admin_user, get_creator_user
  - Types: CurrentUser, OptionalUser, AdminUser, etc.
- **Router de Auth** (`app/routers/auth.py`):
  - Páginas: GET /login, GET /cadastro, GET /logout
  - API: POST /api/auth/register, /login, /logout, GET /me, /check
  - Formulários: POST /auth/login, /auth/register
  - Validação em tempo real: /check-email, /check-username
- **Templates**:
  - `pages/login.html` (com validação, remember me, social login placeholder)
  - `pages/cadastro.html` (com validação em tempo real, força de senha)
- **Sessões via Cookie**: session_token httponly

## 📋 Parte 3 (Próxima): Marketplace
Implementar:
1. **Schemas** - RifaCreate, RifaUpdate, RifaResponse, RifaListResponse
2. **Services** - CRUD de rifas, filtros, busca
3. **Router** - /api/rifas (CRUD), /marketplace, /rifa/{slug}
4. **Templates**:
   - `pages/marketplace.html` (grid de rifas, filtros, busca)
   - `pages/rifa_detail.html` (detalhes, seleção de números, compra)
   - `components/rifa_card.html` (card reutilizável)
5. **Funcionalidades**:
   - Listagem com paginação
   - Filtros por categoria, preço, status
   - Busca por título/descrição
   - Ordenação (recentes, populares, terminando)

## 📁 Estrutura atual
```
rifei-python/
├── app/
│   ├── __init__.py
│   ├── config.py              ✅
│   ├── database.py            ✅
│   ├── main.py                ✅ (atualizado com auth)
│   ├── dependencies.py        ✅ (novo)
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py          ✅
│   ├── routers/
│   │   ├── __init__.py        ✅
│   │   ├── auth.py            ✅ (novo)
│   │   └── rifas.py           🔜
│   ├── schemas/
│   │   ├── __init__.py        ✅
│   │   ├── auth.py            ✅ (novo)
│   │   └── rifas.py           🔜
│   ├── services/
│   │   ├── __init__.py        ✅
│   │   ├── auth.py            ✅ (novo)
│   │   └── rifas.py           🔜
│   └── templates/
│       ├── layouts/
│       │   └── base.html      ✅
│       ├── components/
│       │   ├── header.html    ✅
│       │   ├── sidebar.html   ✅
│       │   └── rifa_card.html 🔜
│       └── pages/
│           ├── home.html      ✅
│           ├── login.html     ✅ (novo)
│           ├── cadastro.html  ✅ (novo)
│           ├── marketplace.html 🔜
│           └── rifa_detail.html 🔜
├── requirements.txt           ✅
├── .env.example               ✅
└── README.md                  ✅
```

## 🔑 Rotas de Autenticação implementadas

### Páginas HTML
- `GET /login` - Página de login
- `GET /cadastro` - Página de cadastro
- `GET /logout` - Logout (remove cookie e redireciona)

### API (JSON)
- `POST /api/auth/register` - Cadastro via API
- `POST /api/auth/login` - Login via API
- `POST /api/auth/logout` - Logout via API
- `GET /api/auth/me` - Dados do usuário logado
- `GET /api/auth/check` - Verifica se está autenticado
- `POST /api/auth/check-email` - Verifica se email existe
- `POST /api/auth/check-username` - Verifica se username existe

### Formulários (POST redirect)
- `POST /auth/login` - Login via form
- `POST /auth/register` - Cadastro via form

## Plano completo do projeto
1. ✅ Estrutura Base
2. ✅ Autenticação (login, cadastro, sessões)
3. 🔜 Marketplace (listagem, filtros, detalhes)
4. 🔜 Criar Rifa (formulário, upload)
5. 🔜 Pagamentos (Mercado Pago, webhooks)
6. 🔜 Dashboard (minhas rifas, estatísticas)
7. 🔜 Feed Social (posts, interações)

---

## 💬 Prompt sugerido para nova conversa (Parte 3):

```
Estou desenvolvendo o RIFEI, uma plataforma de rifas em Python com FastAPI.

Já completei:
- Parte 1: Estrutura Base
- Parte 2: Autenticação completa (JWT, sessões, login, cadastro)

Preciso continuar com a Parte 3: Marketplace.

Anexo o arquivo rifei-python.zip com o projeto atual.

O que preciso implementar:
1. Schemas Pydantic para rifas (RifaCreate, RifaResponse, etc.)
2. Service de rifas (CRUD, filtros, busca)
3. Router /api/rifas e páginas /marketplace, /rifa/{slug}
4. Templates de marketplace e detalhe da rifa
5. Componente rifa_card.html reutilizável
6. Paginação e filtros

Stack: FastAPI + Jinja2 + HTMX + Tailwind + Alpine.js + SQLAlchemy Async

Por favor, continue o desenvolvimento parte por parte.
```
