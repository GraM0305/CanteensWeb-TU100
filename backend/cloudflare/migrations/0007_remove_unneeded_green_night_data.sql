DELETE FROM vendors
WHERE canteen_id = 4
  AND name IN ('ร้านน้ำปั่น', 'โรตีชัด ชาใต้');

ALTER TABLE vendors DROP COLUMN food_group;
ALTER TABLE vendors DROP COLUMN menu_highlights;
ALTER TABLE vendors DROP COLUMN contact_info;
ALTER TABLE vendors DROP COLUMN notes;
