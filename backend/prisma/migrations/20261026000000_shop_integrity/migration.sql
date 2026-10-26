-- Guard economic invariants even when a write bypasses the HTTP validators.
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_price_nonnegative" CHECK ("price" >= 0);
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_price_nonnegative" CHECK ("price" >= 0);
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_used_timestamp" CHECK (
  ("used" = false AND "usedAt" IS NULL) OR ("used" = true AND "usedAt" IS NOT NULL)
);
