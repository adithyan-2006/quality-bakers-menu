-- Migration: 20260925222914_enable_rls_all_tables
-- Purpose  : Enable Row Level Security on every table in the public schema.
--            This resolves the Supabase Security Advisor warning
--            `rls_disabled_in_public`.
--
-- Safety notes:
--   - This migration contains ONLY `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
--     statements. It does NOT create, drop, or alter any table structure,
--     columns, indexes, foreign keys, grants, or policies.
--   - No application data is modified.
--   - PrismaClient connects as the `postgres` superuser which is always exempt
--     from RLS, so all existing server-side operations continue to work without
--     any policy definitions.
--   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` is idempotent: if RLS is
--     already enabled on a table when this statement runs, PostgreSQL performs
--     a no-op and no error is raised.
--
-- Tables covered (15):
--   Business, Category, Product, Media, Homepage, HomepageSection,
--   User, Account, Session, VerificationToken, AuditLog,
--   ProductGalleryImage, HomepageFeaturedCategory,
--   ProductLike, ProductLikeCount

-- Enable RLS
ALTER TABLE "Business"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Media"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Homepage"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HomepageSection"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User"                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductGalleryImage"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HomepageFeaturedCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductLike"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductLikeCount"        ENABLE ROW LEVEL SECURITY;
