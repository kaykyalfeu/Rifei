# ⚙️ CONFIGURAÇÃO VERCEL - RIFEI

## 🎯 CONFIGURAÇÃO CRÍTICA

Ao importar o projeto na Vercel, siga EXATAMENTE estas configurações:

### 1. Root Directory

**IMPORTANTE:** Configure o diretório raiz como `rifei`

```
Root Directory: rifei
```

Clique em "Edit" ao lado de "Root Directory" e selecione a pasta `rifei`.

### 2. Framework Preset

```
Framework Preset: Next.js
```

### 3. Build & Development Settings

```
Build Command: npm run build
Output Directory: .next (padrão do Next.js)
Install Command: npm install
```

### 4. Node.js Version

```
Node.js Version: 18.x ou superior
```

### 5. Environment Variables

Adicione TODAS estas variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
MERCADOPAGO_ACCESS_TOKEN=seu-access-token
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=sua-public-key
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
NEXT_PUBLIC_APP_NAME=Rifei
WEBHOOK_SECRET=seu-secret-aleatorio
NODE_ENV=production
```

---

## 🚨 ERRO 404? SIGA ESTES PASSOS

Se você está vendo erro 404 após o deploy:

### Passo 1: Verificar Root Directory

1. Vá em **Settings** → **General**
2. Procure por **Root Directory**
3. Deve estar: `rifei`
4. Se não estiver, clique em "Edit" e configure

### Passo 2: Verificar Build

1. Vá em **Deployments**
2. Clique no último deployment
3. Clique em **View Build Logs**
4. Verifique se há erros

### Passo 3: Redeploy

Após configurar o Root Directory:

1. Vá em **Deployments**
2. Clique no último deployment
3. Clique nos 3 pontinhos (...)
4. Clique em **Redeploy**
5. Marque a opção **Use existing Build Cache**
6. Clique em **Redeploy**

### Passo 4: Verificar Rotas

Teste estas URLs após o deploy:

- ✅ `https://seu-dominio.vercel.app/` (Homepage)
- ✅ `https://seu-dominio.vercel.app/auth/login` (Login)
- ✅ `https://seu-dominio.vercel.app/auth/cadastro` (Cadastro)
- ✅ `https://seu-dominio.vercel.app/main/marketplace` (Marketplace)
- ✅ `https://seu-dominio.vercel.app/main/feed` (Feed)

---

## 🔍 Diagnóstico de Problemas

### Erro: "Module not found"

**Causa:** Dependências não instaladas
**Solução:**
```bash
# Localmente, delete node_modules e reinstale
cd rifei
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Erro: "ENV variable is undefined"

**Causa:** Variáveis de ambiente não configuradas
**Solução:**
1. Adicione TODAS as variáveis na Vercel
2. Redeploye (variáveis só aplicam em novo deploy)

### Build com Warnings

**TypeScript Warnings:** É normal ter alguns warnings no build. O projeto ainda funcionará.

---

## 📦 Estrutura Esperada

A Vercel deve detectar esta estrutura:

```
Rifei/ (root do repositório)
└── rifei/ (Root Directory configurado)
    ├── package.json
    ├── next.config.js
    ├── tsconfig.json
    ├── postcss.config.js
    ├── tailwind.config.ts
    ├── .env.local (não comitado)
    ├── public/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── globals.css
    │   │   ├── auth/
    │   │   │   ├── login/
    │   │   │   │   └── page.tsx
    │   │   │   └── cadastro/
    │   │   │       └── page.tsx
    │   │   └── main/
    │   │       ├── feed/
    │   │       │   └── page.tsx
    │   │       └── marketplace/
    │   │           └── page.tsx
    │   ├── components/
    │   ├── lib/
    │   ├── hooks/
    │   ├── stores/
    │   └── types/
    └── supabase/
```

---

## ✅ Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] Root Directory configurado como `rifei`
- [ ] Todas as variáveis de ambiente adicionadas
- [ ] Framework preset é `Next.js`
- [ ] Node.js version >= 18.x
- [ ] Arquivo `postcss.config.js` existe
- [ ] Arquivo `tailwind.config.ts` existe
- [ ] Todas as páginas criadas (`login`, `cadastro`, `marketplace`, `feed`)

---

## 🎉 Deploy Bem-Sucedido

Após deploy bem-sucedido, você verá:

1. ✅ Build completo sem erros críticos
2. ✅ Homepage carrega normalmente
3. ✅ Todas as rotas acessíveis
4. ✅ Assets estáticos carregam
5. ✅ CSS/Tailwind funcionando

---

**Última atualização:** 2026-01-17
