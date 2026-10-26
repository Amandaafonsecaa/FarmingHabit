CREATE TABLE "reward_overrides" (
  "userId" TEXT NOT NULL,
  "rewardId" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "price" INTEGER,
  "hidden" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "reward_overrides_pkey" PRIMARY KEY ("userId", "rewardId"),
  CONSTRAINT "reward_overrides_price_nonnegative" CHECK ("price" IS NULL OR "price" >= 0),
  CONSTRAINT "reward_overrides_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "reward_overrides_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
