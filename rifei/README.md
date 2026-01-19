# 🎯 Rifei - Plataforma de Rifas e Sorteios

Uma plataforma moderna de rifas com feed social comunitário, gamificação e integração com Mercado Pago.

![Rifei Preview](public/og-image.png)

## ✨ Funcionalidades

- 🎪 **Marketplace de Rifas** - Explore e participe de rifas de diversos criadores
- 📱 **Feed Social** - Veja ganhadores, conquistas e interaja com a comunidade
- 🎮 **Gamificação** - Sistema de níveis, XP, conquistas e sorte acumulada
- 💳 **Pagamentos** - Integração completa com Mercado Pago (Pix, Cartão)
- 📊 **Dashboard** - Acompanhe suas rifas, vendas e estatísticas
- 🌙 **Tema Escuro** - Suporte a tema claro e escuro
- 📱 **Responsivo** - Funciona perfeitamente em mobile e desktop

## 🚀 Começando

### Pré-requisitos

- Node.js 18.17 ou superior
- npm ou yarn
- Conta no [Supabase](https://supabase.com)
- Conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/rifei.git
cd rifei
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env.local
```

Edite o `.env.local` com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_access_token
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=sua_public_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Configure o banco de dados**

Execute o SQL de migração no Supabase:

```bash
# Copie o conteúdo de supabase/migrations/001_initial_schema.sql
# E execute no SQL Editor do Supabase Dashboard
```

5. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
rifei/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Páginas de autenticação
│   │   ├── main/              # Área logada (feed, marketplace, etc)
│   │   ├── admin/             # Painel administrativo
│   │   └── api/               # API Routes
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes base (Button, Card, etc)
│   │   ├── feed/             # Componentes do feed
│   │   ├── rifa/             # Componentes de rifa
│   │   └── layout/           # Header, Sidebar, Footer
│   ├── lib/                  # Bibliotecas e utilitários
│   │   ├── supabase/         # Cliente Supabase
│   │   ├── mercadopago/      # Integração Mercado Pago
│   │   └── utils/            # Funções auxiliares
│   ├── hooks/                # React Hooks customizados
│   ├── types/                # Tipos TypeScript
│   └── stores/               # Estado global (Zustand)
├── supabase/
│   ├── migrations/           # SQL migrations
│   └── functions/            # Edge functions
└── public/                   # Assets estáticos
```

## 🛠️ Tecnologias

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime)
- **Pagamentos**: [Mercado Pago](https://www.mercadopago.com.br/)
- **Estado**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Formulários**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)

## 🔐 Autenticação

O sistema suporta:

- Email + Senha
- Google OAuth
- Telefone (SMS)
- Autenticação de dois fatores (2FA)

Configure os provedores no [Supabase Dashboard](https://supabase.com/dashboard) > Authentication > Providers.

## 💰 Mercado Pago

### Configuração

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/app)
2. Crie uma aplicação
3. Copie as credenciais para o `.env.local`

### Webhook

Configure o webhook para receber notificações de pagamento:

- URL: `https://seu-dominio.com/api/webhooks/mercadopago`
- Eventos: `payment.created`, `payment.updated`

## 📊 Banco de Dados

### Tabelas Principais

- `usuarios` - Perfis de usuário
- `rifas` - Rifas criadas
- `numeros_rifa` - Números de cada rifa
- `pagamentos` - Histórico de pagamentos
- `posts_feed` - Posts do feed social
- `conquistas` - Sistema de conquistas
- `notificacoes` - Notificações dos usuários

### Row Level Security (RLS)

Todas as tabelas possuem políticas de segurança configuradas. Revise as policies em `supabase/migrations/001_initial_schema.sql`.

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório na [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Variáveis de Ambiente (Produção)

Não esqueça de atualizar:

- `NEXT_PUBLIC_APP_URL` para seu domínio
- Credenciais de produção do Mercado Pago
- `WEBHOOK_SECRET` com um valor seguro

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar produção
npm run lint         # Verificar código
npm run db:generate  # Gerar tipos do Supabase
npm run db:migrate   # Executar migrações
npm run db:reset     # Resetar banco (dev)
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- 📧 Email: suporte@rifei.com.br
- 💬 Discord: [Comunidade Rifei](https://discord.gg/rifei)
- 📖 Docs: [docs.rifei.com.br](https://docs.rifei.com.br)

---

Feito com 💚 pela equipe Rifei
