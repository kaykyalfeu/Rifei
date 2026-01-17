# 🚀 Deploy Rápido na Vercel - 5 Minutos

## ⚡ PASSO A PASSO RÁPIDO

### 1. Importar Projeto na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte seu GitHub
3. Selecione o repositório **Rifei**
4. Clique em **Import**

### 2. Configurar Root Directory ⭐ CRÍTICO

Na tela de configuração:

1. Em **Root Directory**, clique em **Edit**
2. Digite: `rifei`
3. Pressione Enter

### 3. Adicionar Variáveis de Ambiente

Clique em **Environment Variables** e adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
NODE_ENV=production
```

*(Use placeholders temporários - configure os valores reais depois)*

### 4. Deploy!

1. Clique em **Deploy**
2. Aguarde 2-5 minutos
3. ✅ Pronto!

---

## 🧪 Testar

Acesse seu site em: `https://seu-projeto.vercel.app`

Teste estas páginas:

- ✅ `/` - Homepage
- ✅ `/auth/login` - Login
- ✅ `/auth/cadastro` - Cadastro
- ✅ `/main/marketplace` - Marketplace
- ✅ `/main/feed` - Feed

**Todas devem funcionar SEM erro 404!**

---

## ❌ Se der erro 404

1. Vá em **Settings** → **General**
2. Verifique **Root Directory** = `rifei`
3. **Redeploy** (Deployments → ... → Redeploy)

---

## 📚 Próximos Passos

Depois que o site estiver no ar:

1. **Configurar Supabase** → Veja `../DEPLOY.md`
2. **Configurar Mercado Pago** → Veja `../DEPLOY.md`
3. **Implementar autenticação** → Veja `../NEXTJS_O_QUE_FALTA.md`

---

## 🆘 Ajuda

- 📖 [DEPLOY.md](../DEPLOY.md) - Guia completo
- 📖 [SOLUCAO_404.md](../SOLUCAO_404.md) - Resolver erro 404
- 📖 [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Configuração técnica

---

**Deploy em 5 minutos!** ⚡
