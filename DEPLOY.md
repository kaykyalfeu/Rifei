# 🚀 GUIA DE DEPLOY - RIFEI NA VERCEL

## 📋 Pré-requisitos

Antes de fazer o deploy, você precisa:

1. ✅ Conta na [Vercel](https://vercel.com)
2. ✅ Conta no [Supabase](https://supabase.com)
3. ✅ Conta no [Mercado Pago](https://www.mercadopago.com.br/developers)

---

## 🔧 PASSO 1: Configurar Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em "New Project"
3. Escolha:
   - **Name:** Rifei
   - **Database Password:** Crie uma senha forte
   - **Region:** São Paulo (South America)
4. Aguarde a criação (2-3 minutos)

### 1.2 Obter Credenciais

Após criar o projeto:

1. Vá em **Settings** → **API**
2. Copie os seguintes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Executar Migrations

1. No dashboard do Supabase, vá em **SQL Editor**
2. Copie o conteúdo do arquivo `rifei/supabase/migrations/001_initial_schema.sql`
3. Cole no editor e execute (clique em "Run")

---

## 💳 PASSO 2: Configurar Mercado Pago

### 2.1 Criar Aplicação

1. Acesse [https://www.mercadopago.com.br/developers/panel/app](https://www.mercadopago.com.br/developers/panel/app)
2. Clique em "Criar aplicação"
3. Preencha:
   - **Nome:** Rifei
   - **Tipo:** Pagamentos online e presenciais
4. Clique em "Criar aplicação"

### 2.2 Obter Credenciais

1. Na aplicação criada, vá em **Credenciais de produção** (ou teste)
2. Copie:
   - **Access Token** → `MERCADOPAGO_ACCESS_TOKEN`
   - **Public Key** → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`

---

## 🌐 PASSO 3: Deploy na Vercel

### 3.1 Importar Projeto

1. Acesse [https://vercel.com/new](https://vercel.com/new)
2. Conecte sua conta do GitHub
3. Selecione o repositório **Rifei**
4. Clique em "Import"

### 3.2 Configurar Projeto

**IMPORTANTE:** Configure o diretório raiz corretamente:

1. Em **Framework Preset**, selecione: `Next.js`
2. Em **Root Directory**, clique em "Edit" e selecione: `rifei`
3. Em **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3.3 Adicionar Variáveis de Ambiente

Clique em **Environment Variables** e adicione:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=cole_aqui_sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_aqui_sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=cole_aqui_sua_service_role_key

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=cole_aqui_seu_access_token
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=cole_aqui_sua_public_key

# App
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
NEXT_PUBLIC_APP_NAME=Rifei

# Webhook (gere um secret aleatório)
WEBHOOK_SECRET=gere_um_secret_aleatorio_aqui

# Node Env
NODE_ENV=production
```

### 3.4 Deploy

1. Clique em **Deploy**
2. Aguarde o build (2-5 minutos)
3. ✅ Projeto no ar!

---

## 🔍 PASSO 4: Verificar Deploy

Após o deploy, acesse:

- ✅ Homepage: `https://seu-projeto.vercel.app/`
- ✅ Login: `https://seu-projeto.vercel.app/auth/login`
- ✅ Cadastro: `https://seu-projeto.vercel.app/auth/cadastro`
- ✅ Marketplace: `https://seu-projeto.vercel.app/main/marketplace`
- ✅ Feed: `https://seu-projeto.vercel.app/main/feed`

---

## 🐛 Troubleshooting

### Erro 404 nas Páginas

**Problema:** Páginas retornam 404
**Solução:**
1. Verifique se o **Root Directory** está configurado como `rifei`
2. Redeploye o projeto

### Erro de Variáveis de Ambiente

**Problema:** `process.env.NEXT_PUBLIC_SUPABASE_URL is undefined`
**Solução:**
1. Adicione todas as variáveis na Vercel
2. Redeploye o projeto (as variáveis só são aplicadas no novo deploy)

### Build Falha

**Problema:** Build falha com erro de TypeScript
**Solução:**
1. No painel da Vercel, vá em **Settings** → **General**
2. Em **Build & Development Settings**, adicione:
   - Em **Build Command:** `npm run build || true` (ignora erros de tipo temporariamente)

### Erro de Autenticação

**Problema:** Login não funciona
**Solução:**
1. Verifique se as variáveis do Supabase estão corretas
2. No Supabase, vá em **Authentication** → **URL Configuration**
3. Adicione seu domínio Vercel em **Site URL** e **Redirect URLs**

---

## 📊 Configurações Adicionais Recomendadas

### Analytics

1. No painel da Vercel, vá em **Analytics**
2. Ative o Vercel Analytics

### Custom Domain

1. No painel da Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio customizado (ex: `rifei.com.br`)

### Supabase Callbacks

No Supabase Dashboard:

1. Vá em **Authentication** → **URL Configuration**
2. Configure:
   - **Site URL:** `https://seu-projeto.vercel.app`
   - **Redirect URLs:** `https://seu-projeto.vercel.app/auth/callback`

---

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Teste o cadastro e login
2. ✅ Configure o OAuth do Google (opcional)
3. ✅ Ative o Mercado Pago em produção
4. ✅ Faça seed de categorias no banco
5. ✅ Crie sua primeira rifa de teste

---

## 📝 Comandos Úteis

### Redeployar
```bash
git add .
git commit -m "feat: nova feature"
git push
# Vercel faz deploy automático!
```

### Ver Logs
```bash
# No painel da Vercel
Deployments → Selecione o deploy → View Function Logs
```

### Rollback
```bash
# No painel da Vercel
Deployments → Selecione deploy anterior → Promote to Production
```

---

## 🆘 Precisa de Ajuda?

- 📖 [Documentação Vercel](https://vercel.com/docs)
- 📖 [Documentação Supabase](https://supabase.com/docs)
- 📖 [Documentação Next.js](https://nextjs.org/docs)
- 🐛 [Reportar Issue](https://github.com/seu-usuario/rifei/issues)

---

**Criado por:** Claude
**Data:** 2026-01-17
**Versão:** 1.0.0
