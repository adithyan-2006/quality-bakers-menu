-- =============================================================================
-- QUALITY BAKERS: CONSOLIDATED DATABASE SECURITY PROVISIONING SCRIPT
-- File: packages/database/prisma/provisioning.sql
-- Revision: 9.6 (Approved Least-Privilege Architecture — Hardened & Atomic)
-- Compatibility: 100% Pure PostgreSQL (Supabase Web SQL Editor and psql)
-- Safety: TRANSACTION-SAFE & FAIL-CLOSED (Pre-Commit Assertion Enforces Rollback)
-- Target Role: customer_app (Restricted Customer Storefront Access)
-- Superuser / Table Owner: postgres (Bypasses RLS, Full Admin Access)
--
-- DO NOT EMBED DATABASE PASSWORDS OR SECRETS IN THIS SCRIPT.
-- The customer storefront is 100% public (no user registration or customer auth).
-- Authentication is strictly isolated to the separate administrative application.
-- =============================================================================

-- =============================================================================
-- SECTION 1: PREFLIGHT PREREQUISITE CHECKS (READ-ONLY, FAIL-FAST)
-- Verifies executing role privileges and presence of required schema objects.
-- =============================================================================
DO $$
DECLARE
  v_admin_role_ok BOOLEAN;
  v_missing_tables TEXT;
  v_missing_enums TEXT;
BEGIN
  -- 1.1 Verify executing role compatibility (must be postgres or possess BYPASSRLS / SUPERUSER)
  SELECT (rolsuper = true OR rolbypassrls = true) INTO v_admin_role_ok
  FROM pg_roles 
  WHERE rolname = current_user;

  IF NOT v_admin_role_ok THEN
    RAISE EXCEPTION 'PREFLIGHT FAILURE: Current executing role (%) lacks SUPERUSER or BYPASSRLS. Provisioning must be executed as postgres or administrative database owner.', current_user;
  END IF;

  -- 1.2 Verify all 17 required tables exist (fail fast if migrations have not been applied)
  SELECT string_agg(expected.tbl, ', ') INTO v_missing_tables
  FROM (
    VALUES 
      ('Business'), ('Category'), ('Product'), ('ProductGalleryImage'),
      ('Homepage'), ('HomepageFeaturedCategory'), ('HomepageSection'), ('Media'),
      ('ProductLike'), ('ProductLikeCount'), ('WebsiteVisit'),
      ('User'), ('Session'), ('Account'), ('VerificationToken'), ('AuditLog'),
      ('_prisma_migrations')
  ) AS expected(tbl)
  LEFT JOIN information_schema.tables t 
    ON t.table_schema = 'public' AND t.table_name = expected.tbl
  WHERE t.table_name IS NULL;

  IF v_missing_tables IS NOT NULL THEN
    RAISE EXCEPTION 'PREFLIGHT FAILURE: Missing required tables in public schema: %. Apply Prisma migrations before running provisioning.', v_missing_tables;
  END IF;

  -- 1.3 Verify all 5 required enum types exist in public schema
  SELECT string_agg(expected.enum_name, ', ') INTO v_missing_enums
  FROM (
    VALUES ('PublishStatus'), ('BadgeType'), ('AvailabilityStatus'), ('MediaType'), ('MediaStatus')
  ) AS expected(enum_name)
  LEFT JOIN (
    SELECT t.typname 
    FROM pg_type t 
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typtype = 'e'
  ) e ON e.typname = expected.enum_name
  WHERE e.typname IS NULL;

  IF v_missing_enums IS NOT NULL THEN
    RAISE EXCEPTION 'PREFLIGHT FAILURE: Missing required enums in public schema: %. Apply Prisma migrations before running provisioning.', v_missing_enums;
  END IF;

  RAISE NOTICE 'PREFLIGHT PASSED: Administrative role verified, 17 tables and 5 enums confirmed.';
END $$;

-- =============================================================================
-- TRANSACTION BOUNDARY (SECTIONS 2 THROUGH 9)
-- All security configurations (privilege revokes, role enforcement, table grants,
-- RLS enablement, policies, functions, triggers, and counter reconciliation)
-- along with the COMPREHENSIVE PRE-COMMIT AUDIT (Section 9) are enclosed
-- within this single PostgreSQL transaction block.
--
-- GUARANTEE: If ANY DDL statement or ANY pre-commit verification assertion fails,
-- an exception is raised before COMMIT. PostgreSQL immediately rolls back the
-- entire transaction, ensuring that NO partial or defective configuration
-- can ever remain committed to the database.
-- =============================================================================
BEGIN;

-- Lock critical customer mutation tables against concurrent writes during provisioning
LOCK TABLE public."ProductLike" IN EXCLUSIVE MODE;
LOCK TABLE public."ProductLikeCount" IN EXCLUSIVE MODE;

-- =============================================================================
-- SECTION 2: GLOBAL HARDENING & PUBLIC SCHEMA PRIVILEGE NEUTRALIZATION
-- Revokes inherited table privileges from PUBLIC, anon, and authenticated
-- on sensitive administrative tables and the internal migration tracker.
-- =============================================================================

-- 2.1 Revoke CREATE on public schema from PUBLIC and customer_app
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- 2.2 Neutralize sensitive admin tables & _prisma_migrations from public and API roles
DO $$
DECLARE
  v_tbl TEXT;
  v_tables TEXT[] := ARRAY['User', 'Session', 'Account', 'VerificationToken', 'AuditLog', '_prisma_migrations'];
BEGIN
  FOREACH v_tbl IN ARRAY v_tables LOOP
    -- Revoke from PUBLIC
    EXECUTE 'REVOKE ALL ON TABLE public.' || quote_ident(v_tbl) || ' FROM PUBLIC';

    -- Revoke from Supabase client roles if present in cluster
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
      EXECUTE 'REVOKE ALL ON TABLE public.' || quote_ident(v_tbl) || ' FROM anon';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      EXECUTE 'REVOKE ALL ON TABLE public.' || quote_ident(v_tbl) || ' FROM authenticated';
    END IF;
  END LOOP;
END $$;

-- 2.3 Revoke non-insert access to WebsiteVisit from PUBLIC and API roles
DO $$
BEGIN
  REVOKE SELECT, UPDATE, DELETE, TRUNCATE ON TABLE public."WebsiteVisit" FROM PUBLIC;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE SELECT, UPDATE, DELETE, TRUNCATE ON TABLE public."WebsiteVisit" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE SELECT, UPDATE, DELETE, TRUNCATE ON TABLE public."WebsiteVisit" FROM authenticated;
  END IF;
END $$;

-- =============================================================================
-- SECTION 3: STATE-AWARE ROLE PROVISIONING & ATTRIBUTE ENFORCEMENT
-- Configures customer_app with LOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE,
-- NOINHERIT, NOREPLICATION, NOBYPASSRLS. Validates existing credentials and revokes memberships.
-- =============================================================================
DO $$
DECLARE
  v_role_exists BOOLEAN;
  v_is_login BOOLEAN;
  v_is_superuser BOOLEAN;
  v_is_createdb BOOLEAN;
  v_is_createrole BOOLEAN;
  v_is_inherit BOOLEAN;
  v_is_replication BOOLEAN;
  v_is_bypassrls BOOLEAN;
  v_member_record RECORD;
BEGIN
  SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'customer_app') INTO v_role_exists;

  IF NOT v_role_exists THEN
    RAISE NOTICE 'Provisioning state: Clean slate. Creating role customer_app without embedded password...';
    -- Created without password; password must be set out-of-band via \password customer_app
    CREATE ROLE customer_app WITH 
        LOGIN 
        NOSUPERUSER 
        NOCREATEDB 
        NOCREATEROLE 
        NOINHERIT 
        NOREPLICATION 
        NOBYPASSRLS;
    RAISE NOTICE 'Role customer_app created successfully. NOTE: Set password out-of-band (e.g., via psql \password customer_app).';
  ELSE
    -- Role already exists; inspect attributes to prevent silent security violations
    SELECT 
      rolcanlogin, rolsuper, rolcreatedb, rolcreaterole, rolinherit, rolreplication, rolbypassrls
    INTO 
      v_is_login, v_is_superuser, v_is_createdb, v_is_createrole, v_is_inherit, v_is_replication, v_is_bypassrls
    FROM pg_roles 
    WHERE rolname = 'customer_app';

    IF v_is_superuser OR v_is_createdb OR v_is_createrole OR v_is_replication OR v_is_bypassrls THEN
      RAISE EXCEPTION 'ROLE ATTRIBUTE VIOLATION: Existing role "customer_app" has elevated privileges (SUPER=%, CREATEDB=%, CREATEROLE=%, REPLICATION=%, BYPASSRLS=%). Refusing to proceed without manual review.',
        v_is_superuser, v_is_createdb, v_is_createrole, v_is_replication, v_is_bypassrls;
    END IF;

    -- Enforce exact least-privilege attribute configuration while preserving existing password
    ALTER ROLE customer_app WITH 
        LOGIN 
        NOSUPERUSER 
        NOCREATEDB 
        NOCREATEROLE 
        NOINHERIT 
        NOREPLICATION 
        NOBYPASSRLS;
    RAISE NOTICE 'Role customer_app attributes enforced (preserved existing credentials).';
  END IF;

  -- Revoke any unintended parent role memberships granted to customer_app
  FOR v_member_record IN 
    SELECT r_parent.rolname AS parent_role
    FROM pg_auth_members am
    JOIN pg_roles r_child ON am.member = r_child.oid
    JOIN pg_roles r_parent ON am.roleid = r_parent.oid
    WHERE r_child.rolname = 'customer_app'
  LOOP
    EXECUTE 'REVOKE ' || quote_ident(v_member_record.parent_role) || ' FROM customer_app';
    RAISE NOTICE 'Revoked unintended parent role membership "%" from customer_app.', v_member_record.parent_role;
  END LOOP;
END $$;

-- 3.1 Grant connection and schema usage
GRANT CONNECT ON DATABASE postgres TO customer_app;
GRANT USAGE ON SCHEMA public TO customer_app;
REVOKE CREATE ON SCHEMA public FROM customer_app;

-- =============================================================================
-- SECTION 4: ATOMIC RECONCILIATION & COUNTER TRIGGER INSTALLATION
-- Installs the atomic ProductLikeCount sync trigger (UPDATE-only on DELETE)
-- and reconciles counter records for all existing products.
-- =============================================================================

-- 4.1 Clean up orphan counters before reconciliation
DELETE FROM public."ProductLikeCount" plc
WHERE NOT EXISTS (
    SELECT 1 FROM public."Product" p WHERE p.id = plc."productId"
);

-- 4.2 Idempotent backfill of ProductLikeCount for all existing products
INSERT INTO public."ProductLikeCount" ("productId", "count", "updatedAt")
SELECT 
    p.id AS "productId",
    COALESCE(l.real_count, 0) AS "count",
    pg_catalog.now() AS "updatedAt"
FROM public."Product" p
LEFT JOIN (
    SELECT "productId", pg_catalog.count(*)::INTEGER AS real_count
    FROM public."ProductLike"
    GROUP BY "productId"
) l ON p.id = l."productId"
ON CONFLICT ("productId")
DO UPDATE SET
    "count" = EXCLUDED."count",
    "updatedAt" = pg_catalog.now()
WHERE public."ProductLikeCount"."count" IS DISTINCT FROM EXCLUDED."count";

-- 4.3 Atomic Counter Trigger Function
-- UPDATE-only on DELETE ensures CASCADE product deletions cannot recreate orphan records
CREATE OR REPLACE FUNCTION public.sync_product_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public."ProductLikeCount" ("productId", "count", "updatedAt")
        VALUES (NEW."productId", 1, pg_catalog.now())
        ON CONFLICT ("productId")
        DO UPDATE SET 
            "count" = public."ProductLikeCount"."count" + 1,
            "updatedAt" = pg_catalog.now();
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public."ProductLikeCount"
        SET "count" = GREATEST(0, "count" - 1),
            "updatedAt" = pg_catalog.now()
        WHERE "productId" = OLD."productId";
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.sync_product_like_count() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.sync_product_like_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_product_like_count() FROM customer_app;

-- 4.4 Register Trigger on ProductLike
DROP TRIGGER IF EXISTS trg_sync_product_like_count ON public."ProductLike";
CREATE TRIGGER trg_sync_product_like_count
AFTER INSERT OR DELETE ON public."ProductLike"
FOR EACH ROW EXECUTE FUNCTION public.sync_product_like_count();

-- =============================================================================
-- SECTION 5: PRIVACY-PRESERVING LIKE VERIFICATION FUNCTIONS
-- SECURITY DEFINER functions preventing customer_app from directly querying
-- ProductLike while allowing like status checks for published, visible items.
-- =============================================================================

-- 5.1 Single product like verification
CREATE OR REPLACE FUNCTION public.is_product_liked(
    p_product_id TEXT,
    p_anonymous_user_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    IF p_product_id IS NULL OR length(p_product_id) = 0 OR length(p_product_id) > 100
       OR p_anonymous_user_id IS NULL OR length(p_anonymous_user_id) = 0 OR length(p_anonymous_user_id) > 100
       OR p_anonymous_user_id !~ '^[A-Za-z0-9_.:-]+$' THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public."ProductLike" pl
        JOIN public."Product" p ON p.id = pl."productId"
        WHERE pl."productId" = p_product_id
          AND pl."anonymousUserId" = p_anonymous_user_id
          AND p."status" = 'PUBLISHED'::public."PublishStatus"
          AND p."isVisible" = true
          AND p."deletedAt" IS NULL
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.is_product_liked(TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_product_liked(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_product_liked(TEXT, TEXT) TO customer_app;

-- 5.2 Batch product like verification (Max array size 100)
CREATE OR REPLACE FUNCTION public.get_user_liked_products(
    p_product_ids TEXT[],
    p_anonymous_user_id TEXT
)
RETURNS TABLE (product_id TEXT) AS $$
BEGIN
    IF p_product_ids IS NULL 
       OR pg_catalog.cardinality(p_product_ids) = 0 
       OR pg_catalog.cardinality(p_product_ids) > 100
       OR p_anonymous_user_id IS NULL 
       OR length(p_anonymous_user_id) = 0 
       OR length(p_anonymous_user_id) > 100
       OR p_anonymous_user_id !~ '^[A-Za-z0-9_.:-]+$' THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT pl."productId"
    FROM public."ProductLike" pl
    JOIN public."Product" p ON p.id = pl."productId"
    WHERE pl."productId" = ANY(p_product_ids)
      AND pl."anonymousUserId" = p_anonymous_user_id
      AND p."status" = 'PUBLISHED'::public."PublishStatus"
      AND p."isVisible" = true
      AND p."deletedAt" IS NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp;

ALTER FUNCTION public.get_user_liked_products(TEXT[], TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_user_liked_products(TEXT[], TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_liked_products(TEXT[], TEXT) TO customer_app;

-- =============================================================================
-- SECTION 6: DISCRETIONARY ACCESS CONTROL (DAC) TABLE GRANTS
-- Strictly applies the Revision 9 permission matrix to customer_app.
-- Blanket sequence privileges are completely excluded (primary keys use CUIDs).
-- =============================================================================

-- 6.1 Clean baseline: Revoke all privileges on all 17 tables from customer_app
DO $$
DECLARE
  v_tbl TEXT;
  v_all_tables TEXT[] := ARRAY[
    'Business', 'Category', 'Product', 'ProductGalleryImage',
    'Homepage', 'HomepageFeaturedCategory', 'HomepageSection', 'Media',
    'ProductLike', 'ProductLikeCount', 'WebsiteVisit',
    'User', 'Session', 'Account', 'VerificationToken', 'AuditLog',
    '_prisma_migrations'
  ];
BEGIN
  FOREACH v_tbl IN ARRAY v_all_tables LOOP
    EXECUTE 'REVOKE ALL ON TABLE public.' || quote_ident(v_tbl) || ' FROM customer_app';
  END LOOP;
END $$;

-- 6.2 Customer-facing catalog tables: SELECT only
GRANT SELECT ON TABLE public."Business" TO customer_app;
GRANT SELECT ON TABLE public."Category" TO customer_app;
GRANT SELECT ON TABLE public."Product" TO customer_app;
GRANT SELECT ON TABLE public."Media" TO customer_app;
GRANT SELECT ON TABLE public."Homepage" TO customer_app;
GRANT SELECT ON TABLE public."HomepageFeaturedCategory" TO customer_app;
GRANT SELECT ON TABLE public."HomepageSection" TO customer_app;
GRANT SELECT ON TABLE public."ProductGalleryImage" TO customer_app;

-- 6.3 ProductLike: Mutation only (INSERT & DELETE; zero SELECT, UPDATE, TRUNCATE)
GRANT INSERT, DELETE ON TABLE public."ProductLike" TO customer_app;

-- 6.4 ProductLikeCount: Read-only (SELECT only; mutations managed by trigger)
GRANT SELECT ON TABLE public."ProductLikeCount" TO customer_app;

-- 6.5 WebsiteVisit: Blind append-only (INSERT only; zero SELECT, UPDATE, DELETE)
GRANT INSERT ON TABLE public."WebsiteVisit" TO customer_app;

-- 6.6 Sequences: Explicitly ensure zero sequence privileges are granted to customer_app
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM customer_app;

-- =============================================================================
-- SECTION 7: ROW-LEVEL SECURITY (RLS) & FORCE RLS CONFIGURATION
-- Enables RLS on all 16 application tables.
-- _prisma_migrations is deliberately EXCLUDED from RLS.
-- FORCE RLS is explicitly DISABLED to preserve postgres administrative bypass.
-- =============================================================================

-- 7.1 Enable RLS on 11 customer-accessible tables
ALTER TABLE public."Business" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Homepage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."HomepageFeaturedCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."HomepageSection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProductGalleryImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProductLike" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProductLikeCount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WebsiteVisit" ENABLE ROW LEVEL SECURITY;

-- 7.2 Enable RLS on 5 sensitive admin tables (Zero policies = default DENY ALL for non-admin)
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;

-- 7.3 Ensure FORCE RLS is disabled across all 16 tables (preserves admin bypass)
ALTER TABLE public."Business" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."Category" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."Product" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."Media" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."Homepage" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."HomepageFeaturedCategory" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."HomepageSection" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."ProductGalleryImage" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."ProductLike" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."ProductLikeCount" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."WebsiteVisit" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."User" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."Session" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."Account" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog" NO FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- SECTION 8: ROW-LEVEL SECURITY (RLS) POLICIES
-- Enforces status, visibility, deletion, and cross-table referential integrity.
-- =============================================================================

-- 8.1 Business: Published and non-deleted only
DROP POLICY IF EXISTS business_customer_select ON public."Business";
CREATE POLICY business_customer_select ON public."Business"
    FOR SELECT TO customer_app
    USING ("status" = 'PUBLISHED'::public."PublishStatus" AND "deletedAt" IS NULL);

-- 8.2 Category: Published, visible, and non-deleted only
DROP POLICY IF EXISTS category_customer_select ON public."Category";
CREATE POLICY category_customer_select ON public."Category"
    FOR SELECT TO customer_app
    USING ("status" = 'PUBLISHED'::public."PublishStatus" AND "isVisible" = true AND "deletedAt" IS NULL);

-- 8.3 Product: Published, visible, and non-deleted only
DROP POLICY IF EXISTS product_customer_select ON public."Product";
CREATE POLICY product_customer_select ON public."Product"
    FOR SELECT TO customer_app
    USING ("status" = 'PUBLISHED'::public."PublishStatus" AND "isVisible" = true AND "deletedAt" IS NULL);

-- 8.4 Media: Ready status only
DROP POLICY IF EXISTS media_customer_select ON public."Media";
CREATE POLICY media_customer_select ON public."Media"
    FOR SELECT TO customer_app
    USING ("status" = 'READY'::public."MediaStatus");

-- 8.5 Homepage: Published status only
DROP POLICY IF EXISTS homepage_customer_select ON public."Homepage";
CREATE POLICY homepage_customer_select ON public."Homepage"
    FOR SELECT TO customer_app
    USING ("status" = 'PUBLISHED'::public."PublishStatus");

-- 8.6 HomepageFeaturedCategory: Correlated published Homepage AND published Category
DROP POLICY IF EXISTS hp_feat_cat_customer_select ON public."HomepageFeaturedCategory";
CREATE POLICY hp_feat_cat_customer_select ON public."HomepageFeaturedCategory"
    FOR SELECT TO customer_app
    USING (
      EXISTS (
        SELECT 1 FROM public."Homepage" h
        WHERE h.id = "HomepageFeaturedCategory"."homepageId"
          AND h."status" = 'PUBLISHED'::public."PublishStatus"
      )
      AND
      EXISTS (
        SELECT 1 FROM public."Category" c
        WHERE c.id = "HomepageFeaturedCategory"."categoryId"
          AND c."status" = 'PUBLISHED'::public."PublishStatus"
          AND c."isVisible" = true
          AND c."deletedAt" IS NULL
      )
    );

-- 8.7 HomepageSection: Enabled sections only
DROP POLICY IF EXISTS hp_section_customer_select ON public."HomepageSection";
CREATE POLICY hp_section_customer_select ON public."HomepageSection"
    FOR SELECT TO customer_app
    USING ("enabled" = true);

-- 8.8 ProductGalleryImage: Correlated published Product AND READY Media
DROP POLICY IF EXISTS prod_gallery_customer_select ON public."ProductGalleryImage";
CREATE POLICY prod_gallery_customer_select ON public."ProductGalleryImage"
    FOR SELECT TO customer_app
    USING (
      EXISTS (
        SELECT 1 FROM public."Product" p
        WHERE p.id = "ProductGalleryImage"."productId"
          AND p."status" = 'PUBLISHED'::public."PublishStatus"
          AND p."isVisible" = true
          AND p."deletedAt" IS NULL
      )
      AND
      EXISTS (
        SELECT 1 FROM public."Media" m
        WHERE m.id = "ProductGalleryImage"."mediaId"
          AND m."status" = 'READY'::public."MediaStatus"
      )
    );

-- 8.9 ProductLike INSERT: Allowed only for published, visible, non-deleted Product
DROP POLICY IF EXISTS prod_like_customer_insert ON public."ProductLike";
CREATE POLICY prod_like_customer_insert ON public."ProductLike"
    FOR INSERT TO customer_app
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public."Product" p
        WHERE p.id = "ProductLike"."productId"
          AND p."status" = 'PUBLISHED'::public."PublishStatus"
          AND p."isVisible" = true
          AND p."deletedAt" IS NULL
      )
    );

-- 8.10 ProductLike DELETE: Allowed only for published, visible, non-deleted Product
DROP POLICY IF EXISTS prod_like_customer_delete ON public."ProductLike";
CREATE POLICY prod_like_customer_delete ON public."ProductLike"
    FOR DELETE TO customer_app
    USING (
      EXISTS (
        SELECT 1 FROM public."Product" p
        WHERE p.id = "ProductLike"."productId"
          AND p."status" = 'PUBLISHED'::public."PublishStatus"
          AND p."isVisible" = true
          AND p."deletedAt" IS NULL
      )
    );

-- Ensure direct SELECT on ProductLike is explicitly prevented (no policy allows SELECT)
DROP POLICY IF EXISTS prod_like_customer_select ON public."ProductLike";

-- 8.11 ProductLikeCount: Permissive SELECT for customer_app (Trigger manages writes)
DROP POLICY IF EXISTS prod_like_count_customer_select ON public."ProductLikeCount";
CREATE POLICY prod_like_count_customer_select ON public."ProductLikeCount"
    FOR SELECT TO customer_app
    USING (true);

-- 8.12 WebsiteVisit: Permissive blind INSERT for customer_app
DROP POLICY IF EXISTS website_visit_customer_insert ON public."WebsiteVisit";
CREATE POLICY website_visit_customer_insert ON public."WebsiteVisit"
    FOR INSERT TO customer_app
    WITH CHECK (true);

-- =============================================================================
-- SECTION 9: PRE-COMMIT COMPREHENSIVE SECURITY VERIFICATION (FAIL-CLOSED)
-- Validates EVERY required security control inside the transaction BEFORE commit.
-- If any policy, grant, function, trigger, or configuration fails to match
-- the approved baseline, an exception is raised immediately.
-- This GUARANTEES that PostgreSQL automatically aborts and rolls back the
-- entire provisioning transaction, preventing any partial configuration.
-- =============================================================================
DO $$
DECLARE
  v_defective_policies TEXT;
  v_unexpected_policies TEXT;
  v_defective_functions TEXT;
  v_unexpected_function_overloads TEXT;
  v_trigger_missing BOOLEAN;
  v_trigger_timing_defects TEXT;
  v_trigger_linkage_defects TEXT;
  v_privilege_deviations TEXT;
  v_sequence_privilege_deviations INT;
  v_membership_deviations TEXT;
  v_role_attribute_defects TEXT;
  v_rls_missing TEXT;
  v_force_rls_active TEXT;
BEGIN
  -- 9.1 AUDIT ALL 12 RLS POLICIES (Commands, Permissiveness, Target Role, and Predicates)
  SELECT string_agg(expected.table_name || '.' || expected.policy_name || ' (' || chk.issue || ')', '; ')
  INTO v_defective_policies
  FROM (
    VALUES
      ('Product', 'product_customer_select', 'r'),
      ('Category', 'category_customer_select', 'r'),
      ('Media', 'media_customer_select', 'r'),
      ('Business', 'business_customer_select', 'r'),
      ('Homepage', 'homepage_customer_select', 'r'),
      ('HomepageFeaturedCategory', 'hp_feat_cat_customer_select', 'r'),
      ('HomepageSection', 'hp_section_customer_select', 'r'),
      ('ProductGalleryImage', 'prod_gallery_customer_select', 'r'),
      ('ProductLike', 'prod_like_customer_insert', 'a'),
      ('ProductLike', 'prod_like_customer_delete', 'd'),
      ('ProductLikeCount', 'prod_like_count_customer_select', 'r'),
      ('WebsiteVisit', 'website_visit_customer_insert', 'a')
  ) AS expected(table_name, policy_name, expected_cmd)
  LEFT JOIN LATERAL (
    SELECT 
      pol.polcmd,
      pol.polpermissive,
      (SELECT array_agg(rolname) FROM pg_roles WHERE oid = ANY(pol.polroles)) AS roles_array,
      COALESCE(pg_get_expr(pol.polqual, pol.polrelid), '') AS expr_using,
      COALESCE(pg_get_expr(pol.polwithcheck, pol.polrelid), '') AS expr_check
    FROM pg_policy pol
    JOIN pg_class c ON pol.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND c.relname = expected.table_name
      AND pol.polname = expected.policy_name
  ) actual ON true
  LEFT JOIN LATERAL (
    SELECT 
      CASE 
        WHEN actual.polcmd IS NULL THEN 'Policy missing'
        WHEN NOT actual.polpermissive THEN 'Policy is RESTRICTIVE (must be PERMISSIVE)'
        WHEN actual.roles_array IS DISTINCT FROM ARRAY['customer_app']::name[] THEN 'Roles array must contain ONLY customer_app'
        WHEN actual.polcmd <> expected.expected_cmd THEN 'Command mismatch'
        
        WHEN expected.table_name = 'Product' AND NOT (
          actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
          AND actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
          AND actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?deletedAt"?\s+IS\s+NULL'
          AND actual.expr_using !~* '\m(OR|NOT)\M'
        ) THEN 'Product predicate invalid'
        
        WHEN expected.table_name = 'Category' AND NOT (
          actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
          AND actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
          AND actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?deletedAt"?\s+IS\s+NULL'
          AND actual.expr_using !~* '\m(OR|NOT)\M'
        ) THEN 'Category predicate invalid'
        
        WHEN expected.table_name = 'Media' AND NOT (
          actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?status"?\s*=\s*''READY''::("?[A-Za-z0-9_]+"?\.)?"?MediaStatus"?'
          AND actual.expr_using !~* '\m(OR|NOT)\M'
        ) THEN 'Media predicate invalid'
        
        WHEN expected.table_name = 'Business' AND NOT (
          actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
          AND actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?deletedAt"?\s+IS\s+NULL'
          AND actual.expr_using !~* '\m(OR|NOT)\M'
        ) THEN 'Business predicate invalid'
        
        WHEN expected.table_name = 'Homepage' AND NOT (
          actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
          AND actual.expr_using !~* '\m(OR|NOT)\M'
        ) THEN 'Homepage predicate invalid'
        
        WHEN expected.table_name = 'HomepageSection' AND NOT (
          actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?enabled"?(\s*=\s*true|\s+IS\s+TRUE)'
          AND actual.expr_using !~* '\m(OR|NOT)\M'
        ) THEN 'HomepageSection predicate invalid'
        
        WHEN expected.table_name = 'HomepageFeaturedCategory' AND NOT (
          (
            actual.expr_using ~* 'h\."?id"?\s*=\s*("?HomepageFeaturedCategory"?\.)?"?homepageId"?'
            OR actual.expr_using ~* '("?HomepageFeaturedCategory"?\.)?"?homepageId"?\s*=\s*h\."?id"?'
          )
          AND actual.expr_using ~* 'h\."?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
          AND (
            actual.expr_using ~* 'c\."?id"?\s*=\s*("?HomepageFeaturedCategory"?\.)?"?categoryId"?'
            OR actual.expr_using ~* '("?HomepageFeaturedCategory"?\.)?"?categoryId"?\s*=\s*c\."?id"?'
          )
          AND actual.expr_using ~* 'c\."?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
          AND actual.expr_using ~* 'c\."?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
          AND actual.expr_using ~* 'c\."?deletedAt"?\s+IS\s+NULL'
          AND actual.expr_using !~* '\m(OR|NOT)\M'
        ) THEN 'HomepageFeaturedCategory correlation invalid'
        
        WHEN expected.table_name = 'ProductGalleryImage' AND NOT (
          (
            actual.expr_using ~* 'p\."?id"?\s*=\s*("?ProductGalleryImage"?\.)?"?productId"?'
            OR actual.expr_using ~* '("?ProductGalleryImage"?\.)?"?productId"?\s*=\s*p\."?id"?'
          )
          AND actual.expr_using ~* 'p\."?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
          AND actual.expr_using ~* 'p\."?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
          AND actual.expr_using ~* 'p\."?deletedAt"?\s+IS\s+NULL'
          AND (
            actual.expr_using ~* 'm\."?id"?\s*=\s*("?ProductGalleryImage"?\.)?"?mediaId"?'
            OR actual.expr_using ~* '("?ProductGalleryImage"?\.)?"?mediaId"?\s*=\s*m\."?id"?'
          )
          AND actual.expr_using ~* 'm\."?status"?\s*=\s*''READY''::("?[A-Za-z0-9_]+"?\.)?"?MediaStatus"?'
          AND actual.expr_using !~* '\m(OR|NOT)\M'
        ) THEN 'ProductGalleryImage correlation invalid'
        
        WHEN expected.table_name = 'ProductLike' AND expected.policy_name = 'prod_like_customer_insert' AND NOT (
          (
            actual.expr_check ~* 'p\."?id"?\s*=\s*("?ProductLike"?\.)?"?productId"?'
            OR actual.expr_check ~* '("?ProductLike"?\.)?"?productId"?\s*=\s*p\."?id"?'
          )
          AND actual.expr_check ~* 'p\."?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
          AND actual.expr_check ~* 'p\."?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
          AND actual.expr_check ~* 'p\."?deletedAt"?\s+IS\s+NULL'
          AND actual.expr_check !~* '\m(OR|NOT)\M'
        ) THEN 'ProductLike INSERT correlation invalid'
        
        WHEN expected.table_name = 'ProductLike' AND expected.policy_name = 'prod_like_customer_delete' AND NOT (
          (
            actual.expr_using ~* 'p\."?id"?\s*=\s*("?ProductLike"?\.)?"?productId"?'
            OR actual.expr_using ~* '("?ProductLike"?\.)?"?productId"?\s*=\s*p\."?id"?'
          )
          AND actual.expr_using ~* 'p\."?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
          AND actual.expr_using ~* 'p\."?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
          AND actual.expr_using ~* 'p\."?deletedAt"?\s+IS\s+NULL'
          AND actual.expr_using !~* '\m(OR|NOT)\M'
        ) THEN 'ProductLike DELETE correlation invalid'
        
        WHEN expected.table_name = 'ProductLikeCount' AND NOT (
          trim(actual.expr_using) = 'true'
        ) THEN 'ProductLikeCount predicate invalid'
        
        WHEN expected.table_name = 'WebsiteVisit' AND NOT (
          trim(actual.expr_check) = 'true'
        ) THEN 'WebsiteVisit predicate invalid'
        
        ELSE 'VALID'
      END AS issue
  ) chk ON true
  WHERE chk.issue <> 'VALID';

  -- 9.2 AUDIT UNEXPECTED POLICIES (Zero policies on sensitive tables, _prisma_migrations, or targeting PUBLIC)
  SELECT string_agg(c.relname || '.' || pol.polname, '; ')
  INTO v_unexpected_policies
  FROM pg_policy pol
  JOIN pg_class c ON pol.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND (
      c.relname IN ('User', 'Session', 'Account', 'VerificationToken', 'AuditLog', '_prisma_migrations')
      OR 0 = ANY(pol.polroles)
      OR EXISTS (SELECT 1 FROM pg_roles r WHERE r.oid = ANY(pol.polroles) AND r.rolname IN ('anon', 'authenticated', 'public'))
      OR (c.relname IN ('Business', 'Category', 'Product', 'ProductGalleryImage', 'Homepage', 'HomepageFeaturedCategory', 'HomepageSection', 'Media', 'ProductLike', 'ProductLikeCount', 'WebsiteVisit')
          AND pol.polname NOT IN ('product_customer_select', 'category_customer_select', 'media_customer_select', 'business_customer_select', 'homepage_customer_select', 'hp_feat_cat_customer_select', 'hp_section_customer_select', 'prod_gallery_customer_select', 'prod_like_customer_insert', 'prod_like_customer_delete', 'prod_like_count_customer_select', 'website_visit_customer_insert'))
    );

  -- 9.3 AUDIT FUNCTION ATTRIBUTES (Exact Signatures, Ownership, SECURITY DEFINER, search_path, ACLs)
  SELECT string_agg(expected.fname || ' (' || chk_fn.issue || ')', '; ')
  INTO v_defective_functions
  FROM (
    VALUES 
      ('is_product_liked', 'public.is_product_liked(text,text)', 'text, text', 'postgres', true),
      ('get_user_liked_products', 'public.get_user_liked_products(text[],text)', 'text[], text', 'postgres', true),
      ('sync_product_like_count', 'public.sync_product_like_count()', '', 'postgres', false)
  ) AS expected(fname, regproc_sig, type_args, expected_owner, exp_customer_exec)
  LEFT JOIN LATERAL (
    SELECT 
      p.oid,
      p.prosecdef,
      r.rolname AS owner_name,
      (SELECT string_agg(s, ', ') FROM unnest(p.proconfig) s WHERE s LIKE 'search_path=%') AS search_path_setting,
      EXISTS (
        SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
        JOIN pg_roles gr ON gr.oid = acl.grantee
        WHERE gr.rolname = 'customer_app' AND acl.privilege_type = 'EXECUTE'
      ) AS customer_app_has_execute,
      EXISTS (
        SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
        WHERE acl.grantee = 0 AND acl.privilege_type = 'EXECUTE'
      ) AS public_has_execute
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_roles r ON r.oid = p.proowner
    WHERE n.nspname = 'public' 
      AND p.proname = expected.fname 
      AND p.oid = to_regprocedure(expected.regproc_sig)::oid
      AND oidvectortypes(p.proargtypes) = expected.type_args
  ) actual_fn ON true
  LEFT JOIN LATERAL (
    SELECT 
      CASE 
        WHEN actual_fn.oid IS NULL THEN 'Exact signature missing'
        WHEN actual_fn.prosecdef IS NOT TRUE THEN 'Missing SECURITY DEFINER'
        WHEN actual_fn.owner_name <> expected.expected_owner THEN 'Owner mismatch'
        WHEN actual_fn.search_path_setting IS DISTINCT FROM 'search_path=pg_catalog, pg_temp' THEN 'Invalid search_path'
        WHEN actual_fn.customer_app_has_execute <> expected.exp_customer_exec THEN 'customer_app execute permission mismatch'
        WHEN actual_fn.public_has_execute IS TRUE THEN 'PUBLIC has EXECUTE (must be revoked)'
        ELSE 'VALID'
      END AS issue
  ) chk_fn ON true
  WHERE chk_fn.issue <> 'VALID';

  -- 9.4 AUDIT FOR UNEXPECTED FUNCTION OVERLOADS
  SELECT string_agg(p.proname || '(' || oidvectortypes(p.proargtypes) || ')', '; ')
  INTO v_unexpected_function_overloads
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND (
      (p.proname = 'is_product_liked' AND oidvectortypes(p.proargtypes) <> 'text, text')
      OR (p.proname = 'get_user_liked_products' AND oidvectortypes(p.proargtypes) <> 'text[], text')
      OR (p.proname = 'sync_product_like_count' AND oidvectortypes(p.proargtypes) <> '')
    );

  -- 9.5 AUDIT TRIGGER EXISTENCE, TIMING, EVENTS, LINKAGE, AND OWNERSHIP
  SELECT NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'ProductLike' AND t.tgname = 'trg_sync_product_like_count'
  ) INTO v_trigger_missing;

  SELECT string_agg(issue, '; ')
  INTO v_trigger_timing_defects
  FROM (
    SELECT 
      CASE 
        WHEN (t.tgtype & 1) <> 1 THEN 'Must be FOR EACH ROW'
        WHEN (t.tgtype & 66) <> 0 THEN 'Timing must be AFTER'
        WHEN (t.tgtype & 4) <> 4 THEN 'Must fire on INSERT'
        WHEN (t.tgtype & 8) <> 8 THEN 'Must fire on DELETE'
        WHEN (t.tgtype & 16) <> 0 THEN 'Must NOT fire on UPDATE'
        WHEN (t.tgtype & 32) <> 0 THEN 'Must NOT fire on TRUNCATE'
        WHEN t.tgenabled NOT IN ('O', 'A') THEN 'Trigger is not enabled for origin traffic (tgenabled must be O or A)'
        ELSE 'VALID'
      END AS issue
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND c.relname = 'ProductLike' 
      AND t.tgname = 'trg_sync_product_like_count'
      AND NOT t.tgisinternal
  ) trg_chk
  WHERE trg_chk.issue <> 'VALID';

  SELECT string_agg(link_issue, '; ')
  INTO v_trigger_linkage_defects
  FROM (
    SELECT 
      CASE 
        WHEN p.proname IS DISTINCT FROM 'sync_product_like_count' THEN 'Linked function must be sync_product_like_count'
        WHEN r.rolname IS DISTINCT FROM 'postgres' THEN 'Function owner must be postgres'
        WHEN p.prosecdef IS NOT TRUE THEN 'Function must be SECURITY DEFINER'
        WHEN (SELECT string_agg(s, ', ') FROM unnest(p.proconfig) s WHERE s LIKE 'search_path=%') IS DISTINCT FROM 'search_path=pg_catalog, pg_temp' THEN 'search_path must be pg_catalog, pg_temp'
        WHEN EXISTS (
          SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
          WHERE acl.grantee = 0 AND acl.privilege_type = 'EXECUTE'
        ) THEN 'PUBLIC has EXECUTE on trigger function'
        WHEN EXISTS (
          SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
          JOIN pg_roles gr ON gr.oid = acl.grantee
          WHERE gr.rolname = 'customer_app' AND acl.privilege_type = 'EXECUTE'
        ) THEN 'customer_app has direct EXECUTE on trigger function'
        ELSE 'VALID'
      END AS link_issue
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    LEFT JOIN pg_proc p ON t.tgfoid = p.oid
    LEFT JOIN pg_roles r ON p.proowner = r.oid
    WHERE n.nspname = 'public' 
      AND c.relname = 'ProductLike' 
      AND t.tgname = 'trg_sync_product_like_count'
      AND NOT t.tgisinternal
  ) link_chk
  WHERE link_chk.link_issue <> 'VALID';

  -- 9.6 AUDIT EFFECTIVE TABLE PRIVILEGES ACROSS ALL 17 TABLES (Direct & Inherited)
  -- Guarantees sensitive admin tables and _prisma_migrations remain 100% inaccessible.
  SELECT string_agg(t.tbl || ' (expected [' || t.expected_privileges || '] but got [' || t.actual_effective_privileges || '])', '; ')
  INTO v_privilege_deviations
  FROM (
    SELECT 
      l.tbl,
      l.expected_privileges,
      concat_ws(', ',
        CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'SELECT') THEN 'SELECT' END,
        CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'INSERT') THEN 'INSERT' END,
        CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'UPDATE') THEN 'UPDATE' END,
        CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'DELETE') THEN 'DELETE' END,
        CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'TRUNCATE') THEN 'TRUNCATE' END,
        CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'REFERENCES') THEN 'REFERENCES' END,
        CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'TRIGGER') THEN 'TRIGGER' END
      ) AS actual_effective_privileges
    FROM (
      VALUES
        ('Business', 'SELECT'),
        ('Category', 'SELECT'),
        ('Product', 'SELECT'),
        ('Media', 'SELECT'),
        ('Homepage', 'SELECT'),
        ('HomepageFeaturedCategory', 'SELECT'),
        ('HomepageSection', 'SELECT'),
        ('ProductGalleryImage', 'SELECT'),
        ('ProductLike', 'INSERT, DELETE'),
        ('ProductLikeCount', 'SELECT'),
        ('WebsiteVisit', 'INSERT'),
        ('User', ''),
        ('Session', ''),
        ('Account', ''),
        ('VerificationToken', ''),
        ('AuditLog', ''),
        ('_prisma_migrations', '')
    ) AS l(tbl, expected_privileges)
  ) t
  WHERE t.actual_effective_privileges <> t.expected_privileges;

  -- 9.7 AUDIT ZERO EFFECTIVE SEQUENCE PRIVILEGES FOR customer_app
  SELECT count(*) INTO v_sequence_privilege_deviations
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' 
    AND c.relkind = 'S'
    AND (
      has_sequence_privilege('customer_app', c.oid, 'USAGE')
      OR has_sequence_privilege('customer_app', c.oid, 'SELECT')
      OR has_sequence_privilege('customer_app', c.oid, 'UPDATE')
    );

  -- 9.8 AUDIT ZERO UNINTENDED ROLE MEMBERSHIPS
  SELECT string_agg(r_parent.rolname, ', ')
  INTO v_membership_deviations
  FROM pg_auth_members am
  JOIN pg_roles r_child ON am.member = r_child.oid
  JOIN pg_roles r_parent ON am.roleid = r_parent.oid
  WHERE r_child.rolname = 'customer_app';

  -- 9.9 AUDIT customer_app ROLE ATTRIBUTES & REPLICATION HARDENING (rolreplication = false)
  -- Asserts that customer_app possesses zero replication privileges, cannot bypass RLS,
  -- and has exact least-privilege role attributes (LOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOINHERIT, NOREPLICATION, NOBYPASSRLS).
  SELECT string_agg(issue, '; ')
  INTO v_role_attribute_defects
  FROM (
    SELECT 
      CASE 
        WHEN rolreplication THEN 'customer_app has REPLICATION (rolreplication must be false)'
        WHEN rolsuper THEN 'customer_app has SUPERUSER (rolsuper must be false)'
        WHEN rolcreatedb THEN 'customer_app has CREATEDB (rolcreatedb must be false)'
        WHEN rolcreaterole THEN 'customer_app has CREATEROLE (rolcreaterole must be false)'
        WHEN rolinherit THEN 'customer_app has INHERIT (rolinherit must be false)'
        WHEN rolbypassrls THEN 'customer_app has BYPASSRLS (rolbypassrls must be false)'
        WHEN NOT rolcanlogin THEN 'customer_app lacks LOGIN (rolcanlogin must be true)'
        ELSE 'VALID'
      END AS issue
    FROM pg_roles
    WHERE rolname = 'customer_app'
  ) r_chk
  WHERE r_chk.issue <> 'VALID';

  -- Pre-commit verification assertion: customer_app must exist and rolreplication must be false
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'customer_app' AND rolreplication = false
  ) THEN
    v_role_attribute_defects := COALESCE(v_role_attribute_defects || '; ', '') || 'customer_app.rolreplication is not false (or role missing)';
  END IF;

  -- 9.10 AUDIT RLS STATUS ON ALL APPLICATION TABLES & _prisma_migrations
  -- RLS must be enabled on all 16 application tables.
  SELECT string_agg(c.relname, ', ')
  INTO v_rls_missing
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' 
    AND c.relkind = 'r'
    AND c.relname IN (
      'Business', 'Category', 'Product', 'ProductGalleryImage',
      'Homepage', 'HomepageFeaturedCategory', 'HomepageSection', 'Media',
      'ProductLike', 'ProductLikeCount', 'WebsiteVisit',
      'User', 'Session', 'Account', 'VerificationToken', 'AuditLog'
    )
    AND NOT c.relrowsecurity;

  -- _prisma_migrations must NOT have RLS enabled (preserves standard migration mechanics)
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = '_prisma_migrations' AND c.relrowsecurity
  ) THEN
    v_rls_missing := COALESCE(v_rls_missing || '; ', '') || '_prisma_migrations has RLS enabled (must remain disabled)';
  END IF;

  -- FORCE RLS must NOT be active on any table (preserves postgres bypass)
  SELECT string_agg(c.relname, ', ')
  INTO v_force_rls_active
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' 
    AND c.relkind = 'r'
    AND c.relname IN (
      'Business', 'Category', 'Product', 'ProductGalleryImage',
      'Homepage', 'HomepageFeaturedCategory', 'HomepageSection', 'Media',
      'ProductLike', 'ProductLikeCount', 'WebsiteVisit',
      'User', 'Session', 'Account', 'VerificationToken', 'AuditLog'
    )
    AND c.relforcerowsecurity;

  -- 9.11 OUTPUT PRE-COMMIT AUDIT SUMMARY
  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'PRE-COMMIT SECURITY AUDIT SUMMARY';
  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'Defective RLS Policies          : %', COALESCE(v_defective_policies, '0');
  RAISE NOTICE 'Unexpected Policies             : %', COALESCE(v_unexpected_policies, '0');
  RAISE NOTICE 'Defective Functions             : %', COALESCE(v_defective_functions, '0');
  RAISE NOTICE 'Unexpected Function Overloads   : %', COALESCE(v_unexpected_function_overloads, '0');
  RAISE NOTICE 'Trigger Missing                 : %', v_trigger_missing;
  RAISE NOTICE 'Trigger Timing/Event Defects    : %', COALESCE(v_trigger_timing_defects, '0');
  RAISE NOTICE 'Trigger Linkage/Owner Defects   : %', COALESCE(v_trigger_linkage_defects, '0');
  RAISE NOTICE 'Effective Privilege Deviations  : %', COALESCE(v_privilege_deviations, '0');
  RAISE NOTICE 'Sequence Privilege Deviations   : %', v_sequence_privilege_deviations;
  RAISE NOTICE 'Unintended Role Memberships     : %', COALESCE(v_membership_deviations, '0');
  RAISE NOTICE 'Role Attribute Defects          : %', COALESCE(v_role_attribute_defects, '0');
  RAISE NOTICE 'Tables Missing RLS              : %', COALESCE(v_rls_missing, '0');
  RAISE NOTICE 'Active FORCE RLS (Bad)          : %', COALESCE(v_force_rls_active, '0');
  RAISE NOTICE '=======================================================';

  -- 9.12 STRICT FAIL-CLOSED ASSERTION (FORCES TRANSACTION ROLLBACK ON DEFICIENCY)
  IF v_defective_policies IS NOT NULL 
     OR v_unexpected_policies IS NOT NULL
     OR v_defective_functions IS NOT NULL 
     OR v_unexpected_function_overloads IS NOT NULL
     OR v_trigger_missing 
     OR v_trigger_timing_defects IS NOT NULL
     OR v_trigger_linkage_defects IS NOT NULL
     OR v_privilege_deviations IS NOT NULL
     OR v_sequence_privilege_deviations > 0
     OR v_membership_deviations IS NOT NULL
     OR v_role_attribute_defects IS NOT NULL
     OR v_rls_missing IS NOT NULL 
     OR v_force_rls_active IS NOT NULL THEN
    RAISE EXCEPTION 'PRE-COMMIT VERIFICATION FAILED: Security baseline not met! Rolling back entire transaction. Deficiencies: [Policies: %] [Unexpected Policies: %] [Functions: %] [Overloads: %] [Trigger Missing: %] [Trigger Timing: %] [Trigger Linkage: %] [Privileges: %] [Sequences: %] [Memberships: %] [Role Attributes: %] [RLS Missing: %] [FORCE RLS: %]',
      COALESCE(v_defective_policies, 'none'),
      COALESCE(v_unexpected_policies, 'none'),
      COALESCE(v_defective_functions, 'none'),
      COALESCE(v_unexpected_function_overloads, 'none'),
      v_trigger_missing,
      COALESCE(v_trigger_timing_defects, 'none'),
      COALESCE(v_trigger_linkage_defects, 'none'),
      COALESCE(v_privilege_deviations, 'none'),
      v_sequence_privilege_deviations,
      COALESCE(v_membership_deviations, 'none'),
      COALESCE(v_role_attribute_defects, 'none'),
      COALESCE(v_rls_missing, 'none'),
      COALESCE(v_force_rls_active, 'none');
  ELSE
    RAISE NOTICE 'PRE-COMMIT VERIFICATION PASSED: All 12 policies, 3 functions, trigger, permissions, role attributes, and RLS configurations strictly verified. Committing transaction.';
  END IF;
END $$;

-- Transaction commits ONLY if every pre-commit security check above succeeded without exception
COMMIT;

-- =============================================================================
-- SECTION 10: POST-COMMIT DIAGNOSTIC QUERIES (OPERATOR VISIBILITY)
-- Read-only SELECT queries providing structured tabular output in Supabase SQL Editor.
-- NOTE: Transactional atomicity and fail-closed rollback are strictly guaranteed
-- by the pre-commit DO block in Section 9 before COMMIT was issued.
-- =============================================================================

-- 10.1 Structural Policy Predicate Verification Table
SELECT 
  expected.table_name,
  expected.policy_name,
  expected.expected_cmd,
  actual.actual_cmd,
  actual.is_customer_app_only,
  actual.is_permissive,
  actual.decompiled_expression,
  chk.evaluation AS structural_verification_status
FROM (
  VALUES
    ('Product', 'product_customer_select', 'r'),
    ('Category', 'category_customer_select', 'r'),
    ('Media', 'media_customer_select', 'r'),
    ('Business', 'business_customer_select', 'r'),
    ('Homepage', 'homepage_customer_select', 'r'),
    ('HomepageFeaturedCategory', 'hp_feat_cat_customer_select', 'r'),
    ('HomepageSection', 'hp_section_customer_select', 'r'),
    ('ProductGalleryImage', 'prod_gallery_customer_select', 'r'),
    ('ProductLike', 'prod_like_customer_insert', 'a'),
    ('ProductLike', 'prod_like_customer_delete', 'd'),
    ('ProductLikeCount', 'prod_like_count_customer_select', 'r'),
    ('WebsiteVisit', 'website_visit_customer_insert', 'a')
) AS expected(table_name, policy_name, expected_cmd)
LEFT JOIN LATERAL (
  SELECT 
    pol.polcmd AS actual_cmd,
    pol.polpermissive AS is_permissive,
    ((SELECT array_agg(rolname) FROM pg_roles WHERE oid = ANY(pol.polroles)) = ARRAY['customer_app']::name[]) AS is_customer_app_only,
    COALESCE(pg_get_expr(pol.polqual, pol.polrelid), '') AS expr_using,
    COALESCE(pg_get_expr(pol.polwithcheck, pol.polrelid), '') AS expr_check,
    COALESCE(pg_get_expr(pol.polqual, pol.polrelid), '') || ' ' || COALESCE(pg_get_expr(pol.polwithcheck, pol.polrelid), '') AS decompiled_expression
  FROM pg_policy pol
  JOIN pg_class c ON pol.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' 
    AND c.relname = expected.table_name 
    AND pol.polname = expected.policy_name
) actual ON true
LEFT JOIN LATERAL (
  SELECT 
    CASE 
      WHEN actual.actual_cmd IS NULL THEN 'FAIL: Policy missing'
      WHEN NOT actual.is_permissive THEN 'FAIL: Policy must be PERMISSIVE'
      WHEN NOT actual.is_customer_app_only THEN 'FAIL: Policy roles must target ONLY customer_app'
      WHEN actual.actual_cmd <> expected.expected_cmd THEN 'FAIL: Command mismatch'
      
      WHEN expected.table_name = 'Product' AND NOT (
        actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
        AND actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
        AND actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?deletedAt"?\s+IS\s+NULL'
        AND actual.expr_using !~* '\m(OR|NOT)\M'
      ) THEN 'FAIL: Missing status=PUBLISHED, isVisible=true, or deletedAt IS NULL conjunction'
      
      WHEN expected.table_name = 'Category' AND NOT (
        actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
        AND actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
        AND actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?deletedAt"?\s+IS\s+NULL'
        AND actual.expr_using !~* '\m(OR|NOT)\M'
      ) THEN 'FAIL: Missing status=PUBLISHED, isVisible=true, or deletedAt IS NULL conjunction'
      
      WHEN expected.table_name = 'Media' AND NOT (
        actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?status"?\s*=\s*''READY''::("?[A-Za-z0-9_]+"?\.)?"?MediaStatus"?'
        AND actual.expr_using !~* '\m(OR|NOT)\M'
      ) THEN 'FAIL: Missing status=READY predicate'
      
      WHEN expected.table_name = 'Business' AND NOT (
        actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
        AND actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?deletedAt"?\s+IS\s+NULL'
        AND actual.expr_using !~* '\m(OR|NOT)\M'
      ) THEN 'FAIL: Missing status=PUBLISHED and deletedAt IS NULL conjunction'
      
      WHEN expected.table_name = 'Homepage' AND NOT (
        actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
        AND actual.expr_using !~* '\m(OR|NOT)\M'
      ) THEN 'FAIL: Missing status=PUBLISHED predicate'
      
      WHEN expected.table_name = 'HomepageSection' AND NOT (
        actual.expr_using ~* '("?[A-Za-z0-9_]+"?\.)?"?enabled"?(\s*=\s*true|\s+IS\s+TRUE)'
        AND actual.expr_using !~* '\m(OR|NOT)\M'
      ) THEN 'FAIL: Missing enabled=true predicate'
      
      WHEN expected.table_name = 'HomepageFeaturedCategory' AND NOT (
        (
          actual.expr_using ~* 'h\."?id"?\s*=\s*("?HomepageFeaturedCategory"?\.)?"?homepageId"?'
          OR actual.expr_using ~* '("?HomepageFeaturedCategory"?\.)?"?homepageId"?\s*=\s*h\."?id"?'
        )
        AND actual.expr_using ~* 'h\."?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
        AND (
          actual.expr_using ~* 'c\."?id"?\s*=\s*("?HomepageFeaturedCategory"?\.)?"?categoryId"?'
          OR actual.expr_using ~* '("?HomepageFeaturedCategory"?\.)?"?categoryId"?\s*=\s*c\."?id"?'
        )
        AND actual.expr_using ~* 'c\."?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
        AND actual.expr_using ~* 'c\."?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
        AND actual.expr_using ~* 'c\."?deletedAt"?\s+IS\s+NULL'
        AND actual.expr_using !~* '\m(OR|NOT)\M'
      ) THEN 'FAIL: Missing subquery correlation for published Homepage and Category'
      
      WHEN expected.table_name = 'ProductGalleryImage' AND NOT (
        (
          actual.expr_using ~* 'p\."?id"?\s*=\s*("?ProductGalleryImage"?\.)?"?productId"?'
          OR actual.expr_using ~* '("?ProductGalleryImage"?\.)?"?productId"?\s*=\s*p\."?id"?'
        )
        AND actual.expr_using ~* 'p\."?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
        AND actual.expr_using ~* 'p\."?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
        AND actual.expr_using ~* 'p\."?deletedAt"?\s+IS\s+NULL'
        AND (
          actual.expr_using ~* 'm\."?id"?\s*=\s*("?ProductGalleryImage"?\.)?"?mediaId"?'
          OR actual.expr_using ~* '("?ProductGalleryImage"?\.)?"?mediaId"?\s*=\s*m\."?id"?'
        )
        AND actual.expr_using ~* 'm\."?status"?\s*=\s*''READY''::("?[A-Za-z0-9_]+"?\.)?"?MediaStatus"?'
        AND actual.expr_using !~* '\m(OR|NOT)\M'
      ) THEN 'FAIL: Missing subquery correlation for published Product and READY Media'
      
      WHEN expected.table_name = 'ProductLike' AND expected.policy_name = 'prod_like_customer_insert' AND NOT (
        (
          actual.expr_check ~* 'p\."?id"?\s*=\s*("?ProductLike"?\.)?"?productId"?'
          OR actual.expr_check ~* '("?ProductLike"?\.)?"?productId"?\s*=\s*p\."?id"?'
        )
        AND actual.expr_check ~* 'p\."?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
        AND actual.expr_check ~* 'p\."?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
        AND actual.expr_check ~* 'p\."?deletedAt"?\s+IS\s+NULL'
        AND actual.expr_check !~* '\m(OR|NOT)\M'
      ) THEN 'FAIL: Missing correlation on published, visible, non-deleted Product'
      
      WHEN expected.table_name = 'ProductLike' AND expected.policy_name = 'prod_like_customer_delete' AND NOT (
        (
          actual.expr_using ~* 'p\."?id"?\s*=\s*("?ProductLike"?\.)?"?productId"?'
          OR actual.expr_using ~* '("?ProductLike"?\.)?"?productId"?\s*=\s*p\."?id"?'
        )
        AND actual.expr_using ~* 'p\."?status"?\s*=\s*''PUBLISHED''::("?[A-Za-z0-9_]+"?\.)?"?PublishStatus"?'
        AND actual.expr_using ~* 'p\."?isVisible"?(\s*=\s*true|\s+IS\s+TRUE)'
        AND actual.expr_using ~* 'p\."?deletedAt"?\s+IS\s+NULL'
        AND actual.expr_using !~* '\m(OR|NOT)\M'
      ) THEN 'FAIL: Missing correlation on published, visible, non-deleted Product'
      
      WHEN expected.table_name = 'ProductLikeCount' AND NOT (
        trim(actual.expr_using) = 'true'
      ) THEN 'FAIL: Must be true'
      
      WHEN expected.table_name = 'WebsiteVisit' AND NOT (
        trim(actual.expr_check) = 'true'
      ) THEN 'FAIL: Must be true'
      
      ELSE 'PASS: Structural command, target role, and AST predicates verified'
    END AS evaluation
) chk ON true
ORDER BY expected.table_name, expected.policy_name;

-- 10.2 Unexpected Policy Audit Table
SELECT 
  c.relname AS table_name,
  pol.polname AS unexpected_policy_name,
  pol.polcmd AS command,
  array_to_string(ARRAY(SELECT rolname FROM pg_roles WHERE oid = ANY(pol.polroles)), ', ') AS targeted_roles,
  'FAIL: Unexpected policy detected! Must be reviewed and removed' AS status
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    c.relname IN ('User', 'Session', 'Account', 'VerificationToken', 'AuditLog', '_prisma_migrations')
    OR 0 = ANY(pol.polroles)
    OR EXISTS (SELECT 1 FROM pg_roles r WHERE r.oid = ANY(pol.polroles) AND r.rolname IN ('anon', 'authenticated', 'public'))
    OR (c.relname IN ('Business', 'Category', 'Product', 'ProductGalleryImage', 'Homepage', 'HomepageFeaturedCategory', 'HomepageSection', 'Media', 'ProductLike', 'ProductLikeCount', 'WebsiteVisit')
        AND pol.polname NOT IN ('product_customer_select', 'category_customer_select', 'media_customer_select', 'business_customer_select', 'homepage_customer_select', 'hp_feat_cat_customer_select', 'hp_section_customer_select', 'prod_gallery_customer_select', 'prod_like_customer_insert', 'prod_like_customer_delete', 'prod_like_count_customer_select', 'website_visit_customer_insert'))
  )
ORDER BY c.relname, pol.polname;

-- 10.3 Function ACL, Signature & Security Definer Audit Table
SELECT 
  expected.fname AS function_name,
  expected.regproc_sig AS expected_signature,
  actual_fn.actual_args AS actual_argument_types,
  actual_fn.prosecdef AS is_security_definer,
  actual_fn.owner_name,
  actual_fn.search_path_setting,
  actual_fn.customer_app_has_execute,
  actual_fn.public_has_execute,
  chk_fn.status AS audit_status
FROM (
  VALUES 
    ('is_product_liked', 'public.is_product_liked(text,text)', 'text, text', 'postgres', true),
    ('get_user_liked_products', 'public.get_user_liked_products(text[],text)', 'text[], text', 'postgres', true),
    ('sync_product_like_count', 'public.sync_product_like_count()', '', 'postgres', false)
) AS expected(fname, regproc_sig, type_args, expected_owner, exp_customer_exec)
LEFT JOIN LATERAL (
  SELECT 
    p.oid,
    p.prosecdef,
    r.rolname AS owner_name,
    oidvectortypes(p.proargtypes) AS actual_args,
    (SELECT string_agg(s, ', ') FROM unnest(p.proconfig) s WHERE s LIKE 'search_path=%') AS search_path_setting,
    EXISTS (
      SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
      JOIN pg_roles gr ON gr.oid = acl.grantee
      WHERE gr.rolname = 'customer_app' AND acl.privilege_type = 'EXECUTE'
    ) AS customer_app_has_execute,
    EXISTS (
      SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
      WHERE acl.grantee = 0 AND acl.privilege_type = 'EXECUTE'
    ) AS public_has_execute
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_roles r ON r.oid = p.proowner
  WHERE n.nspname = 'public' 
    AND p.proname = expected.fname 
    AND p.oid = to_regprocedure(expected.regproc_sig)::oid
    AND oidvectortypes(p.proargtypes) = expected.type_args
) actual_fn ON true
LEFT JOIN LATERAL (
  SELECT 
    CASE 
      WHEN actual_fn.oid IS NULL THEN 'FAIL: Exact signature missing'
      WHEN actual_fn.prosecdef IS NOT TRUE THEN 'FAIL: Missing SECURITY DEFINER'
      WHEN actual_fn.owner_name <> expected.expected_owner THEN 'FAIL: Owner mismatch'
      WHEN actual_fn.search_path_setting IS DISTINCT FROM 'search_path=pg_catalog, pg_temp' THEN 'FAIL: Invalid search_path'
      WHEN actual_fn.customer_app_has_execute <> expected.exp_customer_exec THEN 'FAIL: customer_app execute permission mismatch'
      WHEN actual_fn.public_has_execute IS TRUE THEN 'FAIL: PUBLIC has EXECUTE (must be revoked)'
      ELSE 'PASS: Function security attributes verified'
    END AS status
) chk_fn ON true
ORDER BY expected.fname;

-- 10.4 Function Overload Detection Table
SELECT 
  p.proname AS function_name,
  oidvectortypes(p.proargtypes) AS unexpected_signature,
  'FAIL: Unexpected function overload detected! Must be removed' AS status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (
    (p.proname = 'is_product_liked' AND oidvectortypes(p.proargtypes) <> 'text, text')
    OR (p.proname = 'get_user_liked_products' AND oidvectortypes(p.proargtypes) <> 'text[], text')
    OR (p.proname = 'sync_product_like_count' AND oidvectortypes(p.proargtypes) <> '')
  )
ORDER BY p.proname;

-- 10.5 Trigger Timing, Events, Linkage & Ownership Audit Table
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS linked_function,
  r.rolname AS function_owner,
  CASE 
    WHEN (t.tgtype & 1) <> 1 THEN 'FAIL: Must be FOR EACH ROW'
    WHEN (t.tgtype & 66) <> 0 THEN 'FAIL: Timing must be AFTER'
    WHEN (t.tgtype & 4) <> 4 THEN 'FAIL: Must fire on INSERT'
    WHEN (t.tgtype & 8) <> 8 THEN 'FAIL: Must fire on DELETE'
    WHEN (t.tgtype & 16) <> 0 THEN 'FAIL: Must NOT fire on UPDATE'
    WHEN (t.tgtype & 32) <> 0 THEN 'FAIL: Must NOT fire on TRUNCATE'
    WHEN t.tgenabled NOT IN ('O', 'A') THEN 'FAIL: Trigger is not enabled for origin traffic (tgenabled must be O or A)'
    WHEN p.proname IS DISTINCT FROM 'sync_product_like_count' THEN 'FAIL: Linked function must be sync_product_like_count'
    WHEN r.rolname IS DISTINCT FROM 'postgres' THEN 'FAIL: Function owner must be postgres'
    ELSE 'PASS: Trigger timing (AFTER), events (INSERT OR DELETE), row-level, linkage, owner and enabled state verified'
  END AS trigger_audit_status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
LEFT JOIN pg_roles r ON p.proowner = r.oid
WHERE n.nspname = 'public' 
  AND c.relname = 'ProductLike' 
  AND t.tgname = 'trg_sync_product_like_count'
  AND NOT t.tgisinternal;

-- 10.6 Effective customer_app Privilege Matrix Audit Table (Direct & Inherited Permissions)
SELECT 
  t.tbl AS table_name,
  t.expected_privileges,
  t.actual_effective_privileges,
  CASE 
    WHEN t.actual_effective_privileges = t.expected_privileges THEN 'PASS: Effective privileges match approved matrix'
    ELSE 'FAIL: Privilege deviation: Expected [' || t.expected_privileges || '] but found [' || t.actual_effective_privileges || ']'
  END AS matrix_status
FROM (
  SELECT 
    l.tbl,
    l.expected_privileges,
    concat_ws(', ',
      CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'SELECT') THEN 'SELECT' END,
      CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'INSERT') THEN 'INSERT' END,
      CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'UPDATE') THEN 'UPDATE' END,
      CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'DELETE') THEN 'DELETE' END,
      CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'TRUNCATE') THEN 'TRUNCATE' END,
      CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'REFERENCES') THEN 'REFERENCES' END,
      CASE WHEN has_table_privilege('customer_app', 'public."' || l.tbl || '"', 'TRIGGER') THEN 'TRIGGER' END
    ) AS actual_effective_privileges
  FROM (
    VALUES
      ('Business', 'SELECT'),
      ('Category', 'SELECT'),
      ('Product', 'SELECT'),
      ('Media', 'SELECT'),
      ('Homepage', 'SELECT'),
      ('HomepageFeaturedCategory', 'SELECT'),
      ('HomepageSection', 'SELECT'),
      ('ProductGalleryImage', 'SELECT'),
      ('ProductLike', 'INSERT, DELETE'),
      ('ProductLikeCount', 'SELECT'),
      ('WebsiteVisit', 'INSERT'),
      ('User', ''),
      ('Session', ''),
      ('Account', ''),
      ('VerificationToken', ''),
      ('AuditLog', ''),
      ('_prisma_migrations', '')
  ) AS l(tbl, expected_privileges)
) t
ORDER BY t.tbl;

-- 10.7 Sequence Privilege Audit Table (Zero Privileges Required)
SELECT 
  c.relname AS sequence_name,
  has_sequence_privilege('customer_app', c.oid, 'USAGE') AS has_usage,
  has_sequence_privilege('customer_app', c.oid, 'SELECT') AS has_select,
  has_sequence_privilege('customer_app', c.oid, 'UPDATE') AS has_update,
  CASE 
    WHEN has_sequence_privilege('customer_app', c.oid, 'USAGE')
      OR has_sequence_privilege('customer_app', c.oid, 'SELECT')
      OR has_sequence_privilege('customer_app', c.oid, 'UPDATE')
    THEN 'FAIL: customer_app holds unintended sequence privilege'
    ELSE 'PASS: Zero sequence privileges'
  END AS sequence_audit_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'S'
ORDER BY c.relname;

-- 10.8 Role Attributes & Replication Hardening Audit Table
SELECT 
  rolname AS role_name,
  rolcanlogin AS can_login,
  rolsuper AS is_superuser,
  rolcreatedb AS can_create_db,
  rolcreaterole AS can_create_role,
  rolinherit AS does_inherit,
  rolreplication AS is_replication,
  rolbypassrls AS does_bypass_rls,
  CASE 
    WHEN rolreplication = false
     AND rolsuper = false
     AND rolcreatedb = false
     AND rolcreaterole = false
     AND rolinherit = false
     AND rolbypassrls = false
     AND rolcanlogin = true
    THEN 'PASS: Role attributes hardened (LOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOINHERIT, NOREPLICATION, NOBYPASSRLS)'
    ELSE 'FAIL: Role attribute deviation (rolreplication must be false, rolsuper must be false, rolbypassrls must be false)'
  END AS role_attribute_status
FROM pg_roles
WHERE rolname = 'customer_app';
