# Makefile para Rifei - Comandos úteis de desenvolvimento e teste

.PHONY: help install test test-unit test-integration test-cov test-fast lint format clean run db-migrate db-upgrade

# Variáveis
PYTHON := python3
PYTEST := pytest
PIP := pip3

help:
	@echo "Comandos disponíveis:"
	@echo "  make install          - Instala dependências do projeto"
	@echo "  make test             - Executa todos os testes"
	@echo "  make test-unit        - Executa apenas testes unitários"
	@echo "  make test-integration - Executa apenas testes de integração"
	@echo "  make test-cov         - Executa testes com coverage e abre relatório"
	@echo "  make test-fast        - Executa testes rápidos (sem slow tests)"
	@echo "  make lint             - Verifica código com ruff"
	@echo "  make format           - Formata código com black"
	@echo "  make clean            - Remove arquivos temporários"
	@echo "  make run              - Inicia servidor de desenvolvimento"
	@echo "  make db-migrate       - Cria nova migração do banco"
	@echo "  make db-upgrade       - Aplica migrações pendentes"

install:
	@echo "📦 Instalando dependências..."
	$(PIP) install -r requirements.txt
	@echo "✅ Dependências instaladas!"

test:
	@echo "🧪 Executando todos os testes..."
	$(PYTEST)

test-unit:
	@echo "🧪 Executando testes unitários..."
	$(PYTEST) -m "unit"

test-integration:
	@echo "🧪 Executando testes de integração..."
	$(PYTEST) -m "integration"

test-api:
	@echo "🧪 Executando testes de API..."
	$(PYTEST) -m "api"

test-auth:
	@echo "🧪 Executando testes de autenticação..."
	$(PYTEST) -m "auth"

test-cov:
	@echo "📊 Executando testes com coverage..."
	$(PYTEST) --cov=app --cov-report=html --cov-report=term-missing
	@echo "📈 Abrindo relatório de coverage..."
	@$(PYTHON) -m webbrowser htmlcov/index.html || open htmlcov/index.html || xdg-open htmlcov/index.html

test-fast:
	@echo "⚡ Executando testes rápidos..."
	$(PYTEST) -m "not slow"

test-watch:
	@echo "👀 Executando testes em modo watch..."
	$(PYTEST) -f

test-verbose:
	@echo "🔍 Executando testes em modo verbose..."
	$(PYTEST) -vv

test-failed:
	@echo "🔁 Re-executando testes que falharam..."
	$(PYTEST) --lf

lint:
	@echo "🔍 Verificando código com ruff..."
	ruff check app tests

format:
	@echo "✨ Formatando código com black..."
	black app tests
	@echo "✅ Código formatado!"

clean:
	@echo "🧹 Limpando arquivos temporários..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf htmlcov/
	rm -rf .coverage
	rm -rf coverage.xml
	rm -rf dist/
	rm -rf build/
	@echo "✅ Limpeza concluída!"

run:
	@echo "🚀 Iniciando servidor de desenvolvimento..."
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

run-prod:
	@echo "🚀 Iniciando servidor em modo produção..."
	uvicorn app.main:app --host 0.0.0.0 --port 8000

db-migrate:
	@echo "📝 Criando nova migração..."
	@read -p "Nome da migração: " name; \
	alembic revision --autogenerate -m "$$name"

db-upgrade:
	@echo "⬆️  Aplicando migrações..."
	alembic upgrade head

db-downgrade:
	@echo "⬇️  Revertendo última migração..."
	alembic downgrade -1

db-reset:
	@echo "⚠️  Resetando banco de dados..."
	@read -p "Tem certeza? Todos os dados serão perdidos! [y/N]: " confirm; \
	if [ "$$confirm" = "y" ]; then \
		alembic downgrade base; \
		alembic upgrade head; \
		echo "✅ Banco resetado!"; \
	else \
		echo "❌ Operação cancelada"; \
	fi

dev-setup:
	@echo "🛠️  Configurando ambiente de desenvolvimento..."
	@make install
	@echo "📝 Criando arquivo .env..."
	@if [ ! -f .env ]; then \
		cp .env.example .env 2>/dev/null || echo "Crie manualmente o arquivo .env"; \
	fi
	@echo "✅ Setup completo! Execute 'make run' para iniciar o servidor"

# Atalhos
t: test
tc: test-cov
tf: test-fast
l: lint
f: format
r: run
c: clean
