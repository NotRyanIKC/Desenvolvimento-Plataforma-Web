ALTER TABLE bot
  ADD COLUMN IF NOT EXISTS parametros_estrategia JSONB NOT NULL DEFAULT '{}'::JSONB;

CREATE TABLE IF NOT EXISTS tema (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_por_id  UUID NOT NULL REFERENCES admin(id) ON DELETE RESTRICT,
  nome           VARCHAR(60) NOT NULL,
  descricao      TEXT,
  ativo          BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tema_nome UNIQUE (nome)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tema_atualizado_em'
  ) THEN
    CREATE TRIGGER trg_tema_atualizado_em
      BEFORE UPDATE ON tema
      FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
  END IF;
END $$;
