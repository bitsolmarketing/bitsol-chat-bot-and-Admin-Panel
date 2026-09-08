-- =============================================================================
--  Meta-connected message templates and per-recipient broadcasts
-- =============================================================================
--
--  Templates stop being a local list and become a mirror of the WhatsApp
--  Business Account: every row gains Meta's id, review status, category,
--  language code and raw component array. `department` becomes nullable
--  because a template synced from Meta belongs to whichever business claims
--  it, and guessing would hide it from the other one.
--
--  Broadcasts gain a recipient table. Counters alone cannot answer "did this
--  person get it?", and Meta's delivery receipts arrive minutes later on a
--  webhook keyed by message id — which therefore has to be stored per person.
-- =============================================================================

-- ------------------------------------------------------------------ Enums ---

CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED');
CREATE TYPE "TemplateCategory" AS ENUM ('MARKETING', 'UTILITY', 'AUTHENTICATION');
CREATE TYPE "BroadcastRecipientStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'SKIPPED');

-- ------------------------------------------------------ whatsapp_templates ---

ALTER TABLE "whatsapp_templates"
  ADD COLUMN "metaName"       TEXT,
  ADD COLUMN "metaId"         TEXT,
  ADD COLUMN "languageCode"   TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN "category"       "TemplateCategory" NOT NULL DEFAULT 'UTILITY',
  ADD COLUMN "status"         "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "headerText"     TEXT,
  ADD COLUMN "headerFormat"   TEXT,
  ADD COLUMN "footerText"     TEXT,
  ADD COLUMN "buttons"        JSONB,
  ADD COLUMN "components"     JSONB,
  ADD COLUMN "rejectedReason" TEXT,
  ADD COLUMN "qualityScore"   TEXT,
  ADD COLUMN "syncedAt"       TIMESTAMP(3);

-- Existing rows were written locally and have never been near Meta. Derive a
-- name in Meta's alphabet from the local key so the column can be made NOT
-- NULL; the row stays DRAFT until someone actually submits it.
UPDATE "whatsapp_templates"
   SET "metaName" = regexp_replace(lower("key"), '[^a-z0-9]+', '_', 'g')
 WHERE "metaName" IS NULL;

ALTER TABLE "whatsapp_templates" ALTER COLUMN "metaName" SET NOT NULL;

-- Approved-in-name-only rows become the DRAFT they really are: nothing has
-- been reviewed by Meta yet, and pretending otherwise would let a broadcast
-- start against a template that does not exist there.
UPDATE "whatsapp_templates" SET "status" = 'DRAFT';

ALTER TABLE "whatsapp_templates" DROP COLUMN "isApproved";
ALTER TABLE "whatsapp_templates" ALTER COLUMN "department" DROP NOT NULL;

CREATE UNIQUE INDEX "whatsapp_templates_metaId_key" ON "whatsapp_templates"("metaId");
CREATE UNIQUE INDEX "whatsapp_templates_metaName_languageCode_key" ON "whatsapp_templates"("metaName", "languageCode");
CREATE INDEX "whatsapp_templates_status_idx" ON "whatsapp_templates"("status");

-- --------------------------------------------------------------- broadcasts --

ALTER TABLE "broadcasts"
  ADD COLUMN "templateName" TEXT,
  ADD COLUMN "languageCode" TEXT,
  ADD COLUMN "parameters"   JSONB,
  ADD COLUMN "headerMediaUrl" TEXT,
  ADD COLUMN "startedAt"    TIMESTAMP(3),
  ADD COLUMN "sent"         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "readCount"    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "failed"       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "error"        TEXT,
  ADD COLUMN "createdById"  TEXT;

ALTER TABLE "broadcasts"
  ADD CONSTRAINT "broadcasts_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- --------------------------------------------------- broadcast_recipients ---

CREATE TABLE "broadcast_recipients" (
    "id"          TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "contactId"   TEXT,
    "waId"        TEXT NOT NULL,
    "phone"       TEXT NOT NULL,
    "name"        TEXT,
    "parameters"  TEXT[],
    "status"      "BroadcastRecipientStatus" NOT NULL DEFAULT 'PENDING',
    "messageId"   TEXT,
    "error"       TEXT,
    "sentAt"      TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt"      TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broadcast_recipients_pkey" PRIMARY KEY ("id")
);

-- The wamid is how a delivery receipt finds its recipient, so the lookup has
-- to be unique and indexed.
CREATE UNIQUE INDEX "broadcast_recipients_messageId_key" ON "broadcast_recipients"("messageId");

-- One row per person per broadcast. This is what makes an interrupted run safe
-- to restart: re-preparing skips everyone already on the list.
CREATE UNIQUE INDEX "broadcast_recipients_broadcastId_waId_key" ON "broadcast_recipients"("broadcastId", "waId");

CREATE INDEX "broadcast_recipients_broadcastId_status_idx" ON "broadcast_recipients"("broadcastId", "status");

ALTER TABLE "broadcast_recipients"
  ADD CONSTRAINT "broadcast_recipients_broadcastId_fkey"
  FOREIGN KEY ("broadcastId") REFERENCES "broadcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "broadcast_recipients"
  ADD CONSTRAINT "broadcast_recipients_contactId_fkey"
  FOREIGN KEY ("contactId") REFERENCES "whatsapp_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
