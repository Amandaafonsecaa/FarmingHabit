-- Quando a missão foi cumprida (métricas semanais da Evolução). Missões já cumpridas ficam sem data.
ALTER TABLE "missions" ADD COLUMN "completedAt" TIMESTAMP(3);
