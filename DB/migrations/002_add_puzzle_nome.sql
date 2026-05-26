-- ============================================================
-- Migração 002 — adiciona a coluna `nome` em `puzzle`
--
-- Permite que o admin dê um título ao puzzle (exibido na página
-- "Puzzles dos Mestres"). Aditiva e idempotente: não destrói dados
-- e pode rodar mais de uma vez. Coluna nullable para não quebrar
-- linhas pré-existentes; o cadastro de novos puzzles passa a exigir
-- o nome na camada de validação da API.
--
-- Uso:
--   psql -U postgres -h localhost -d cesuchess -f DB/migrations/002_add_puzzle_nome.sql
-- ============================================================

ALTER TABLE puzzle ADD COLUMN IF NOT EXISTS nome VARCHAR(120);
