-- Eski umumiy (egasiz) kalitlar yangi va boshqa foydalanuvchilarga o'tib ketmasligi uchun tozalanadi
DELETE FROM "api_credentials";

-- Eski global provider cheklovini olib tashlash
DROP INDEX IF EXISTS "api_credentials_provider_key";

-- Har bir foydalanuvchi uchun shaxsiy kalit ustuni va indekslari
ALTER TABLE "api_credentials" ADD COLUMN "userId" TEXT NOT NULL;

CREATE INDEX "api_credentials_userId_idx" ON "api_credentials"("userId");
CREATE UNIQUE INDEX "api_credentials_userId_provider_key" ON "api_credentials"("userId", "provider");

ALTER TABLE "api_credentials" ADD CONSTRAINT "api_credentials_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
