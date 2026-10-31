-- Historico de check-ins das metas: sai do blob "farminghabit.goals.v1" para uma tabela propria
CREATE TABLE "goal_checkins" (
  "userId" TEXT NOT NULL,
  "goalId" TEXT NOT NULL,
  "day" TEXT NOT NULL,
  "amount" INTEGER NOT NULL CHECK ("amount" > 0),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "goal_checkins_pkey" PRIMARY KEY ("userId", "goalId", "day"),
  CONSTRAINT "goal_checkins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "goal_checkins_userId_day_idx" ON "goal_checkins"("userId", "day");

-- Seguranca: so o backend (postgres, BYPASSRLS) acessa a tabela
ALTER TABLE "goal_checkins" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "goal_checkins" FROM anon, authenticated;

-- Backfill: copia o "log" do blob de cada jogador; um blob malformado nao derruba a migracao
DO $$
DECLARE
  blob RECORD;
BEGIN
  FOR blob IN SELECT "userId", "value" FROM "user_data" WHERE "key" = 'farminghabit.goals.v1' LOOP
    BEGIN
      INSERT INTO "goal_checkins" ("userId", "goalId", "day", "amount")
      SELECT blob."userId", goal.key, days.key, round(goal.value::numeric)::int
      FROM jsonb_each(CASE WHEN jsonb_typeof(blob."value"::jsonb -> 'log') = 'object' THEN blob."value"::jsonb -> 'log' ELSE '{}'::jsonb END) AS days,
           jsonb_each(CASE WHEN jsonb_typeof(days.value) = 'object' THEN days.value ELSE '{}'::jsonb END) AS goal
      WHERE days.key ~ '^\d{4}-\d{2}-\d{2}$'
        AND jsonb_typeof(goal.value) = 'number'
        AND round(goal.value::numeric)::int > 0
      ON CONFLICT DO NOTHING;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'goal_checkins: blob de % ignorado (%)', blob."userId", SQLERRM;
    END;
  END LOOP;
END $$;
