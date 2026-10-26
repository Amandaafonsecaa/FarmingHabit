CREATE TABLE "motivations" (
  "userId" TEXT NOT NULL,
  "text" TEXT NOT NULL DEFAULT '',
  "photo" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "motivations_pkey" PRIMARY KEY ("userId"),
  CONSTRAINT "motivations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
