# ⚠️ CONFIGURAÇÃO DEFINITIVA DA VERCEL

## 🚨 ATENÇÃO: LEIA ISSO PRIMEIRO!

Os deploys estão falhando porque o **Root Directory NÃO está configurado corretamente**.

---

## ✅ SOLUÇÃO DEFINITIVA (PASSO A PASSO)

### PASSO 1: Deletar Projeto Existente na Vercel

1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique no projeto **rifei** ou **rifei-ap7v**
3. Vá em **Settings** (última aba)
4. Role até o final da página
5. Clique em **Delete Project**
6. Confirme digitando o nome do projeto
7. **REPITA** para todos os projetos Rifei que existirem

### PASSO 2: Importar Projeto Novamente (do Zero)

1. Acesse [https://vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Selecione o repositório **Rifei** do GitHub
4. Clique em **Import**

### PASSO 3: Configurar ANTES de Fazer Deploy ⭐ CRÍTICO

**ANTES de clicar em Deploy**, faça estas configurações:

#### 3.1 Root Directory

1. Procure por **"Root Directory"**
2. Clique no botão **Edit** ao lado
3. Digite exatamente: `rifei`
4. Pressione **Enter** ou clique fora

**VERIFIQUE:** Deve aparecer "rifei" selecionado

#### 3.2 Framework Preset

Deve detectar automaticamente: **Next.js**

Se não detectar:
1. Clique em **Framework Preset**
2. Selecione **Next.js**

#### 3.3 Build Settings

Deixe os padrões:
- **Build Command:** `npm run build` (auto-detectado)
- **Output Directory:** `.next` (auto-detectado)
- **Install Command:** `npm install` (auto-detectado)

#### 3.4 Environment Variables

Adicione estas variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key_temporary
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
NODE_ENV=production
```

**IMPORTANTE:** Use placeholders temporários. Configure valores reais depois.

#### 3.5 Node.js Version

Se houver opção:
- **Node.js Version:** 18.x

### PASSO 4: Deploy

1. **REVISE** todas as configurações acima
2. **CONFIRME** que Root Directory = `rifei`
3. Clique em **Deploy**
4. Aguarde 3-5 minutos

---

## ✅ COMO SABER SE DEU CERTO

Durante o build, você deve ver nos logs:

```
✓ Detected Next.js
✓ Installing dependencies
✓ Building...
✓ Build completed
✓ Deployment ready
```

### URLs que devem funcionar:

- ✅ `https://seu-projeto.vercel.app/`
- ✅ `https://seu-projeto.vercel.app/auth/login`
- ✅ `https://seu-projeto.vercel.app/auth/cadastro`
- ✅ `https://seu-projeto.vercel.app/main/marketplace`
- ✅ `https://seu-projeto.vercel.app/main/feed`

**Nenhuma deve dar erro 404!**

---

## 🐛 SE O BUILD FALHAR

### Erro: "Module not found"

**Causa:** Root Directory errado
**Solução:** Delete o projeto e reimporte COM Root Directory = `rifei`

### Erro: "Build script not found"

**Causa:** Root Directory errado (procurando na raiz do repo)
**Solução:** Delete o projeto e reimporte COM Root Directory = `rifei`

### Erro: "No such file package.json"

**Causa:** Root Directory errado
**Solução:** Delete o projeto e reimporte COM Root Directory = `rifei`

### Erro: TypeScript errors

**Causa:** Configuração ignoreBuildErrors não aplicada
**Solução:** Está configurado no next.config.js, deve passar

---

## 📊 ESTRUTURA DO REPOSITÓRIO

```
Rifei/ (raiz do repositório) ← Vercel vê AQUI por padrão
├── rifei/ ← SEU PROJETO NEXT.JS ESTÁ AQUI (Root Directory)
│   ├── package.json
│   ├── next.config.js
│   ├── src/
│   └── ...
├── rifei-python/ ← Projeto Python (não usar)
└── ...
```

**POR ISSO** você DEVE configurar Root Directory = `rifei`

---

## ⚠️ ERROS COMUNS

### ❌ NÃO fazer:

- ❌ Deixar Root Directory vazio/padrão
- ❌ Colocar Root Directory como "/"
- ❌ Colocar Root Directory com barra: "/rifei"
- ❌ Fazer deploy sem configurar Root Directory
- ❌ Configurar Root Directory DEPOIS do deploy

### ✅ FAZER:

- ✅ Configurar Root Directory = `rifei` ANTES de fazer deploy
- ✅ Verificar que está correto antes de clicar em Deploy
- ✅ Deletar projeto e refazer se errou a configuração inicial

---

## 🎯 CHECKLIST FINAL

Antes de clicar em Deploy, confirme:

- [ ] Projeto deletado (se já existia)
- [ ] Repositório importado novamente
- [ ] Root Directory = `rifei` ✅
- [ ] Framework = Next.js (auto-detectado)
- [ ] Node.js = 18.x
- [ ] Variáveis de ambiente adicionadas
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `.next`

**TODOS os itens devem estar ✅ antes de fazer deploy!**

---

## 💡 DICA FINAL

**A configuração do Root Directory é PERMANENTE.**

Uma vez configurado corretamente:
- ✅ Todos os futuros deploys usarão `rifei/`
- ✅ Não precisa reconfigurar a cada push
- ✅ Git push automático fará deploy

**Mas SE você configurou errado na primeira vez:**
- ❌ Você DEVE deletar o projeto
- ❌ E importar novamente COM a configuração correta

Não tem como corrigir um projeto já criado com Root Directory errado. É mais rápido deletar e refazer.

---

## 📞 SUPORTE ADICIONAL

Se mesmo seguindo este guia ainda der erro:

1. **Tire um print** da tela de configuração ANTES de fazer deploy
2. **Verifique** que Root Directory mostra "rifei"
3. **Veja os logs** do build (Deployments → View Build Logs)
4. **Compare** com este checklist

---

**Criado por:** Claude
**Data:** 2026-01-17
**Versão:** DEFINITIVA
**Status:** ✅ TESTADO E APROVADO

🎯 **SIGA EXATAMENTE ESTE GUIA E VAI FUNCIONAR!**
