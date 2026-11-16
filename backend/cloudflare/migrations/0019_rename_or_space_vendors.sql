-- Rename OR Space vendors to match the photo file names. Matches on canteen_id + old
-- name, so re-running is a no-op. image_key is untouched.

UPDATE vendors SET name = 'ตั๊ก กะเพราถาดยักษ์พลัส' WHERE canteen_id = 8 AND name = 'ตั๊ก กะเพราถาดยักษ์พี่ลัส';
UPDATE vendors SET name = 'ครัวดุสิต' WHERE canteen_id = 8 AND name = 'ครัวจุ๊ต';
UPDATE vendors SET name = 'บ้านมังสวิรัติ' WHERE canteen_id = 8 AND name = 'บ้านมั่งสวิรัติ';
UPDATE vendors SET name = 'ครัวซอฟียะฮ์' WHERE canteen_id = 8 AND name = 'ครัวซอฟียะร์';
UPDATE vendors SET name = 'ราดหน้าเฮียอ้วน ตำนานเยาวราช' WHERE canteen_id = 8 AND name = 'ราดหน้ายิ้วย้วน ตำนานเยาวราช';
UPDATE vendors SET name = 'ก๋วยเตี๋ยวเรือรสดีเลิศ' WHERE canteen_id = 8 AND name = 'ก๋วยเตี๋ยวเรือรสเลิศ';
UPDATE vendors SET name = 'หอมฮงก๋วยเตี๋ยวไก่' WHERE canteen_id = 8 AND name = 'หอมฮงก๋วยเตี๋ยวไก่รสเลิศ';
UPDATE vendors SET name = 'ส่ม-แข่ว' WHERE canteen_id = 8 AND name = 'ส้ม-แข่ว';
UPDATE vendors SET name = 'ปัณณ์อีทเทอรี่' WHERE canteen_id = 8 AND name = 'ปันน์อีทเทอรี่';
