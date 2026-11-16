-- Vendor photos for the OR Space canteen (files in frontend/images/vendors/, served by
-- Cloudflare Pages). Keys are "<D1 vendor id>-v1.webp". Rows are matched by
-- canteen_id + current vendor name (run the rename migration first).

UPDATE vendors SET image_key = 'vendors/13-v1.webp' WHERE canteen_id = 8 AND name = 'ข.ขอไข่ ไข่เจียว';
UPDATE vendors SET image_key = 'vendors/14-v1.webp' WHERE canteen_id = 8 AND name = 'บ้านข้าวแกง';
UPDATE vendors SET image_key = 'vendors/15-v1.webp' WHERE canteen_id = 8 AND name = 'ข้าวมันไก่สี่สหาย';
UPDATE vendors SET image_key = 'vendors/16-v1.webp' WHERE canteen_id = 8 AND name = 'ข้าวขาหมูตรอกซุง';
UPDATE vendors SET image_key = 'vendors/17-v1.webp' WHERE canteen_id = 8 AND name = 'ข้าวแกงแม่นวมดอนหวาย';
UPDATE vendors SET image_key = 'vendors/18-v1.webp' WHERE canteen_id = 8 AND name = 'ตั๊ก กะเพราถาดยักษ์พลัส';
UPDATE vendors SET image_key = 'vendors/19-v1.webp' WHERE canteen_id = 8 AND name = 'ครัวดุสิต';
UPDATE vendors SET image_key = 'vendors/20-v1.webp' WHERE canteen_id = 8 AND name = 'บ้านมังสวิรัติ';
UPDATE vendors SET image_key = 'vendors/21-v1.webp' WHERE canteen_id = 8 AND name = 'ครัวซอฟียะฮ์';
UPDATE vendors SET image_key = 'vendors/22-v1.webp' WHERE canteen_id = 8 AND name = 'ข้าวต้มปลามหาชัย';
UPDATE vendors SET image_key = 'vendors/23-v1.webp' WHERE canteen_id = 8 AND name = 'หมูโอชา';
UPDATE vendors SET image_key = 'vendors/24-v1.webp' WHERE canteen_id = 8 AND name = 'ก๋วยเตี๋ยวต้มยำทองสมบูรณ์';
UPDATE vendors SET image_key = 'vendors/25-v1.webp' WHERE canteen_id = 8 AND name = 'ราดหน้าเฮียอ้วน ตำนานเยาวราช';
UPDATE vendors SET image_key = 'vendors/26-v1.webp' WHERE canteen_id = 8 AND name = 'SC ก๋วยเตี๋ยว ข้าวซอย';
UPDATE vendors SET image_key = 'vendors/27-v1.webp' WHERE canteen_id = 8 AND name = 'ก๋วยเตี๋ยวเรือรสดีเลิศ';
UPDATE vendors SET image_key = 'vendors/28-v1.webp' WHERE canteen_id = 8 AND name = 'หอมฮงก๋วยเตี๋ยวไก่';
UPDATE vendors SET image_key = 'vendors/29-v1.webp' WHERE canteen_id = 8 AND name = 'ส่ม-แข่ว';
UPDATE vendors SET image_key = 'vendors/30-v1.webp' WHERE canteen_id = 8 AND name = 'ปัณณ์อีทเทอรี่';
