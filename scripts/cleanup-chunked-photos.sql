-- ============================================================
-- Cleanup: Remove Old Chunked Photo Data
-- ============================================================
-- 
-- The old `saveProfileMetadata` function split base64 photos into
-- 200-char chunks stored as multiple rows like:
--   digital_profile:{userId}:uploaded_photo:0
--   digital_profile:{userId}:uploaded_photo:1
--   digital_profile:{userId}:uploaded_photo:count
--
-- The new format stores the entire photo as a single row:
--   digital_profile:{userId}:uploaded_photo
--
-- This script removes all stale chunked rows while preserving
-- the new single-row format and all other settings data.
--
-- -----------------------------------------------------------
-- HOW TO RUN:
--   1. Go to https://supabase.com/dashboard > your project
--   2. Open the "SQL Editor"
--   3. Paste this entire file
--   4. Click "Run"
-- -----------------------------------------------------------

-- Preview: Count how many chunked rows will be deleted
--   (LIKE pattern matches :0, :1, :count suffixes but NOT the bare field key)
SELECT COUNT(*) AS chunked_rows_to_cleanup
FROM settings
WHERE key LIKE 'digital_profile:%:uploaded_photo:%';

-- Delete: Remove all chunked photo rows (e.g. :0, :1, :count)
DELETE FROM settings
WHERE key LIKE 'digital_profile:%:uploaded_photo:%';

-- Summary: Confirm what remains for digital profile photos
SELECT key, LENGTH(value) AS value_bytes,
       LEFT(value, 50) AS value_preview
FROM settings
WHERE key LIKE 'digital_profile:%:uploaded_photo'
ORDER BY key;
