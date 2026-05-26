-- ============================================================
-- Migração 001 — adiciona a tabela `comentario` (Sprint 3)
--
-- Para bancos locais que foram criados antes de `comentario` entrar
-- no schema.sql. Aplica APENAS o que falta, sem destruir dados.
-- Idempotente: pode rodar mais de uma vez sem erro.
--
-- Uso:
--   psql -U postgres -h localhost -d cesuchess -f DB/migrations/001_add_comentario.sql
--
-- Obs.: a função set_atualizado_em() e a extensão pgcrypto já existem
-- (criadas pelo schema.sql), então não são recriadas aqui.
-- ============================================================

CREATE TABLE IF NOT EXISTS comentario (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jogador_id          UUID NOT NULL REFERENCES jogador(id) ON DELETE CASCADE,
    puzzle_lichess_id   VARCHAR(40) NOT NULL,
    texto               TEXT NOT NULL CHECK (length(btrim(texto)) BETWEEN 1 AND 1000),
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comentario_puzzle  ON comentario (puzzle_lichess_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_comentario_jogador ON comentario (jogador_id);

-- CREATE TRIGGER não suporta IF NOT EXISTS antes do PG15; DROP+CREATE é idempotente.
DROP TRIGGER IF EXISTS trg_comentario_atualizado_em ON comentario;
CREATE TRIGGER trg_comentario_atualizado_em
    BEFORE UPDATE ON comentario
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
