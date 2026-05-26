-- ============================================================
-- CesuChess — schema UNIFICADO do Sprint 2
--
-- Contém o modelo conceitual completo (9 tabelas + 3 enums)
-- vindo do BRModeler, com todas as correções aplicadas,
-- mais a tabela auxiliar `puzzles_resolvidos`, que é o
-- agregado consumido pelo CRUD de "Histórico de Puzzles"
-- entregue no Sprint 2.
--
-- PostgreSQL 14+
-- Como criar e popular:
--   createdb -U postgres CesuChess
--   psql -U postgres -d CesuChess -f DB/schema.sql
-- ============================================================

-- Para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Limpeza em desenvolvimento (cuidado em produção)
DROP TABLE IF EXISTS comentario         CASCADE;
DROP TABLE IF EXISTS puzzles_resolvidos CASCADE;
DROP TABLE IF EXISTS tentativa_puzzle   CASCADE;
DROP TABLE IF EXISTS progresso_puzzle   CASCADE;
DROP TABLE IF EXISTS lance              CASCADE;
DROP TABLE IF EXISTS partida            CASCADE;
DROP TABLE IF EXISTS puzzle             CASCADE;
DROP TABLE IF EXISTS bot                CASCADE;
DROP TABLE IF EXISTS jogador            CASCADE;
DROP TABLE IF EXISTS admin              CASCADE;
DROP TABLE IF EXISTS usuario            CASCADE;
DROP TYPE  IF EXISTS dificuldade_bot;
DROP TYPE  IF EXISTS resultado_partida;
DROP TYPE  IF EXISTS status_partida;

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
CREATE TYPE dificuldade_bot   AS ENUM ('facil', 'medio', 'dificil');
CREATE TYPE resultado_partida AS ENUM (
    'brancas', 'pretas', 'empate', 'abandono_brancas', 'abandono_pretas'
);
CREATE TYPE status_partida    AS ENUM ('em_andamento', 'encerrada', 'abandonada');

-- ------------------------------------------------------------
-- USUARIO  (raiz da hierarquia)
-- ------------------------------------------------------------
CREATE TABLE usuario (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome            VARCHAR(80)  NOT NULL,
    sobrenome       VARCHAR(80)  NOT NULL,
    username        VARCHAR(40)  NOT NULL UNIQUE,
    email           VARCHAR(120) NOT NULL UNIQUE,
    senha_hash      TEXT         NOT NULL,
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_usuario_email    ON usuario (email);
CREATE INDEX idx_usuario_username ON usuario (username);

-- ------------------------------------------------------------
-- ADMIN  (1:1 com usuario)
-- ------------------------------------------------------------
CREATE TABLE admin (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID NOT NULL UNIQUE
                REFERENCES usuario(id) ON DELETE CASCADE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- JOGADOR  (1:1 com usuario — é o lado "competitivo" do usuário)
-- ------------------------------------------------------------
CREATE TABLE jogador (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id          UUID NOT NULL UNIQUE
                        REFERENCES usuario(id) ON DELETE CASCADE,
    rating              INTEGER NOT NULL DEFAULT 1200 CHECK (rating > 0),
    partidas_jogadas    INTEGER NOT NULL DEFAULT 0   CHECK (partidas_jogadas >= 0),
    partidas_vencidas   INTEGER NOT NULL DEFAULT 0   CHECK (partidas_vencidas >= 0),
    partidas_perdidas   INTEGER NOT NULL DEFAULT 0   CHECK (partidas_perdidas >= 0),
    puzzles_resolvidos  INTEGER NOT NULL DEFAULT 0   CHECK (puzzles_resolvidos >= 0),
    serie_dias          INTEGER NOT NULL DEFAULT 0   CHECK (serie_dias >= 0),
    ultima_atividade    TIMESTAMPTZ,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_jogador_totais
        CHECK (partidas_vencidas + partidas_perdidas <= partidas_jogadas)
);

-- ------------------------------------------------------------
-- BOT
-- ------------------------------------------------------------
CREATE TABLE bot (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    criado_por_id      UUID NOT NULL REFERENCES admin(id) ON DELETE RESTRICT,
    nome               VARCHAR(60)    NOT NULL,
    nivel_dificuldade  dificuldade_bot NOT NULL,
    descricao          TEXT,
    ativo              BOOLEAN        NOT NULL DEFAULT TRUE,
    criado_em          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bot_nome UNIQUE (nome)
);

-- ------------------------------------------------------------
-- PARTIDA
-- ------------------------------------------------------------
CREATE TABLE partida (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jogador_brancas_id  UUID NOT NULL REFERENCES jogador(id) ON DELETE RESTRICT,
    jogador_pretas_id   UUID NOT NULL REFERENCES jogador(id) ON DELETE RESTRICT,
    resultado           resultado_partida,
    status              status_partida NOT NULL DEFAULT 'em_andamento',
    fen_final           TEXT,
    iniciada_em         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    encerrada_em        TIMESTAMPTZ,
    CONSTRAINT ck_partida_jogadores_distintos
        CHECK (jogador_brancas_id <> jogador_pretas_id),
    CONSTRAINT ck_partida_ordem_temporal
        CHECK (encerrada_em IS NULL OR encerrada_em >= iniciada_em),
    CONSTRAINT ck_partida_status_resultado CHECK (
        (status = 'em_andamento' AND resultado IS NULL AND encerrada_em IS NULL)
        OR
        (status IN ('encerrada','abandonada') AND resultado IS NOT NULL AND encerrada_em IS NOT NULL)
    )
);
CREATE INDEX idx_partida_brancas ON partida (jogador_brancas_id);
CREATE INDEX idx_partida_pretas  ON partida (jogador_pretas_id);
CREATE INDEX idx_partida_status  ON partida (status);

-- ------------------------------------------------------------
-- LANCE
-- ------------------------------------------------------------
CREATE TABLE lance (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partida_id   UUID NOT NULL REFERENCES partida(id) ON DELETE CASCADE,
    numero       INTEGER     NOT NULL CHECK (numero > 0),
    uci          VARCHAR(6)  NOT NULL,
    fen_antes    TEXT        NOT NULL,
    tempo_ms     INTEGER     CHECK (tempo_ms IS NULL OR tempo_ms >= 0),
    criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_lance_partida_numero UNIQUE (partida_id, numero)
);
CREATE INDEX idx_lance_partida ON lance (partida_id);

-- ------------------------------------------------------------
-- PUZZLE
-- ------------------------------------------------------------
CREATE TABLE puzzle (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adicionado_por_id  UUID REFERENCES admin(id) ON DELETE SET NULL,
    lichess_id         VARCHAR(20) UNIQUE,
    nome               VARCHAR(120),
    fen                TEXT        NOT NULL,
    solucao            TEXT[]      NOT NULL,
    rating             INTEGER     NOT NULL DEFAULT 1200
                        CHECK (rating BETWEEN 0 AND 4000),
    temas              TEXT[],
    fase               INTEGER     NOT NULL CHECK (fase > 0),
    ativo              BOOLEAN     NOT NULL DEFAULT TRUE,
    criado_em          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_puzzle_fase       ON puzzle (fase);
CREATE INDEX idx_puzzle_lichess_id ON puzzle (lichess_id);

-- ------------------------------------------------------------
-- TENTATIVA_PUZZLE
-- ------------------------------------------------------------
CREATE TABLE tentativa_puzzle (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jogador_id      UUID NOT NULL REFERENCES jogador(id) ON DELETE CASCADE,
    puzzle_id       UUID NOT NULL REFERENCES puzzle(id)  ON DELETE CASCADE,
    lance_enviado   VARCHAR(6)  NOT NULL,
    correto         BOOLEAN     NOT NULL,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tentativa_jogador ON tentativa_puzzle (jogador_id);
CREATE INDEX idx_tentativa_puzzle  ON tentativa_puzzle (puzzle_id);

-- ------------------------------------------------------------
-- PROGRESSO_PUZZLE
-- ------------------------------------------------------------
CREATE TABLE progresso_puzzle (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jogador_id          UUID NOT NULL REFERENCES jogador(id) ON DELETE CASCADE,
    fase                INTEGER NOT NULL CHECK (fase > 0),
    puzzles_concluidos  INTEGER NOT NULL DEFAULT 0 CHECK (puzzles_concluidos >= 0),
    fase_concluida      BOOLEAN NOT NULL DEFAULT FALSE,
    atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_progresso_jogador_fase UNIQUE (jogador_id, fase)
);
CREATE INDEX idx_progresso_jogador ON progresso_puzzle (jogador_id);

-- ------------------------------------------------------------
-- PUZZLES_RESOLVIDOS  (tabela auxiliar, alimentada pelo CRUD
-- entregue no Sprint 2 — "Histórico de Puzzles" do usuário)
--
-- É um agregado por (jogador, puzzle_lichess) com anotação livre.
-- Não substitui tentativa_puzzle / progresso_puzzle; coexiste
-- com elas para servir à tela /routes/puzzles/history.
-- ------------------------------------------------------------
CREATE TABLE puzzles_resolvidos (
    id              SERIAL PRIMARY KEY,
    jogador_id      UUID NOT NULL REFERENCES jogador(id) ON DELETE CASCADE,
    puzzle_id       VARCHAR(40)  NOT NULL,                 -- ID do Lichess
    fase            INTEGER      NOT NULL CHECK (fase > 0),
    rating          INTEGER      CHECK (rating IS NULL OR (rating BETWEEN 0 AND 4000)),
    tentativas      INTEGER      NOT NULL DEFAULT 1 CHECK (tentativas >= 1),
    acertou         BOOLEAN      NOT NULL DEFAULT TRUE,
    anotacao        TEXT,
    resolvido_em    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_jogador_puzzle UNIQUE (jogador_id, puzzle_id)
);
CREATE INDEX idx_puzzles_resolvidos_jogador ON puzzles_resolvidos (jogador_id);
CREATE INDEX idx_puzzles_resolvidos_fase    ON puzzles_resolvidos (fase);

-- ------------------------------------------------------------
-- COMENTARIO  (Sprint 3 — CRUD de comentários em puzzles)
--
-- Um jogador autenticado pode publicar comentários sobre puzzles
-- (UC-16). Pode visualizar (UC-17), editar (UC-18) e excluir
-- (UC-19) APENAS seus próprios comentários.
--
-- Como o catálogo `puzzle` é opcional (cada jogador pode resolver
-- puzzles diretamente da API do Lichess sem que o admin tenha
-- importado o puzzle), `puzzle_lichess_id` é apenas TEXT — não
-- exigimos FK para o catálogo local.
-- ------------------------------------------------------------
DROP TABLE IF EXISTS comentario CASCADE;
CREATE TABLE comentario (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jogador_id          UUID NOT NULL REFERENCES jogador(id) ON DELETE CASCADE,
    puzzle_lichess_id   VARCHAR(40) NOT NULL,
    texto               TEXT NOT NULL CHECK (length(btrim(texto)) BETWEEN 1 AND 1000),
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_comentario_puzzle ON comentario (puzzle_lichess_id, criado_em DESC);
CREATE INDEX idx_comentario_jogador ON comentario (jogador_id);

-- ============================================================
-- TRIGGERS para manter atualizado_em consistente
-- ============================================================
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuario_atualizado_em
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_progresso_puzzle_atualizado_em
    BEFORE UPDATE ON progresso_puzzle
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_puzzles_resolvidos_atualizado_em
    BEFORE UPDATE ON puzzles_resolvidos
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_comentario_atualizado_em
    BEFORE UPDATE ON comentario
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
