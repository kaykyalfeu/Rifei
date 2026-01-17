# 🎯 Rifei - Plataforma de Rifas e Sorteios

Uma plataforma moderna de rifas com feed social comunitário, gamificação e integração com Mercado Pago.

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green?logo=fastapi)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-blue?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Funcionalidades

- 🎪 **Marketplace de Rifas** - Explore e participe de rifas de diversos criadores
- 📱 **Feed Social** - Veja ganhadores, conquistas e interaja com a comunidade
- 🎮 **Gamificação** - Sistema de níveis, XP, conquistas e sorte acumulada
- 💳 **Pagamentos** - Integração completa com Mercado Pago (Pix, Cartão)
- 📊 **Dashboard** - Acompanhe suas rifas, vendas e estatísticas
- 🌙 **Tema Escuro** - Suporte a tema claro e escuro
- 📱 **Responsivo** - Funciona perfeitamente em mobile e desktop

## 🛠️ Stack Tecnológica

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
- **Templates**: [Jinja2](https://jinja.palletsprojects.com/) + [HTMX](https://htmx.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados**: PostgreSQL + [SQLAlchemy](https://www.sqlalchemy.org/) (Async)
- **Autenticação**: JWT + Sessions
- **Pagamentos**: [Mercado Pago](https://www.mercadopago.com.br/)
- **Interatividade**: [Alpine.js](https://alpinejs.dev/)

## 🚀 Começando

### Pré-requisitos

- Python 3.11 ou superior
- PostgreSQL (ou Supabase)
- Conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/rifei-python.git
cd rifei-python
```

2. **Crie um ambiente virtual**

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Instale as dependências**

```bash
pip install -r requirements.txt
```

4. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

5. **Inicie o servidor**

```bash
uvicorn app.main:app --reload
```

Acesse [http://localhost:8000](http://localhost:8000)

## 📁 Estrutura do Projeto

```
rifei-python/
├── app/
│   ├── main.py              # Aplicação FastAPI
│   ├── config.py            # Configurações
│   ├── database.py          # Conexão com banco
│   ├── models/              # SQLAlchemy Models
│   ├── routers/             # API Routes
│   ├── schemas/             # Pydantic Schemas
│   ├── services/            # Lógica de negócio
│   ├── templates/           # Templates Jinja2
│   │   ├── layouts/         # Layouts base
│   │   ├── components/      # Componentes reutilizáveis
│   │   └── pages/           # Páginas
│   └── static/              # CSS, JS, imagens
├── migrations/              # Migrações Alembic
├── tests/                   # Testes
├── requirements.txt         # Dependências
├── .env.example             # Exemplo de variáveis
└── README.md
```

## 🔧 Comandos Úteis

```bash
# Servidor de desenvolvimento
uvicorn app.main:app --reload

# Criar migração
alembic revision --autogenerate -m "descrição"

# Executar migrações
alembic upgrade head

# Testes
pytest

# Formatação de código
black app/
ruff check app/
```

## 📊 Progresso de Implementação

- [x] **Parte 1**: Estrutura Base
  - [x] Configuração FastAPI
  - [x] Models do banco de dados
  - [x] Templates base (layout, header, sidebar)
  - [x] Página inicial
- [ ] **Parte 2**: Autenticação
  - [ ] Login/Cadastro
  - [ ] Sessões/JWT
  - [ ] Recuperação de senha
- [ ] **Parte 3**: Marketplace
  - [ ] Listagem de rifas
  - [ ] Filtros e busca
  - [ ] Detalhes da rifa
- [ ] **Parte 4**: Criar Rifa
  - [ ] Formulário de criação
  - [ ] Upload de imagens
- [ ] **Parte 5**: Pagamentos
  - [ ] Integração Mercado Pago
  - [ ] Webhooks
- [ ] **Parte 6**: Dashboard
  - [ ] Minhas rifas
  - [ ] Estatísticas
- [ ] **Parte 7**: Feed Social
  - [ ] Posts e interações
  - [ ] Notificações

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- 📧 Email: suporte@rifei.com.br
- 💬 Discord: [Comunidade Rifei](https://discord.gg/rifei)

---

Feito com 💚 e Python
