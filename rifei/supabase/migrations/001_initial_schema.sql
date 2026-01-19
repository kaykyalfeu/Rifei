-- ===========================================
-- RIFEI - Migração Inicial do Banco de Dados
-- ===========================================
-- Execute este SQL no Supabase SQL Editor
-- Ou use: supabase db push

-- ===========================================
-- EXTENSÕES
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca por similaridade

-- ===========================================
-- ENUMS
-- ===========================================

CREATE TYPE status_rifa AS ENUM ('rascunho', 'ativa', 'pausada', 'encerrada', 'cancelada', 'sorteada');
CREATE TYPE status_pagamento AS ENUM ('pendente', 'aprovado', 'recusado', 'reembolsado', 'cancelado');
CREATE TYPE status_numero AS ENUM ('disponivel', 'reservado', 'pago', 'premiado');
CREATE TYPE tipo_notificacao AS ENUM ('compra', 'venda', 'sorteio', 'comentario', 'seguidor', 'conquista', 'sistema');
CREATE TYPE tipo_post AS ENUM ('ganhador', 'nova_rifa', 'conquista', 'comentario', 'dica', 'geral');
CREATE TYPE raridade_conquista AS ENUM ('comum', 'incomum', 'raro', 'epico', 'lendario');
CREATE TYPE role_membro AS ENUM ('admin', 'moderador', 'membro');
CREATE TYPE status_membro AS ENUM ('ativo', 'pendente', 'banido');

-- ===========================================
-- TABELA: usuarios
-- ===========================================

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  nome_usuario TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  telefone TEXT,
  cpf TEXT, -- Armazenar criptografado
  data_nascimento DATE,
  
  -- Verificação
  email_verificado BOOLEAN DEFAULT false,
  telefone_verificado BOOLEAN DEFAULT false,
  documento_verificado BOOLEAN DEFAULT false,
  is_criador_verificado BOOLEAN DEFAULT false,
  
  -- Gamificação
  nivel INTEGER DEFAULT 1 CHECK (nivel >= 1 AND nivel <= 5),
  xp INTEGER DEFAULT 0,
  sorte_acumulada DECIMAL(5,2) DEFAULT 0.00,
  
  -- Estatísticas
  total_participacoes INTEGER DEFAULT 0,
  total_vitorias INTEGER DEFAULT 0,
  total_rifas_criadas INTEGER DEFAULT 0,
  total_arrecadado DECIMAL(12,2) DEFAULT 0.00,
  
  -- Configurações
  notificacoes_email BOOLEAN DEFAULT true,
  notificacoes_push BOOLEAN DEFAULT true,
  tema_preferido TEXT DEFAULT 'system' CHECK (tema_preferido IN ('light', 'dark', 'system')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acesso TIMESTAMPTZ,
  
  CONSTRAINT nome_usuario_valido CHECK (nome_usuario ~ '^[a-z0-9_]{3,30}$')
);

-- Índices para busca
CREATE INDEX idx_usuarios_nome ON usuarios USING gin (nome gin_trgm_ops);
CREATE INDEX idx_usuarios_nome_usuario ON usuarios (nome_usuario);
CREATE INDEX idx_usuarios_email ON usuarios (email);

-- ===========================================
-- TABELA: categorias
-- ===========================================

CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icone TEXT NOT NULL,
  cor TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  total_rifas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO categorias (nome, slug, icone, cor, ordem) VALUES
  ('Eletrônicos', 'eletronicos', '📱', '#3B82F6', 1),
  ('Veículos', 'veiculos', '🚗', '#EF4444', 2),
  ('Viagens', 'viagens', '✈️', '#10B981', 3),
  ('Games', 'games', '🎮', '#8B5CF6', 4),
  ('Casa', 'casa', '🏠', '#F59E0B', 5),
  ('Moda', 'moda', '👗', '#EC4899', 6),
  ('Esportes', 'esportes', '⚽', '#14B8A6', 7),
  ('Beleza', 'beleza', '💄', '#F43F5E', 8),
  ('Outros', 'outros', '🎁', '#6B7280', 99);

-- ===========================================
-- TABELA: rifas
-- ===========================================

CREATE TABLE rifas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  criador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  -- Informações básicas
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  categoria_id UUID NOT NULL REFERENCES categorias(id),
  
  -- Imagens
  imagem_principal TEXT NOT NULL,
  imagens_galeria TEXT[] DEFAULT '{}',
  
  -- Configuração de números
  total_numeros INTEGER NOT NULL CHECK (total_numeros >= 10 AND total_numeros <= 100000),
  preco_numero DECIMAL(10,2) NOT NULL CHECK (preco_numero >= 0.50),
  minimo_numeros_compra INTEGER DEFAULT 1,
  maximo_numeros_compra INTEGER DEFAULT 100,
  
  -- Datas
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  data_sorteio TIMESTAMPTZ,
  
  -- Status
  status status_rifa DEFAULT 'rascunho',
  numeros_vendidos INTEGER DEFAULT 0,
  valor_arrecadado DECIMAL(12,2) DEFAULT 0.00,
  
  -- Sorteio
  numero_sorteado INTEGER,
  ganhador_id UUID REFERENCES usuarios(id),
  metodo_sorteio TEXT DEFAULT 'automatico' CHECK (metodo_sorteio IN ('automatico', 'loteria_federal', 'manual')),
  loteria_concurso TEXT,
  
  -- Opções
  permite_escolher_numeros BOOLEAN DEFAULT true,
  mostrar_participantes BOOLEAN DEFAULT true,
  is_destaque BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  
  -- Estatísticas sociais
  total_likes INTEGER DEFAULT 0,
  total_comentarios INTEGER DEFAULT 0,
  total_compartilhamentos INTEGER DEFAULT 0,
  total_visualizacoes INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT data_valida CHECK (data_fim > data_inicio)
);

-- Índices
CREATE INDEX idx_rifas_criador ON rifas (criador_id);
CREATE INDEX idx_rifas_categoria ON rifas (categoria_id);
CREATE INDEX idx_rifas_status ON rifas (status);
CREATE INDEX idx_rifas_slug ON rifas (slug);
CREATE INDEX idx_rifas_titulo ON rifas USING gin (titulo gin_trgm_ops);
CREATE INDEX idx_rifas_data_fim ON rifas (data_fim) WHERE status = 'ativa';

-- ===========================================
-- TABELA: numeros_rifa
-- ===========================================

CREATE TABLE numeros_rifa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rifa_id UUID NOT NULL REFERENCES rifas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  status status_numero DEFAULT 'disponivel',
  
  -- Proprietário
  usuario_id UUID REFERENCES usuarios(id),
  pagamento_id UUID,
  
  -- Reserva temporária (15 minutos)
  reservado_ate TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(rifa_id, numero)
);

CREATE INDEX idx_numeros_rifa ON numeros_rifa (rifa_id);
CREATE INDEX idx_numeros_usuario ON numeros_rifa (usuario_id);
CREATE INDEX idx_numeros_status ON numeros_rifa (status);
CREATE INDEX idx_numeros_reserva ON numeros_rifa (reservado_ate) WHERE status = 'reservado';

-- ===========================================
-- TABELA: pagamentos
-- ===========================================

CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  rifa_id UUID NOT NULL REFERENCES rifas(id),
  
  -- Valores
  quantidade_numeros INTEGER NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL,
  taxa_plataforma DECIMAL(12,2) NOT NULL,
  valor_liquido DECIMAL(12,2) NOT NULL,
  
  -- Mercado Pago
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  mp_merchant_order_id TEXT,
  mp_status TEXT,
  mp_status_detail TEXT,
  metodo_pagamento TEXT,
  
  -- Status
  status status_pagamento DEFAULT 'pendente',
  
  -- Números comprados
  numeros INTEGER[] NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  pago_em TIMESTAMPTZ
);

CREATE INDEX idx_pagamentos_usuario ON pagamentos (usuario_id);
CREATE INDEX idx_pagamentos_rifa ON pagamentos (rifa_id);
CREATE INDEX idx_pagamentos_status ON pagamentos (status);
CREATE INDEX idx_pagamentos_mp ON pagamentos (mp_payment_id);

-- Adicionar FK nos numeros_rifa
ALTER TABLE numeros_rifa ADD CONSTRAINT fk_numeros_pagamento 
  FOREIGN KEY (pagamento_id) REFERENCES pagamentos(id);

-- ===========================================
-- TABELA: posts_feed
-- ===========================================

CREATE TABLE posts_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo tipo_post NOT NULL,
  conteudo TEXT NOT NULL,
  
  -- Referências opcionais
  rifa_id UUID REFERENCES rifas(id) ON DELETE SET NULL,
  conquista_id UUID,
  
  -- Mídia
  imagens TEXT[] DEFAULT '{}',
  
  -- Estatísticas
  total_likes INTEGER DEFAULT 0,
  total_comentarios INTEGER DEFAULT 0,
  total_compartilhamentos INTEGER DEFAULT 0,
  
  -- Visibilidade
  is_publico BOOLEAN DEFAULT true,
  is_fixado BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_usuario ON posts_feed (usuario_id);
CREATE INDEX idx_posts_tipo ON posts_feed (tipo);
CREATE INDEX idx_posts_created ON posts_feed (created_at DESC);

-- ===========================================
-- TABELA: comentarios
-- ===========================================

CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  rifa_id UUID REFERENCES rifas(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts_feed(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comentarios(id) ON DELETE CASCADE,
  
  conteudo TEXT NOT NULL,
  total_likes INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT comentario_alvo CHECK (
    (rifa_id IS NOT NULL AND post_id IS NULL) OR
    (rifa_id IS NULL AND post_id IS NOT NULL)
  )
);

CREATE INDEX idx_comentarios_rifa ON comentarios (rifa_id) WHERE rifa_id IS NOT NULL;
CREATE INDEX idx_comentarios_post ON comentarios (post_id) WHERE post_id IS NOT NULL;

-- ===========================================
-- TABELA: likes
-- ===========================================

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rifa_id UUID REFERENCES rifas(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts_feed(id) ON DELETE CASCADE,
  comentario_id UUID REFERENCES comentarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT like_unico UNIQUE (usuario_id, rifa_id, post_id, comentario_id),
  CONSTRAINT like_alvo CHECK (
    (rifa_id IS NOT NULL AND post_id IS NULL AND comentario_id IS NULL) OR
    (rifa_id IS NULL AND post_id IS NOT NULL AND comentario_id IS NULL) OR
    (rifa_id IS NULL AND post_id IS NULL AND comentario_id IS NOT NULL)
  )
);

-- ===========================================
-- TABELA: conquistas
-- ===========================================

CREATE TABLE conquistas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  icone TEXT NOT NULL,
  cor TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  
  tipo_requisito TEXT NOT NULL CHECK (tipo_requisito IN ('participacoes', 'vitorias', 'rifas_criadas', 'comentarios', 'seguidores', 'nivel', 'especial')),
  valor_requisito INTEGER DEFAULT 1,
  
  raridade raridade_conquista DEFAULT 'comum',
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir conquistas padrão
INSERT INTO conquistas (nome, slug, descricao, icone, cor, xp_reward, tipo_requisito, valor_requisito, raridade) VALUES
  ('Primeiro Passo', 'primeiro-passo', 'Participou da sua primeira rifa', '🎯', '#10B981', 50, 'participacoes', 1, 'comum'),
  ('Sortudo Iniciante', 'sortudo-iniciante', 'Ganhou sua primeira rifa', '🍀', '#10B981', 200, 'vitorias', 1, 'incomum'),
  ('Colecionador', 'colecionador', 'Participou de 10 rifas diferentes', '🏆', '#F59E0B', 100, 'participacoes', 10, 'comum'),
  ('Veterano', 'veterano', 'Participou de 50 rifas', '⭐', '#8B5CF6', 300, 'participacoes', 50, 'raro'),
  ('Criador', 'criador', 'Criou sua primeira rifa', '🎨', '#EC4899', 150, 'rifas_criadas', 1, 'comum'),
  ('Influenciador', 'influenciador', 'Conseguiu 100 seguidores', '📣', '#3B82F6', 500, 'seguidores', 100, 'epico'),
  ('Social', 'social', 'Fez 50 comentários', '💬', '#14B8A6', 100, 'comentarios', 50, 'comum'),
  ('Lenda', 'lenda', 'Ganhou 10 rifas', '👑', '#F59E0B', 1000, 'vitorias', 10, 'lendario');

-- ===========================================
-- TABELA: conquistas_usuarios
-- ===========================================

CREATE TABLE conquistas_usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  conquista_id UUID NOT NULL REFERENCES conquistas(id) ON DELETE CASCADE,
  conquistada_em TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(usuario_id, conquista_id)
);

-- Adicionar FK no posts_feed
ALTER TABLE posts_feed ADD CONSTRAINT fk_post_conquista 
  FOREIGN KEY (conquista_id) REFERENCES conquistas(id);

-- ===========================================
-- TABELA: seguidores
-- ===========================================

CREATE TABLE seguidores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seguidor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  seguindo_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(seguidor_id, seguindo_id),
  CONSTRAINT nao_seguir_si_mesmo CHECK (seguidor_id != seguindo_id)
);

CREATE INDEX idx_seguidores_seguidor ON seguidores (seguidor_id);
CREATE INDEX idx_seguidores_seguindo ON seguidores (seguindo_id);

-- ===========================================
-- TABELA: notificacoes
-- ===========================================

CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo tipo_notificacao NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  
  rifa_id UUID REFERENCES rifas(id) ON DELETE SET NULL,
  post_id UUID REFERENCES posts_feed(id) ON DELETE SET NULL,
  usuario_origem_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  
  action_url TEXT,
  
  lida BOOLEAN DEFAULT false,
  lida_em TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notificacoes_usuario ON notificacoes (usuario_id, lida, created_at DESC);

-- ===========================================
-- TABELA: comunidades
-- ===========================================

CREATE TABLE comunidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  criador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  
  is_publica BOOLEAN DEFAULT true,
  requer_aprovacao BOOLEAN DEFAULT false,
  
  total_membros INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TABELA: membros_comunidade
-- ===========================================

CREATE TABLE membros_comunidade (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comunidade_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  role role_membro DEFAULT 'membro',
  status status_membro DEFAULT 'ativo',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(comunidade_id, usuario_id)
);

-- ===========================================
-- TABELA: configuracoes_plataforma
-- ===========================================

CREATE TABLE configuracoes_plataforma (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave TEXT NOT NULL UNIQUE,
  valor JSONB NOT NULL,
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurações padrão
INSERT INTO configuracoes_plataforma (chave, valor, descricao) VALUES
  ('taxa_plataforma', '0.05', 'Taxa cobrada sobre cada venda (5%)'),
  ('taxa_saque_minima', '50.00', 'Valor mínimo para solicitar saque'),
  ('dias_para_saque', '7', 'Dias após o sorteio para liberar saque'),
  ('max_rifas_ativas_gratuito', '3', 'Máximo de rifas ativas para usuário gratuito'),
  ('max_rifas_ativas_premium', '20', 'Máximo de rifas ativas para usuário premium'),
  ('xp_por_compra', '10', 'XP ganho ao comprar número'),
  ('xp_por_venda', '5', 'XP ganho por número vendido'),
  ('xp_por_vitoria', '100', 'XP ganho ao ganhar rifa');

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rifas_updated_at BEFORE UPDATE ON rifas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_numeros_updated_at BEFORE UPDATE ON numeros_rifa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts_feed
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comentarios_updated_at BEFORE UPDATE ON comentarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comunidades_updated_at BEFORE UPDATE ON comunidades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função para gerar slug único
CREATE OR REPLACE FUNCTION generate_unique_slug(base_slug TEXT, table_name TEXT)
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  counter INTEGER := 0;
  slug_exists BOOLEAN;
BEGIN
  new_slug := base_slug;
  
  LOOP
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', table_name)
    INTO slug_exists
    USING new_slug;
    
    EXIT WHEN NOT slug_exists;
    
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar contadores de likes
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.rifa_id IS NOT NULL THEN
      UPDATE rifas SET total_likes = total_likes + 1 WHERE id = NEW.rifa_id;
    ELSIF NEW.post_id IS NOT NULL THEN
      UPDATE posts_feed SET total_likes = total_likes + 1 WHERE id = NEW.post_id;
    ELSIF NEW.comentario_id IS NOT NULL THEN
      UPDATE comentarios SET total_likes = total_likes + 1 WHERE id = NEW.comentario_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.rifa_id IS NOT NULL THEN
      UPDATE rifas SET total_likes = total_likes - 1 WHERE id = OLD.rifa_id;
    ELSIF OLD.post_id IS NOT NULL THEN
      UPDATE posts_feed SET total_likes = total_likes - 1 WHERE id = OLD.post_id;
    ELSIF OLD.comentario_id IS NOT NULL THEN
      UPDATE comentarios SET total_likes = total_likes - 1 WHERE id = OLD.comentario_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_counts
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_counts();

-- Função para atualizar contador de comentários
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.rifa_id IS NOT NULL THEN
      UPDATE rifas SET total_comentarios = total_comentarios + 1 WHERE id = NEW.rifa_id;
    ELSIF NEW.post_id IS NOT NULL THEN
      UPDATE posts_feed SET total_comentarios = total_comentarios + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.rifa_id IS NOT NULL THEN
      UPDATE rifas SET total_comentarios = total_comentarios - 1 WHERE id = OLD.rifa_id;
    ELSIF OLD.post_id IS NOT NULL THEN
      UPDATE posts_feed SET total_comentarios = total_comentarios - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_counts
  AFTER INSERT OR DELETE ON comentarios
  FOR EACH ROW EXECUTE FUNCTION update_comment_counts();

-- Função para comprar números
CREATE OR REPLACE FUNCTION comprar_numeros(
  p_rifa_id UUID,
  p_usuario_id UUID,
  p_numeros INTEGER[]
)
RETURNS TABLE (success BOOLEAN, pagamento_id UUID, message TEXT) AS $$
DECLARE
  v_rifa rifas%ROWTYPE;
  v_pagamento_id UUID;
  v_valor_total DECIMAL(12,2);
  v_taxa DECIMAL(12,2);
  v_num INTEGER;
  v_numeros_disponiveis INTEGER[];
BEGIN
  -- Verificar se a rifa existe e está ativa
  SELECT * INTO v_rifa FROM rifas WHERE id = p_rifa_id AND status = 'ativa';
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Rifa não encontrada ou não está ativa';
    RETURN;
  END IF;
  
  -- Verificar se a rifa não expirou
  IF v_rifa.data_fim < NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Esta rifa já encerrou';
    RETURN;
  END IF;
  
  -- Verificar se os números estão disponíveis
  SELECT ARRAY_AGG(numero) INTO v_numeros_disponiveis
  FROM numeros_rifa
  WHERE rifa_id = p_rifa_id
    AND numero = ANY(p_numeros)
    AND status = 'disponivel';
  
  IF array_length(v_numeros_disponiveis, 1) != array_length(p_numeros, 1) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Um ou mais números não estão disponíveis';
    RETURN;
  END IF;
  
  -- Calcular valores
  v_valor_total := array_length(p_numeros, 1) * v_rifa.preco_numero;
  v_taxa := v_valor_total * 0.05; -- 5% de taxa
  
  -- Criar pagamento
  INSERT INTO pagamentos (
    usuario_id, rifa_id, quantidade_numeros, valor_unitario,
    valor_total, taxa_plataforma, valor_liquido, numeros, status
  ) VALUES (
    p_usuario_id, p_rifa_id, array_length(p_numeros, 1), v_rifa.preco_numero,
    v_valor_total, v_taxa, v_valor_total - v_taxa, p_numeros, 'pendente'
  ) RETURNING id INTO v_pagamento_id;
  
  -- Reservar números (15 minutos)
  UPDATE numeros_rifa
  SET status = 'reservado',
      usuario_id = p_usuario_id,
      pagamento_id = v_pagamento_id,
      reservado_ate = NOW() + INTERVAL '15 minutes'
  WHERE rifa_id = p_rifa_id
    AND numero = ANY(p_numeros);
  
  RETURN QUERY SELECT true, v_pagamento_id, 'Números reservados com sucesso';
END;
$$ LANGUAGE plpgsql;

-- Função para confirmar pagamento
CREATE OR REPLACE FUNCTION confirmar_pagamento(
  p_pagamento_id UUID,
  p_mp_payment_id TEXT,
  p_mp_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_pagamento pagamentos%ROWTYPE;
BEGIN
  SELECT * INTO v_pagamento FROM pagamentos WHERE id = p_pagamento_id;
  
  IF NOT FOUND OR v_pagamento.status != 'pendente' THEN
    RETURN false;
  END IF;
  
  -- Atualizar pagamento
  UPDATE pagamentos
  SET mp_payment_id = p_mp_payment_id,
      mp_status = p_mp_status,
      status = 'aprovado',
      pago_em = NOW()
  WHERE id = p_pagamento_id;
  
  -- Confirmar números
  UPDATE numeros_rifa
  SET status = 'pago',
      reservado_ate = NULL
  WHERE pagamento_id = p_pagamento_id;
  
  -- Atualizar estatísticas da rifa
  UPDATE rifas
  SET numeros_vendidos = numeros_vendidos + v_pagamento.quantidade_numeros,
      valor_arrecadado = valor_arrecadado + v_pagamento.valor_total
  WHERE id = v_pagamento.rifa_id;
  
  -- Atualizar estatísticas do usuário
  UPDATE usuarios
  SET total_participacoes = total_participacoes + 1,
      xp = xp + 10 -- XP por compra
  WHERE id = v_pagamento.usuario_id;
  
  -- Atualizar estatísticas do criador
  UPDATE usuarios
  SET total_arrecadado = total_arrecadado + v_pagamento.valor_liquido
  WHERE id = (SELECT criador_id FROM rifas WHERE id = v_pagamento.rifa_id);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Função para realizar sorteio
CREATE OR REPLACE FUNCTION realizar_sorteio(p_rifa_id UUID)
RETURNS TABLE (success BOOLEAN, numero_sorteado INTEGER, ganhador_id UUID, message TEXT) AS $$
DECLARE
  v_rifa rifas%ROWTYPE;
  v_numero INTEGER;
  v_ganhador UUID;
BEGIN
  -- Verificar rifa
  SELECT * INTO v_rifa FROM rifas WHERE id = p_rifa_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::UUID, 'Rifa não encontrada';
    RETURN;
  END IF;
  
  IF v_rifa.status != 'ativa' AND v_rifa.status != 'encerrada' THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::UUID, 'Rifa não pode ser sorteada neste status';
    RETURN;
  END IF;
  
  IF v_rifa.numeros_vendidos = 0 THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::UUID, 'Nenhum número foi vendido';
    RETURN;
  END IF;
  
  -- Sortear número aleatório entre os vendidos
  SELECT numero, usuario_id INTO v_numero, v_ganhador
  FROM numeros_rifa
  WHERE rifa_id = p_rifa_id AND status = 'pago'
  ORDER BY RANDOM()
  LIMIT 1;
  
  -- Atualizar rifa
  UPDATE rifas
  SET status = 'sorteada',
      numero_sorteado = v_numero,
      ganhador_id = v_ganhador,
      data_sorteio = NOW()
  WHERE id = p_rifa_id;
  
  -- Marcar número como premiado
  UPDATE numeros_rifa
  SET status = 'premiado'
  WHERE rifa_id = p_rifa_id AND numero = v_numero;
  
  -- Atualizar estatísticas do ganhador
  UPDATE usuarios
  SET total_vitorias = total_vitorias + 1,
      xp = xp + 100
  WHERE id = v_ganhador;
  
  -- Criar notificação para o ganhador
  INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, rifa_id, action_url)
  VALUES (
    v_ganhador,
    'sorteio',
    '🎉 Você ganhou!',
    'Parabéns! Você foi o ganhador da rifa: ' || v_rifa.titulo,
    p_rifa_id,
    '/rifa/' || v_rifa.slug
  );
  
  -- Criar post no feed
  INSERT INTO posts_feed (usuario_id, tipo, conteudo, rifa_id)
  VALUES (
    v_ganhador,
    'ganhador',
    'Ganhei a rifa "' || v_rifa.titulo || '"! 🎉🏆',
    p_rifa_id
  );
  
  RETURN QUERY SELECT true, v_numero, v_ganhador, 'Sorteio realizado com sucesso';
END;
$$ LANGUAGE plpgsql;

-- Função para liberar números reservados expirados
CREATE OR REPLACE FUNCTION liberar_numeros_expirados()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH liberados AS (
    UPDATE numeros_rifa
    SET status = 'disponivel',
        usuario_id = NULL,
        pagamento_id = NULL,
        reservado_ate = NULL
    WHERE status = 'reservado'
      AND reservado_ate < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM liberados;
  
  -- Cancelar pagamentos pendentes relacionados
  UPDATE pagamentos
  SET status = 'cancelado'
  WHERE status = 'pendente'
    AND created_at < NOW() - INTERVAL '15 minutes';
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE numeros_rifa ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquistas_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros_comunidade ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
CREATE POLICY "Usuários podem ver perfis públicos"
  ON usuarios FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem editar próprio perfil"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem criar perfil durante signup"
  ON usuarios FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas para RIFAS
CREATE POLICY "Qualquer um pode ver rifas ativas"
  ON rifas FOR SELECT
  USING (status IN ('ativa', 'encerrada', 'sorteada') OR criador_id = auth.uid());

CREATE POLICY "Usuários autenticados podem criar rifas"
  ON rifas FOR INSERT
  WITH CHECK (auth.uid() = criador_id);

CREATE POLICY "Criadores podem editar próprias rifas"
  ON rifas FOR UPDATE
  USING (auth.uid() = criador_id);

CREATE POLICY "Criadores podem deletar rascunhos"
  ON rifas FOR DELETE
  USING (auth.uid() = criador_id AND status = 'rascunho');

-- Políticas para NUMEROS_RIFA
CREATE POLICY "Qualquer um pode ver números"
  ON numeros_rifa FOR SELECT
  USING (true);

CREATE POLICY "Sistema pode gerenciar números"
  ON numeros_rifa FOR ALL
  USING (true);

-- Políticas para PAGAMENTOS
CREATE POLICY "Usuários podem ver próprios pagamentos"
  ON pagamentos FOR SELECT
  USING (auth.uid() = usuario_id OR auth.uid() = (SELECT criador_id FROM rifas WHERE id = rifa_id));

CREATE POLICY "Sistema pode criar pagamentos"
  ON pagamentos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Políticas para POSTS_FEED
CREATE POLICY "Qualquer um pode ver posts públicos"
  ON posts_feed FOR SELECT
  USING (is_publico = true OR usuario_id = auth.uid());

CREATE POLICY "Usuários podem criar posts"
  ON posts_feed FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem editar próprios posts"
  ON posts_feed FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar próprios posts"
  ON posts_feed FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para COMENTARIOS
CREATE POLICY "Qualquer um pode ver comentários"
  ON comentarios FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem comentar"
  ON comentarios FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem editar próprios comentários"
  ON comentarios FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar próprios comentários"
  ON comentarios FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para LIKES
CREATE POLICY "Qualquer um pode ver likes"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem dar like"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem remover próprio like"
  ON likes FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para CONQUISTAS
CREATE POLICY "Qualquer um pode ver conquistas"
  ON conquistas FOR SELECT
  USING (ativa = true);

-- Políticas para CONQUISTAS_USUARIOS
CREATE POLICY "Qualquer um pode ver conquistas de usuários"
  ON conquistas_usuarios FOR SELECT
  USING (true);

-- Políticas para SEGUIDORES
CREATE POLICY "Qualquer um pode ver seguidores"
  ON seguidores FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem seguir"
  ON seguidores FOR INSERT
  WITH CHECK (auth.uid() = seguidor_id);

CREATE POLICY "Usuários podem deixar de seguir"
  ON seguidores FOR DELETE
  USING (auth.uid() = seguidor_id);

-- Políticas para NOTIFICACOES
CREATE POLICY "Usuários podem ver próprias notificações"
  ON notificacoes FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Sistema pode criar notificações"
  ON notificacoes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar próprias notificações"
  ON notificacoes FOR UPDATE
  USING (auth.uid() = usuario_id);

-- Políticas para COMUNIDADES
CREATE POLICY "Qualquer um pode ver comunidades públicas"
  ON comunidades FOR SELECT
  USING (is_publica = true OR criador_id = auth.uid());

CREATE POLICY "Usuários podem criar comunidades"
  ON comunidades FOR INSERT
  WITH CHECK (auth.uid() = criador_id);

CREATE POLICY "Criadores podem editar comunidades"
  ON comunidades FOR UPDATE
  USING (auth.uid() = criador_id);

-- Políticas para MEMBROS_COMUNIDADE
CREATE POLICY "Ver membros de comunidades públicas"
  ON membros_comunidade FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem entrar em comunidades"
  ON membros_comunidade FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem sair de comunidades"
  ON membros_comunidade FOR DELETE
  USING (auth.uid() = usuario_id);

-- ===========================================
-- STORAGE BUCKETS
-- ===========================================

-- Criar buckets para armazenamento de imagens
-- Execute no Supabase Dashboard > Storage

-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('avatars', 'avatars', true),
--   ('rifas', 'rifas', true),
--   ('posts', 'posts', true),
--   ('comunidades', 'comunidades', true);

-- ===========================================
-- CRON JOBS (Supabase pg_cron)
-- ===========================================

-- Executar a cada 5 minutos para liberar números reservados expirados
-- SELECT cron.schedule('liberar-numeros', '*/5 * * * *', 'SELECT liberar_numeros_expirados()');

-- Encerrar rifas que passaram da data fim (executar a cada hora)
-- SELECT cron.schedule('encerrar-rifas', '0 * * * *', $$
--   UPDATE rifas SET status = 'encerrada' 
--   WHERE status = 'ativa' AND data_fim < NOW()
-- $$);

-- ===========================================
-- FIM DA MIGRAÇÃO
-- ===========================================
