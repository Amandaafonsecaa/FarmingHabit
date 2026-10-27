-- Livro-caixa das recompensas pagas pelo servidor (colheitas, bônus da semana e baús)
CREATE TABLE "reward_claims" (
  "userId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "day" TEXT NOT NULL,
  "coins" INTEGER NOT NULL,
  "xp" INTEGER NOT NULL,
  "detail" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reward_claims_pkey" PRIMARY KEY ("userId", "key"),
  CONSTRAINT "reward_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "reward_claims_userId_day_idx" ON "reward_claims"("userId", "day");

-- Fechada para a API pública desde o início, como as demais
ALTER TABLE "reward_claims" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "reward_claims" FROM anon;
