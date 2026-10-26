-- A foto sai do banco e vai para o Supabase Storage: guardamos só o caminho do arquivo
ALTER TABLE "motivations" DROP COLUMN "photo";
ALTER TABLE "motivations" ADD COLUMN "photoPath" TEXT;
ALTER TABLE "motivations" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Row Level Security: cada usuário autenticado só lê e altera a própria motivação.
-- O backend conecta como dono do banco e não passa por estas regras.
ALTER TABLE "motivations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "motivations_select_own" ON "motivations" FOR SELECT TO authenticated USING (auth.uid()::text = "userId");
CREATE POLICY "motivations_insert_own" ON "motivations" FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "motivations_update_own" ON "motivations" FOR UPDATE TO authenticated USING (auth.uid()::text = "userId") WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "motivations_delete_own" ON "motivations" FOR DELETE TO authenticated USING (auth.uid()::text = "userId");
