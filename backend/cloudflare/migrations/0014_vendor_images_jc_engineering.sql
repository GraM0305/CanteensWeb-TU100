-- Vendor photos for JC and Engineering (files live in frontend/images/vendors/
-- and are served by Cloudflare Pages). Keys are "<D1 vendor id>-v1.webp";
-- bump the version suffix when a photo is replaced so caches refresh.
-- Run after the vendor-name migration (rows are matched by corrected name).

UPDATE vendors SET image_key = 'vendors/78-v1.webp' WHERE canteen_id = 2 AND name = 'ข้าวมันไก่ป้ายแดง';
UPDATE vendors SET image_key = 'vendors/79-v1.webp' WHERE canteen_id = 2 AND name = 'พูนทรัพย์ ก๋วยเตี๋ยว';
UPDATE vendors SET image_key = 'vendors/80-v1.webp' WHERE canteen_id = 2 AND name = 'ไดโน่ ปาป้า เอ็กเพลส';
UPDATE vendors SET image_key = 'vendors/81-v1.webp' WHERE canteen_id = 2 AND name = 'My Omelet Style';
UPDATE vendors SET image_key = 'vendors/115-v1.webp' WHERE canteen_id = 2 AND name = 'น้องมุก ข้าวราดแกง';
UPDATE vendors SET image_key = 'vendors/66-v1.webp' WHERE canteen_id = 6 AND name = 'KHAW';
UPDATE vendors SET image_key = 'vendors/60-v1.webp' WHERE canteen_id = 6 AND name = 'ลุงโรจน์หมูแดง';
UPDATE vendors SET image_key = 'vendors/61-v1.webp' WHERE canteen_id = 6 AND name = 'อรรถรส';
UPDATE vendors SET image_key = 'vendors/63-v1.webp' WHERE canteen_id = 6 AND name = 'แจ้งข้าวราดแกง';
UPDATE vendors SET image_key = 'vendors/64-v1.webp' WHERE canteen_id = 6 AND name = 'ครัวหนึ่ง';
