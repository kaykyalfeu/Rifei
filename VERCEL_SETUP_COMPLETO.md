# 🚀 Guia Completo de Deploy no Vercel

## ❌ Problema: Erro 404

O erro 404 no Vercel acontece porque o projeto Next.js está dentro da pasta `rifei/`, mas o Vercel está procurando na raiz do repositório.

## ✅ Solução: Configurar Root Directory

### Passo 1: Acessar o Projeto no Vercel

1. Acesse https://vercel.com/dashboard
2. Clique no projeto **Rifei**
3. Vá em **Settings** (Configurações)

### Passo 2: Configurar Root Directory

1. No menu lateral, clique em **General** (Geral)
2. Procure pela seção **Build & Development Settings**
3. Encontre o campo **Root Directory**
4. Clique em **Edit** (Editar)
5. Digite: `rifei`
6. Clique em **Save** (Salvar)

### Passo 3: Verificar Outras Configurações

Na mesma seção **Build & Development Settings**, certifique-se que:

- **Framework Preset**: `Next.js` (deve detectar automaticamente)
- **Build Command**: `npm run build` (padrão)
- **Output Directory**: `.next` (padrão)
- **Install Command**: `npm install` (padrão)

### Passo 4: Configurar Variáveis de Ambiente

1. No menu lateral, clique em **Environment Variables**
2. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
NEXT_PUBLIC_APP_URL=https://rifei.vercel.app
```

⚠️ **IMPORTANTE**: Se você não tiver Supabase configurado ainda, pode usar valores placeholder:
```
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
SUPABASE_SERVICE_ROLE_KEY=placeholder-service-key
NEXT_PUBLIC_APP_URL=https://rifei.vercel.app
```

O sistema detectará automaticamente e usará dados mock.

### Passo 5: Fazer Redeploy

1. Vá em **Deployments** (Implantações)
2. Clique nos 3 pontinhos do deployment mais recente
3. Clique em **Redeploy**
4. Aguarde o build completar

## 📊 O Que Esperar Após o Deploy

### ✅ Páginas que Funcionarão:

1. **/** - Homepage com landing page completa
2. **/auth/login** - Página de login
3. **/auth/cadastro** - Página de cadastro
4. **/main/marketplace** - Marketplace de rifas
5. **/main/marketplace/[slug]** - Página individual de rifa
6. **/main/checkout** - Finalização de compra
7. **/main/compra/sucesso** - Página de sucesso
8. **/main/dashboard** - Dashboard do usuário
9. **/main/criar** - Criar nova rifa
10. **/main/feed** - Feed social

### 🎨 Funcionalidades Visuais:

- ✅ Dark mode funcional
- ✅ Animações e transições
- ✅ Gradientes e efeitos visuais
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Mock data para demonstração

### 📝 Mock Data:

Como o Supabase não está conectado, todas as páginas usam mock data:
- Rifas de exemplo no marketplace
- Usuário fictício no dashboard
- Números simulados na seleção
- Estatísticas de exemplo

## 🔧 Troubleshooting

### Se ainda der erro 404:

1. **Verifique o Root Directory**:
   - Deve ser exatamente `rifei` (sem barra no início ou final)
   - Settings > General > Build & Development Settings > Root Directory

2. **Force um novo deploy**:
   - Deployments > ⋯ > Redeploy

3. **Verifique os logs**:
   - Clique no deployment
   - Vá em "Building" para ver logs de build
   - Procure por erros

### Se o build falhar:

1. **Verifique se instalou as dependências**:
   ```bash
   cd rifei
   npm install
   ```

2. **Teste localmente**:
   ```bash
   npm run build
   ```
   Se funcionar localmente, funcionará no Vercel.

3. **Verifique os logs do Vercel**:
   - Procure por erros de TypeScript ou ESLint
   - Nosso `next.config.js` já ignora esses erros

## 📱 Depois do Deploy

### URLs Funcionais:

- `https://seu-projeto.vercel.app/` - Homepage
- `https://seu-projeto.vercel.app/main/marketplace` - Marketplace
- `https://seu-projeto.vercel.app/main/dashboard` - Dashboard

### Próximos Passos:

1. **Conectar Supabase** (quando estiver pronto):
   - Criar projeto no Supabase
   - Configurar variáveis de ambiente
   - Dados reais substituirão os mocks

2. **Adicionar Mercado Pago**:
   - Criar conta no Mercado Pago
   - Obter credenciais
   - Integrar pagamentos

3. **Upload de Imagens**:
   - Configurar Supabase Storage
   - ou usar Cloudinary/Uploadcare

## 🎯 Status Atual

### ✅ Implementado:
- [x] Estrutura completa de páginas
- [x] Componentes de UI (Button, Card, Badge, Avatar, Tabs, etc.)
- [x] Layout responsivo
- [x] Dark mode
- [x] Sistema de rotas
- [x] Middleware
- [x] Mock data para visualização

### ⏳ Pendente:
- [ ] Integração Supabase real
- [ ] Integração Mercado Pago
- [ ] Upload de imagens
- [ ] Sistema de autenticação real
- [ ] Hooks customizados (useCarrinho, useAuth, etc.)
- [ ] Feed social com posts
- [ ] Sistema de notificações
- [ ] Gamificação (XP, níveis, conquistas)

## 🆘 Precisa de Ajuda?

Se após seguir todos os passos ainda houver problemas:

1. Tire um screenshot da página de erro
2. Copie os logs de build do Vercel
3. Verifique se o Root Directory está correto
4. Tente um redeploy forçado

## 📞 Comandos Úteis

### Localmente:
```bash
# Instalar dependências
cd rifei && npm install

# Testar build
npm run build

# Rodar localmente
npm run dev
```

### No Vercel:
```bash
# Instalar CLI do Vercel
npm i -g vercel

# Deploy manual
cd rifei && vercel

# Deploy para produção
cd rifei && vercel --prod
```

## ✨ Conclusão

Após configurar o **Root Directory** corretamente, o site deve funcionar perfeitamente no Vercel com todas as páginas e funcionalidades visuais operacionais usando mock data.

O projeto está pronto para visualização e demonstração!
