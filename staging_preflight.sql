-- =============================================================================
-- QUALITY BAKERS: STAGING PREFLIGHT VERIFICATION SCRIPT (READ-ONLY)
-- File: staging_preflight.sql
-- Compatibility: 100% Pure PostgreSQL (Supabase Web SQL Editor and psql)
-- Safety: STRICTLY READ-ONLY (SELECT & diagnostic inspection only)
-- Zero DDL (No CREATE, ALTER, DROP) & Zero DML (No INSERT, UPDATE, DELETE)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CHECK 1: Required Public Tables Existence (All 17 Tables)
-- Verifies the 11 customer-accessible tables, 5 sensitive admin tables,
-- and the internal Prisma migration tracking table.
-- -----------------------------------------------------------------------------
SELECT 
  expected.table_name,
  CASE 
    WHEN t.table_name IS NOT NULL THEN 'PASS: Table exists in public schema'
    ELSE 'FAIL: Required table missing'
  END AS status
FROM (
  VALUES 
    ('Business'), ('Category'), ('Product'), ('ProductGalleryImage'),
    ('Homepage'), ('HomepageFeaturedCategory'), ('HomepageSection'), ('Media'),
    ('ProductLike'), ('ProductLikeCount'), ('WebsiteVisit'),
    ('User'), ('Session'), ('Account'), ('VerificationToken'), ('AuditLog'),
    ('_prisma_migrations')
) AS expected(table_name)
LEFT JOIN information_schema.tables t 
  ON t.table_schema = 'public' AND t.table_name = expected.table_name
ORDER BY expected.table_name;

-- -----------------------------------------------------------------------------
-- CHECK 2: Required Enum Types Existence (All 5 Enums in public schema)
-- Confirms enums exist specifically in public, preventing false passes from other schemas.
-- -----------------------------------------------------------------------------
SELECT 
  expected.enum_name,
  CASE 
    WHEN e.typname IS NOT NULL THEN 'PASS: Enum exists in public schema'
    ELSE 'FAIL: Required enum missing from public schema'
  END AS status
FROM (
  VALUES 
    ('PublishStatus'), ('BadgeType'), ('AvailabilityStatus'), ('MediaType'), ('MediaStatus')
) AS expected(enum_name)
LEFT JOIN (
  SELECT t.typname 
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' AND t.typtype = 'e'
) AS e ON e.typname = expected.enum_name
ORDER BY expected.enum_name;

-- -----------------------------------------------------------------------------
-- CHECK 3: Native Catalog Foreign Key & ON DELETE CASCADE Verification (6 Constraints)
-- Uses pg_constraint, pg_class, and pg_attribute so missing constraints report FAIL.
-- -----------------------------------------------------------------------------
SELECT 
  expected.dependent_table,
  expected.fk_column,
  expected.referenced_table,
  expected.referenced_column,
  expected.expected_delete_rule,
  COALESCE(actual.delete_rule, 'NONE') AS actual_delete_rule,
  CASE 
    WHEN actual.conname IS NULL 
      THEN 'FAIL: Foreign key does NOT exist'
    WHEN actual.delete_rule = expected.expected_delete_rule 
      THEN 'PASS: FK exists with expected ' || expected.expected_delete_rule
    ELSE 'FAIL: Expected ' || expected.expected_delete_rule || ' but found ' || actual.delete_rule
  END AS cascade_status
FROM (
  VALUES
    ('ProductLike', 'productId', 'Product', 'id', 'CASCADE'),
    ('ProductLikeCount', 'productId', 'Product', 'id', 'CASCADE'),
    ('ProductGalleryImage', 'productId', 'Product', 'id', 'CASCADE'),
    ('ProductGalleryImage', 'mediaId', 'Media', 'id', 'CASCADE'),
    ('HomepageFeaturedCategory', 'homepageId', 'Homepage', 'id', 'CASCADE'),
    ('HomepageFeaturedCategory', 'categoryId', 'Category', 'id', 'CASCADE')
) AS expected(dependent_table, fk_column, referenced_table, referenced_column, expected_delete_rule)
LEFT JOIN (
  SELECT 
    c.conname,
    src_cls.relname AS dependent_table,
    src_att.attname AS fk_column,
    ref_cls.relname AS referenced_table,
    ref_att.attname AS referenced_column,
    CASE c.confdeltype
      WHEN 'c' THEN 'CASCADE'
      WHEN 'n' THEN 'SET NULL'
      WHEN 'd' THEN 'SET DEFAULT'
      WHEN 'r' THEN 'RESTRICT'
      WHEN 'a' THEN 'NO ACTION'
      ELSE c.confdeltype::text
    END AS delete_rule
  FROM pg_constraint c
  JOIN pg_namespace n ON n.oid = c.connamespace
  JOIN pg_class src_cls ON src_cls.oid = c.conrelid
  JOIN pg_class ref_cls ON ref_cls.oid = c.confrelid
  JOIN pg_attribute src_att ON src_att.attrelid = c.conrelid AND src_att.attnum = c.conkey[1]
  JOIN pg_attribute ref_att ON ref_att.attrelid = c.confrelid AND ref_att.attnum = c.confkey[1]
  WHERE n.nspname = 'public' 
    AND c.contype = 'f'
) AS actual
  ON actual.dependent_table = expected.dependent_table
  AND actual.fk_column = expected.fk_column
  AND actual.referenced_table = expected.referenced_table
  AND actual.referenced_column = expected.referenced_column
ORDER BY expected.dependent_table, expected.fk_column;

-- -----------------------------------------------------------------------------
-- CHECK 4: Admin Role BYPASSRLS Compatibility
-- Asserts role 'postgres' possesses BYPASSRLS so administrative operations and
-- NextAuth sessions are never blocked when RLS is active on public tables.
-- -----------------------------------------------------------------------------
SELECT 
  r.rolname AS admin_role,
  r.rolsuper AS is_superuser,
  r.rolbypassrls AS has_bypass_rls,
  CASE 
    WHEN r.rolbypassrls = true OR r.rolsuper = true 
      THEN 'PASS: Admin role bypasses RLS. Auth & Audit tables safe.'
    ELSE 'FAIL: Admin role lacks BYPASSRLS! Enabling RLS will block admin operations.'
  END AS admin_compatibility_status
FROM pg_roles r
WHERE r.rolname = 'postgres';

-- -----------------------------------------------------------------------------
-- CHECK 5: Pre-provisioning customer_app Role State & Attribute Inspection
-- Asserts customer_app does not exist prior to provisioning, or verifies attributes.
-- -----------------------------------------------------------------------------
SELECT 
  'customer_app' AS checked_role,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'customer_app') 
      THEN 'PASS: Role does not exist yet. Safe for initial clean provisioning.'
    WHEN (SELECT rolcanlogin AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolinherit AND NOT rolbypassrls 
          FROM pg_roles WHERE rolname = 'customer_app')
      THEN 'INFO: Role exists with valid least-privilege attributes. Ready for idempotent update.'
    ELSE 'FAIL: Role exists with INVALID attributes! Manual review required before provisioning.'
  END AS role_status;

-- -----------------------------------------------------------------------------
-- CHECK 6: Baseline Row-Level Security (RLS) & FORCE RLS Configuration
-- Notes current RLS state. _prisma_migrations is intentionally omitted from RLS.
-- -----------------------------------------------------------------------------
SELECT 
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS force_rls_enabled,
  CASE 
    WHEN c.relname = '_prisma_migrations' AND NOT c.relrowsecurity AND NOT c.relforcerowsecurity
      THEN 'PASS: Internal migration table (RLS disabled as intended)'
    WHEN c.relname = '_prisma_migrations' AND c.relrowsecurity
      THEN 'WARNING: _prisma_migrations has RLS enabled (should be disabled)'
    WHEN c.relforcerowsecurity = true 
      THEN 'FAIL: FORCE RLS is active! This will block admin queries.'
    WHEN c.relrowsecurity = true 
      THEN 'PASS: RLS enabled (Admin bypass preserved)'
    ELSE 'INFO: RLS disabled (will be enabled during provisioning)'
  END AS rls_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
  AND c.relname IN (
    'Business', 'Category', 'Product', 'ProductGalleryImage',
    'Homepage', 'HomepageFeaturedCategory', 'HomepageSection', 'Media',
    'ProductLike', 'ProductLikeCount', 'WebsiteVisit',
    'User', 'Session', 'Account', 'VerificationToken', 'AuditLog',
    '_prisma_migrations'
  )
ORDER BY c.relname;

-- -----------------------------------------------------------------------------
-- CHECK 7: Sensitive Table Privilege Exposure Audit
-- Identifies any permissions granted to PUBLIC, anon, or authenticated before hardening.
-- -----------------------------------------------------------------------------
SELECT 
  table_name,
  privilege_type,
  grantee,
  'WARNING: Sensitive table accessible before hardening (will be revoked in Step 1)' AS exposure_note
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('User', 'Session', 'Account', 'VerificationToken', 'AuditLog', '_prisma_migrations')
  AND grantee IN ('PUBLIC', 'anon', 'authenticated')
ORDER BY table_name, privilege_type;

-- -----------------------------------------------------------------------------
-- CHECK 8: Schema Creation Privileges Audit
-- Confirms PUBLIC schema creation permissions before baseline hardening.
-- Inspects public schema ACL using aclexplode() with grantee OID 0 for PUBLIC.
-- -----------------------------------------------------------------------------
SELECT 
  n.nspname AS schema_name,
  EXISTS (
    SELECT 1 
    FROM aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner))) acl
    WHERE acl.grantee = 0 AND acl.privilege_type = 'USAGE'
  ) AS public_has_usage,
  EXISTS (
    SELECT 1 
    FROM aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner))) acl
    WHERE acl.grantee = 0 AND acl.privilege_type = 'CREATE'
  ) AS public_has_create,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner))) acl
      WHERE acl.grantee = 0 AND acl.privilege_type = 'CREATE'
    ) THEN 'WARNING: PUBLIC has CREATE on public schema in nspacl (will be revoked in Step 1)'
    ELSE 'PASS: PUBLIC lacks CREATE on public schema in nspacl'
  END AS public_create_status
FROM pg_namespace n
WHERE n.nspname = 'public';

-- -----------------------------------------------------------------------------
-- CHECK 9: Automated Read-Only Diagnostic Summary
-- Aggregates all critical prerequisites into a single clear console report.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_missing_tables TEXT;
  v_missing_enums TEXT;
  v_defective_fks TEXT;
  v_admin_bypass BOOLEAN;
BEGIN
  -- 1. Check all 17 tables
  SELECT string_agg(expected.tbl, ', ') INTO v_missing_tables
  FROM (
    VALUES 
      ('Business'), ('Category'), ('Product'), ('ProductGalleryImage'),
      ('Homepage'), ('HomepageFeaturedCategory'), ('HomepageSection'), ('Media'),
      ('ProductLike'), ('ProductLikeCount'), ('WebsiteVisit'),
      ('User'), ('Session'), ('Account'), ('VerificationToken'), ('AuditLog'),
      ('_prisma_migrations')
  ) AS expected(tbl)
  LEFT JOIN information_schema.tables t ON t.table_schema = 'public' AND t.table_name = expected.tbl
  WHERE t.table_name IS NULL;

  -- 2. Check all 5 enums
  SELECT string_agg(expected.enum_name, ', ') INTO v_missing_enums
  FROM (
    VALUES ('PublishStatus'), ('BadgeType'), ('AvailabilityStatus'), ('MediaType'), ('MediaStatus')
  ) AS expected(enum_name)
  LEFT JOIN (
    SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typtype = 'e'
  ) e ON e.typname = expected.enum_name
  WHERE e.typname IS NULL;

  -- 3. Check all 6 CASCADE foreign keys (dependent table, fk col, referenced table, referenced col, CASCADE)
  SELECT string_agg(expected.dep || '.' || expected.col || ' -> ' || expected.ref_tbl || '.' || expected.ref_col || ' (' || COALESCE(actual.del_rule, 'MISSING') || ')', ', ') INTO v_defective_fks
  FROM (
    VALUES
      ('ProductLike', 'productId', 'Product', 'id', 'CASCADE'),
      ('ProductLikeCount', 'productId', 'Product', 'id', 'CASCADE'),
      ('ProductGalleryImage', 'productId', 'Product', 'id', 'CASCADE'),
      ('ProductGalleryImage', 'mediaId', 'Media', 'id', 'CASCADE'),
      ('HomepageFeaturedCategory', 'homepageId', 'Homepage', 'id', 'CASCADE'),
      ('HomepageFeaturedCategory', 'categoryId', 'Category', 'id', 'CASCADE')
  ) AS expected(dep, col, ref_tbl, ref_col, exp_rule)
  LEFT JOIN (
    SELECT 
      src_cls.relname AS dep,
      src_att.attname AS col,
      ref_cls.relname AS ref_tbl,
      ref_att.attname AS ref_col,
      CASE c.confdeltype 
        WHEN 'c' THEN 'CASCADE' 
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'a' THEN 'NO ACTION'
        ELSE c.confdeltype::text 
      END AS del_rule
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    JOIN pg_class src_cls ON src_cls.oid = c.conrelid
    JOIN pg_class ref_cls ON ref_cls.oid = c.confrelid
    JOIN pg_attribute src_att ON src_att.attrelid = c.conrelid AND src_att.attnum = c.conkey[1]
    JOIN pg_attribute ref_att ON ref_att.attrelid = c.confrelid AND ref_att.attnum = c.confkey[1]
    WHERE n.nspname = 'public' AND c.contype = 'f'
  ) actual 
    ON actual.dep = expected.dep 
    AND actual.col = expected.col
    AND actual.ref_tbl = expected.ref_tbl
    AND actual.ref_col = expected.ref_col
  WHERE actual.del_rule IS DISTINCT FROM expected.exp_rule;

  -- 4. Check admin BYPASSRLS
  SELECT (rolbypassrls = true OR rolsuper = true) INTO v_admin_bypass
  FROM pg_roles WHERE rolname = 'postgres';

  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'STAGING PREFLIGHT DIAGNOSTIC SUMMARY';
  RAISE NOTICE '=======================================================';
  
  IF v_missing_tables IS NOT NULL THEN
    RAISE NOTICE 'FAIL: Missing tables: %', v_missing_tables;
  ELSE
    RAISE NOTICE 'PASS: All 17 required tables exist in public schema.';
  END IF;

  IF v_missing_enums IS NOT NULL THEN
    RAISE NOTICE 'FAIL: Missing public enums: %', v_missing_enums;
  ELSE
    RAISE NOTICE 'PASS: All 5 required enums exist in public schema.';
  END IF;

  IF v_defective_fks IS NOT NULL THEN
    RAISE NOTICE 'FAIL: Foreign key CASCADE issues: %', v_defective_fks;
  ELSE
    RAISE NOTICE 'PASS: All 6 required foreign keys have ON DELETE CASCADE.';
  END IF;

  IF v_admin_bypass IS TRUE THEN
    RAISE NOTICE 'PASS: Role postgres has BYPASSRLS (admin auth is safe).';
  ELSE
    RAISE NOTICE 'FAIL: Role postgres lacks BYPASSRLS! Review admin permissions.';
  END IF;

  IF v_missing_tables IS NULL AND v_missing_enums IS NULL AND v_defective_fks IS NULL AND v_admin_bypass IS TRUE THEN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'PREFLIGHT RESULT: ALL PREREQUISITES VERIFIED (READY)';
    RAISE NOTICE '=======================================================';
  ELSE
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'PREFLIGHT RESULT: PREREQUISITES FAILED (ACTION REQUIRED)';
    RAISE NOTICE '=======================================================';
  END IF;
END $$;
