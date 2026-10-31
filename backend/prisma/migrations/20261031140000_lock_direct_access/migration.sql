-- Só o backend acessa as tabelas: a sessão do site não grava direto pela API do Supabase
DROP POLICY IF EXISTS "user_data_select_own" ON "user_data";
DROP POLICY IF EXISTS "user_data_insert_own" ON "user_data";
DROP POLICY IF EXISTS "user_data_update_own" ON "user_data";
DROP POLICY IF EXISTS "user_data_delete_own" ON "user_data";
DROP POLICY IF EXISTS "motivations_select_own" ON "motivations";
DROP POLICY IF EXISTS "motivations_insert_own" ON "motivations";
DROP POLICY IF EXISTS "motivations_update_own" ON "motivations";
DROP POLICY IF EXISTS "motivations_delete_own" ON "motivations";
REVOKE ALL ON TABLE "users", "missions", "rewards", "purchases", "reward_overrides", "user_data", "motivations", "reward_claims", "goal_checkins", "_prisma_migrations" FROM authenticated;
