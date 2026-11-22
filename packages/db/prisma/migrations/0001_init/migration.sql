-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('setup', 'niche_test', 'active', 'paused');

-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('unverified', 'connected', 'error', 'quota_warning');

-- CreateEnum
CREATE TYPE "NicheStatus" AS ENUM ('candidate', 'testing', 'winner', 'rejected');

-- CreateEnum
CREATE TYPE "BrandStatus" AS ENUM ('draft', 'proposed', 'applied');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('new', 'scheduled', 'used', 'rejected');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('idea', 'script', 'voice', 'render', 'qa', 'ready', 'publishing', 'published', 'failed');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('pending', 'running', 'done', 'failed', 'waiting_limit', 'cancelled');

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'instagram',
    "name" TEXT NOT NULL,
    "handle" TEXT,
    "igUserId" TEXT,
    "fbPageId" TEXT,
    "niche" TEXT,
    "language" TEXT NOT NULL DEFAULT 'uz',
    "status" "ChannelStatus" NOT NULL DEFAULT 'setup',
    "brandKitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_tokens" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_credentials" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "status" "CredentialStatus" NOT NULL DEFAULT 'unverified',
    "dailyLimit" DECIMAL(10,4),
    "monthlyLimit" DECIMAL(10,4),
    "dailySpent" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "monthlySpent" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "lastCheckedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL,
    "autoMode" BOOLEAN NOT NULL DEFAULT true,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "pauseReason" TEXT,
    "publishHours" INTEGER[] DEFAULT ARRAY[19]::INTEGER[],
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tashkent',
    "dailyReelsMax" INTEGER NOT NULL DEFAULT 1,
    "onboardedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "niche_candidates" (
    "id" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "signals" JSONB NOT NULL,
    "scoreDemand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreCompetition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreAutomation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreMonetization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreContentReserve" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "NicheStatus" NOT NULL DEFAULT 'candidate',
    "testStartAt" TIMESTAMP(3),
    "testEndAt" TIMESTAMP(3),
    "testResult" JSONB,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "niche_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_kits" (
    "id" TEXT NOT NULL,
    "nameOptions" JSONB NOT NULL,
    "chosenName" TEXT,
    "slogan" TEXT,
    "bio" TEXT,
    "keywords" TEXT[],
    "colors" JSONB NOT NULL,
    "font" TEXT,
    "logoUrl" TEXT,
    "avatarUrl" TEXT,
    "coverTemplateUrl" TEXT,
    "voiceId" TEXT,
    "introPath" TEXT,
    "outroPath" TEXT,
    "status" "BrandStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_ideas" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "source" TEXT,
    "status" "IdeaStatus" NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "ideaId" TEXT,
    "skillId" TEXT,
    "status" "VideoStatus" NOT NULL DEFAULT 'idea',
    "caption" TEXT,
    "hashtags" TEXT[],
    "coverUrl" TEXT,
    "fileUrl" TEXT,
    "durationSec" DOUBLE PRECISION,
    "qaReport" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "publishedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "igContainerId" TEXT,
    "igMediaId" TEXT,
    "aiLabeled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scripts" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "shotList" JSONB NOT NULL,
    "hookText" TEXT,
    "ctaText" TEXT,
    "onScreenTexts" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "status" "JobStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "error" TEXT,
    "videoId" TEXT,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "avgWatchTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "followersGained" INTEGER NOT NULL DEFAULT 0,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_logs" (
    "id" TEXT NOT NULL,
    "videoId" TEXT,
    "provider" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "limitHit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "channels_igUserId_key" ON "channels"("igUserId");

-- CreateIndex
CREATE UNIQUE INDEX "channels_brandKitId_key" ON "channels"("brandKitId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_tokens_channelId_key" ON "oauth_tokens"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "api_credentials_provider_key" ON "api_credentials"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_version_key" ON "skills"("name", "version");

-- CreateIndex
CREATE INDEX "videos_status_idx" ON "videos"("status");

-- CreateIndex
CREATE INDEX "videos_scheduledFor_idx" ON "videos"("scheduledFor");

-- CreateIndex
CREATE INDEX "jobs_status_runAt_idx" ON "jobs"("status", "runAt");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_snapshots_videoId_date_key" ON "analytics_snapshots"("videoId", "date");

-- CreateIndex
CREATE INDEX "cost_logs_provider_createdAt_idx" ON "cost_logs"("provider", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_brandKitId_fkey" FOREIGN KEY ("brandKitId") REFERENCES "brand_kits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_tokens" ADD CONSTRAINT "oauth_tokens_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_ideas" ADD CONSTRAINT "content_ideas_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "content_ideas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_logs" ADD CONSTRAINT "cost_logs_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

