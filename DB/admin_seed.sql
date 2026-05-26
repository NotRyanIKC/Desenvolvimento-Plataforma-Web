-- ============================================================
-- CesuChess — promover um usuário a administrador
--
-- Não há mecanismo de aplicação para criar admins (por segurança):
-- a promoção é feita manualmente no banco, por quem tem acesso ao Postgres.
--
-- Passo a passo:
--   1. Cadastre um usuário normal pela UI (/routes/register).
--   2. Rode este script trocando o e-mail abaixo pelo do usuário.
--      Ex.: psql -U postgres -d cesuchess -f DB/admin_seed.sql
--
-- A tabela `admin` é 1:1 com `usuario` (usuario_id é UNIQUE), então rodar
-- duas vezes para o mesmo usuário é inofensivo (ON CONFLICT DO NOTHING).
-- ============================================================

INSERT INTO admin (usuario_id)
SELECT id FROM usuario WHERE email = 'admin@exemplo.com'
ON CONFLICT (usuario_id) DO NOTHING;

-- Conferir os administradores atuais:
--   SELECT u.username, u.email, a.criado_em
--     FROM admin a JOIN usuario u ON u.id = a.usuario_id;
