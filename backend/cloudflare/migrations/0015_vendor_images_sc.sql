-- Vendor photos for the SC canteen (files in frontend/images/vendors/, served by
-- Cloudflare Pages). Keys are "<D1 vendor id>-v1.webp". Rows are matched by
-- canteen_id + current vendor name.

UPDATE vendors SET image_key = 'vendors/35-v1.webp' WHERE canteen_id = 1 AND name = 'ข้าวขาหมูมาลี สาขา3';
UPDATE vendors SET image_key = 'vendors/32-v1.webp' WHERE canteen_id = 1 AND name = 'ข้าวแกงแม่อ้อยคำ';
UPDATE vendors SET image_key = 'vendors/37-v1.webp' WHERE canteen_id = 1 AND name = 'ครัวอัมพวา';
UPDATE vendors SET image_key = 'vendors/44-v1.webp' WHERE canteen_id = 1 AND name = 'ครัวใจดี ข้าวราด Fusion';
UPDATE vendors SET image_key = 'vendors/38-v1.webp' WHERE canteen_id = 1 AND name = 'จ๊ะเอ๋ครัวไทย';
UPDATE vendors SET image_key = 'vendors/31-v1.webp' WHERE canteen_id = 1 AND name = 'นิติกาญจน์ อาหารตามสั่ง';
UPDATE vendors SET image_key = 'vendors/33-v1.webp' WHERE canteen_id = 1 AND name = 'น้องเจี๊ยบ';
UPDATE vendors SET image_key = 'vendors/42-v1.webp' WHERE canteen_id = 1 AND name = 'ยำยูป้า';
UPDATE vendors SET image_key = 'vendors/40-v1.webp' WHERE canteen_id = 1 AND name = 'สมใจกินเส้น';
UPDATE vendors SET image_key = 'vendors/36-v1.webp' WHERE canteen_id = 1 AND name = 'หมูเบคอนทอดน้ำปลา';
UPDATE vendors SET image_key = 'vendors/46-v1.webp' WHERE canteen_id = 1 AND name = 'ออนเซ็น เอ็กเพลส';
UPDATE vendors SET image_key = 'vendors/41-v1.webp' WHERE canteen_id = 1 AND name = 'อิสลามดาวกะเดือน';
UPDATE vendors SET image_key = 'vendors/45-v1.webp' WHERE canteen_id = 1 AND name = 'ฮอทซุป';
