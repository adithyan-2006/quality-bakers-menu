-- Migration: 20260825000001_add_product_likes
-- Purpose  : Record the creation of ProductLike and ProductLikeCount tables
--            in Prisma migration history.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- SAFETY NOTICE — READ BEFORE APPLYING
-- ═══════════════════════════════════════════════════════════════════════════
-- This migration file exists SOLELY for migration-history completeness.
-- Both tables (ProductLike, ProductLikeCount) already exist in the live
-- Supabase database with identical structure to the SQL below.
-- They were originally created via `prisma db push`, which does not record
-- a history entry.
--
-- DO NOT execute this SQL directly against the live database.
-- Use ONLY: prisma migrate resolve --applied 20260825000001_add_product_likes
-- That command inserts a row in _prisma_migrations WITHOUT executing this SQL.
--
-- All DDL below was verified against the live database on 2026-09-25 using
-- pg_catalog, pg_indexes, and pg_constraint read-only queries. Every column
-- type, default, constraint name, index name, and FK rule matches exactly.
-- ═══════════════════════════════════════════════════════════════════════════

-- CreateTable
CREATE TABLE "ProductLike" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "anonymousUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductLikeCount" (
    "productId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductLikeCount_pkey" PRIMARY KEY ("productId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductLike_productId_anonymousUserId_key" ON "ProductLike"("productId", "anonymousUserId");

-- CreateIndex
CREATE INDEX "ProductLike_productId_idx" ON "ProductLike"("productId");

-- CreateIndex
CREATE INDEX "ProductLike_anonymousUserId_idx" ON "ProductLike"("anonymousUserId");

-- AddForeignKey
ALTER TABLE "ProductLike" ADD CONSTRAINT "ProductLike_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLikeCount" ADD CONSTRAINT "ProductLikeCount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
