-- ============================================================
-- CesuChess — promover um usuário a administrador
--
-- Não há mecanismo de aplicação para criar admins (por segurança):
-- a promoção é feita manualmente no banco, por quem tem acesso ao Postgres.
--
-- Passo a passo:
--   1. Cadastre um usuário normal pela UI (/routes/register).
--   2. Edite a linha do INSERT abaixo, trocando 'admin@exemplo.com' pelo
--      e-mail real do usuário a ser promovido.
--   3. Rode o script:
--      psql -U postgres -d CesuChess -f DB/admin_seed.sql
--   4. Faça logout e login de novo na UI para o isAdmin ser refrescado.
--
-- A tabela `admin` é 1:1 com `usuario` (usuario_id é UNIQUE), então rodar
-- duas vezes para o mesmo usuário é inofensivo (ON CONFLICT DO NOTHING).
-- ============================================================

INSERT INTO admin (usuario_id)
SELECT id FROM usuario WHERE email = 'admin@exemplo.com'
ON CONFLICT (usuario_id) DO NOTHING;