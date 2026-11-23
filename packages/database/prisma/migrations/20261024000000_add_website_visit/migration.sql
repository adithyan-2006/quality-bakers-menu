-- Migration: 20261024000000_add_website_visit
-- Purpose  : Create WebsiteVisit table and composite query indexes for
--            privacy-preserving customer website analytics tracking.
--
-- Safety Notes:
--   - Uses CREATE TABLE IF NOT EXISTS and CREATE INDEX IF NOT EXISTS to prevent
--     conflicts with databases where the table was previously provisioned.
--   - Enables Row Level Security (RLS) on the public schema table to comply with
--     Supabase security recommendations.
--   - Non-destructive: Does not drop, alter, or modify any existing tables or rows.

-- CreateTable
CREATE TABLE IF NOT EXISTS "WebsiteVisit" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '/',
    "referrer" TEXT,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT,
    "deviceType" TEXT,
    "deviceName" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "ipHash" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebsiteVisit_createdAt_idx" ON "WebsiteVisit"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebsiteVisit_visitorId_idx" ON "WebsiteVisit"("visitorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebsiteVisit_path_idx" ON "WebsiteVisit"("path");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebsiteVisit_createdAt_visitorId_idx" ON "WebsiteVisit"("createdAt", "visitorId");

-- Enable RLS
ALTER TABLE "WebsiteVisit" ENABLE ROW LEVEL SECURITY;
