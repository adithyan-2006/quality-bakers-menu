-- ============================================================================
-- Migration: 20260926000001_add_product_query_indexes
--
-- PURPOSE:
--   Add composite indexes on the Product table to eliminate sequential scans
--   identified in the Disk I/O audit (Fix 10, Step 1).
--
-- AUDIT EVIDENCE:
--   - Product: 1,090 sequential scans, 0 index scans (pg_stat_user_tables)
--   - getProductsForCategory: WHERE categoryId + status + isVisible — no index
--   - getPopularProducts:     WHERE status + isFeatured — no index
--   - getSignatureProducts:   WHERE status + isSignature ORDER BY signatureOrder — no index
--
-- WHY NOT CONCURRENTLY:
--   CREATE INDEX CONCURRENTLY cannot run inside a PostgreSQL transaction block.
--   Prisma Migrate wraps all migrations in BEGIN/COMMIT by default, making
--   CONCURRENTLY incompatible with Prisma's standard migration deployment.
--   The Product table has ~8 rows (8 kB of data). A regular CREATE INDEX on
--   8 rows acquires a ShareLock for < 1ms — no production impact.
--   CONCURRENTLY is designed for millions of rows under sustained live load.
--
-- SAFETY:
--   - All statements are read-safe (CREATE INDEX never modifies data).
--   - IF NOT EXISTS guards prevent duplicate-index errors on re-runs.
--   - No data is altered.
--   - No existing indexes are dropped or modified.
--   - No application code changes are required.
-- ============================================================================

-- Index 1 — Primary query pattern: getProductsForCategory
-- Covers: WHERE categoryId = ? AND status = 'PUBLISHED' AND isVisible = true
-- Ordered: categoryId first (highest selectivity for category page queries),
--          then status and isVisible as equality filters.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_categoryId_status_isVisible_idx"
    ON "Product" ("categoryId", "status", "isVisible");

-- Index 2 — Homepage featured products: getPopularProducts
-- Covers: WHERE status = 'PUBLISHED' AND isFeatured = true
-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_status_isFeatured_idx"
    ON "Product" ("status", "isFeatured");

-- Index 3 — Signature collection: getSignatureProducts
-- Covers: WHERE status = 'PUBLISHED' AND isSignature = true ORDER BY signatureOrder ASC
-- Including signatureOrder in the index avoids a separate sort step.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_status_isSignature_signatureOrder_idx"
    ON "Product" ("status", "isSignature", "signatureOrder");
