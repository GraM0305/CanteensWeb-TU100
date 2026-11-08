BEGIN;

DELETE FROM vendors
WHERE canteen_id = 4
  AND name IN ('ร้านน้ำปั่น', 'โรตีชัด ชาใต้');

ALTER TABLE vendors
    DROP COLUMN IF EXISTS food_group,
    DROP COLUMN IF EXISTS menu_highlights,
    DROP COLUMN IF EXISTS contact_info,
    DROP COLUMN IF EXISTS notes;

COMMIT;
