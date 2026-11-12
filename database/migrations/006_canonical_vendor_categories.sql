UPDATE vendors
SET category = 'ก๋วยเตี๋ยว/อาหารเส้น'
WHERE category IN ('ก๋วยเตี๋ยว', 'ก๋วยเตี๋ยว / เส้น');

UPDATE vendors
SET category = 'ข้าวมันไก่/ข้าวหมู'
WHERE category IN ('ข้าวมันไก่', 'ข้าวมันไก่ / ข้าวหมู');

UPDATE vendors
SET category = 'อาหารอีสาน/ส้มตำ'
WHERE category IN ('อาหารอีสาน', 'อาหารอีสาน / ส้มตำ');

UPDATE vendors
SET category = 'โจ๊ก/ข้าวต้ม'
WHERE category = 'โจ๊ก / ข้าวต้ม';

UPDATE vendors
SET category = 'อาหารจานเดียว'
WHERE category IN (
    'ข้าวไข่เจียว / ข้าวไข่ข้น',
    'ผัดไท / หอยทอด / ราดหน้า'
);

UPDATE vendors
SET category = 'ชาบู/หม้อไฟ'
WHERE category = 'ชาบู / ชาบูเสียบไม้';

UPDATE vendors
SET category = 'ของทอด/ของกินเล่น'
WHERE category IN ('ไก่ทอด', 'ลูกชิ้นทอด');

UPDATE vendors
SET category = 'ปิ้งย่าง/หม่าล่า'
WHERE category IN ('หมูปิ้ง', 'ไก่หม่าล่า / หม่าล่า');

UPDATE vendors
SET category = 'อาหารจานเดียว'
WHERE canteen_id = 1
  AND name = 'จ๊ะโอ๋ครัวไทย'
  AND category IN ('โจ๊ก ยำ และอื่นๆ', 'โจ๊ก ยำ และอื่น ๆ');

UPDATE vendors
SET category = 'ยำ/อาหารแซ่บ'
WHERE canteen_id = 1
  AND name = 'ยำยำ'
  AND category IN ('โจ๊ก ยำ และอื่นๆ', 'โจ๊ก ยำ และอื่น ๆ');

UPDATE vendors
SET category = 'โจ๊ก/ข้าวต้ม'
WHERE (
    (canteen_id = 5 AND name = 'โจ๊กทิวสน')
    OR (canteen_id = 8 AND name = 'ข้าวต้มปลามหาชัย')
)
  AND category IN ('โจ๊ก ยำ และอื่นๆ', 'โจ๊ก ยำ และอื่น ๆ');

UPDATE vendors
SET category = 'อาหารอีสาน/ส้มตำ'
WHERE canteen_id = 8
  AND name = 'ส้ม-แข่ว'
  AND category IN ('โจ๊ก ยำ และอื่นๆ', 'โจ๊ก ยำ และอื่น ๆ');
