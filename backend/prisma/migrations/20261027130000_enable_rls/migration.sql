-- Banco fechado para a API pública do Supabase: só o backend lê e grava as tabelas.
-- O backend conecta como "postgres" (dono das tabelas, com BYPASSRLS), então nada muda para ele.
-- RLS ligado e sem políticas = nenhuma linha visível ou alterável pela API REST com a chave anon.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "habits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "missions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rewards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "purchases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reward_overrides" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
-- user_data e motivations já tinham RLS (políticas só do próprio dono autenticado). Reaplicar não muda nada.
ALTER TABLE "user_data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "motivations" ENABLE ROW LEVEL SECURITY;

-- Defesa extra: o papel anônimo não tem permissão nenhuma nas tabelas do jogo
REVOKE ALL ON TABLE "users", "habits", "missions", "rewards", "purchases", "reward_overrides", "user_data", "motivations", "_prisma_migrations" FROM anon;
