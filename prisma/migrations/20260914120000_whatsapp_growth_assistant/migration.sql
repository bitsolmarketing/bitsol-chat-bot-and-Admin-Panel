-- =============================================================================
--  WhatsApp growth assistant
--
--  Lead intelligence (score, temperature, intent, country, attribution,
--  follow-up tracking), handover and attribution on conversations, the author
--  of staff-written messages, and `bot_events` for the chatbot dashboards.
--
--  Additive only: no column or table is dropped, and the one data change below
--  deactivates a catalogue row instead of deleting it.
--
--  `ALTER TYPE … ADD VALUE` runs inside the migration transaction, which
--  PostgreSQL allows from version 12 as long as the new values are not used in
--  the same transaction — nothing below uses them.
-- =============================================================================

-- CreateEnum
CREATE TYPE "LeadTemperature" AS ENUM ('COLD', 'WARM', 'HOT', 'HIGH_PRIORITY');

-- CreateEnum
CREATE TYPE "TrafficSource" AS ENUM ('META_ADS', 'GOOGLE_ADS', 'WEBSITE', 'QR_CODE', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'DIRECT_WHATSAPP', 'REFERRAL', 'CAMPAIGN', 'BROADCAST', 'OTHER');

-- CreateEnum
CREATE TYPE "OptInStatus" AS ENUM ('UNKNOWN', 'OPTED_IN', 'OPTED_OUT');

-- AlterEnum


ALTER TYPE "LeadStage" ADD VALUE 'HOT';
ALTER TYPE "LeadStage" ADD VALUE 'FOLLOW_UP';
ALTER TYPE "LeadStage" ADD VALUE 'SUPPORT';
ALTER TYPE "LeadStage" ADD VALUE 'SPAM';
ALTER TYPE "LeadStage" ADD VALUE 'OPTED_OUT';

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "adId" TEXT,
ADD COLUMN     "botPaused" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "campaign" TEXT,
ADD COLUMN     "handedOffAt" TIMESTAMP(3),
ADD COLUMN     "handoverTeam" TEXT,
ADD COLUMN     "referral" JSONB,
ADD COLUMN     "trafficSource" "TrafficSource";

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "marketing_leads" ADD COLUMN     "adId" TEXT,
ADD COLUMN     "assignedTeam" TEXT,
ADD COLUMN     "businessGoal" TEXT,
ADD COLUMN     "campaign" TEXT,
ADD COLUMN     "challenge" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "conversationSummary" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "followUpCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "intent" TEXT,
ADD COLUMN     "lastFollowUpAt" TIMESTAMP(3),
ADD COLUMN     "lastMessage" TEXT,
ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "nextAction" TEXT,
ADD COLUMN     "optInStatus" "OptInStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scoreReasons" TEXT[],
ADD COLUMN     "subService" TEXT,
ADD COLUMN     "temperature" "LeadTemperature" NOT NULL DEFAULT 'COLD',
ADD COLUMN     "trafficSource" "TrafficSource",
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "bot_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" "Channel" NOT NULL DEFAULT 'WHATSAPP',
    "conversationId" TEXT,
    "leadId" TEXT,
    "intent" TEXT,
    "team" TEXT,
    "value" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bot_events_type_createdAt_idx" ON "bot_events"("type", "createdAt");

-- CreateIndex
CREATE INDEX "bot_events_conversationId_idx" ON "bot_events"("conversationId");

-- CreateIndex
CREATE INDEX "conversations_trafficSource_idx" ON "conversations"("trafficSource");

-- CreateIndex
CREATE INDEX "marketing_leads_temperature_idx" ON "marketing_leads"("temperature");

-- CreateIndex
CREATE INDEX "marketing_leads_trafficSource_idx" ON "marketing_leads"("trafficSource");

-- AddForeignKey
ALTER TABLE "bot_events" ADD CONSTRAINT "bot_events_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- The assistant no longer offers training of any kind. The row is kept so the
-- history that references it survives; it simply stops being an active service.
UPDATE "marketing_services" SET "isActive" = false WHERE "slug" = 'corporate-training';
