-- ============================================================
-- Migration: Add Unique Constraint on settings.key
-- ============================================================
-- The upsert operations in both saveProfileMetadata (dataSync.ts)
-- and saveSiteSettings (siteSettings.ts) use onConflict: 'key',
-- which requires a unique constraint on the settings.key column.
-- Without it, upsert fails with a conflict error.

-- Idempotent: only adds the constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'settings_key_unique'
      AND conrelid = 'settings'::regclass
  ) THEN
    ALTER TABLE settings ADD CONSTRAINT settings_key_unique UNIQUE (key);
  END IF;
END $$;
