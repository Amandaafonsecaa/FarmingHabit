-- Dados do jogador sincronizados com o navegador (uma linha por chave)
CREATE TABLE "user_data" (
  "userId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_data_pkey" PRIMARY KEY ("userId", "key"),
  CONSTRAINT "user_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Row Level Security: cada usuário autenticado só acessa os próprios dados (o backend conecta como dono e não passa por aqui)
ALTER TABLE "user_data" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_data_select_own" ON "user_data" FOR SELECT TO authenticated USING (auth.uid()::text = "userId");
CREATE POLICY "user_data_insert_own" ON "user_data" FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "user_data_update_own" ON "user_data" FOR UPDATE TO authenticated USING (auth.uid()::text = "userId") WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "user_data_delete_own" ON "user_data" FOR DELETE TO authenticated USING (auth.uid()::text = "userId");
