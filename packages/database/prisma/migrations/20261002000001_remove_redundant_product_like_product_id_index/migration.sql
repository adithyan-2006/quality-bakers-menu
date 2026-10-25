-- ============================================================================
-- Migration: 20261002000001_remove_redundant_product_like_product_id_index
--
-- PURPOSE:
--   Drop redundant secondary index "ProductLike_productId_idx" on "ProductLike".
--
-- AUDIT EVIDENCE:
--   - ProductLike_productId_idx has 0 idx_scan, 0 idx_tup_read, 0 idx_tup_fetch.
--   - The composite unique index ProductLike_productId_anonymousUserId_key has
--     259 scans and has "productId" as its leading/leftmost column, fully covering
--     all productId-only lookups, set-membership (IN) checks, groupings, and
--     foreign-key cascade deletes.
--   - Removing this standalone index eliminates redundant B-Tree write maintenance
--     and WAL generation on every INSERT and DELETE to ProductLike.
--   - All other indexes (ProductLike_pkey, ProductLike_anonymousUserId_idx, and
--     ProductLike_productId_anonymousUserId_key) remain intact and untouched.
-- ============================================================================

-- DropIndex
DROP INDEX IF EXISTS "ProductLike_productId_idx";
