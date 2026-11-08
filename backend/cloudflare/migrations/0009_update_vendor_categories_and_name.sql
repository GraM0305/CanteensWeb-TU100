UPDATE vendors
SET category = 'อาหารอีสาน'
WHERE canteen_id = 3
  AND name = 'ส้มตำ บ้านนา';

UPDATE vendors
SET category = 'อาหารจานเดียว'
WHERE canteen_id = 3
  AND name = 'ข้าวคลุกน้ำพริกทรงเครื่อง';

UPDATE vendors
SET category = 'โจ๊ก ยำ และอื่นๆ'
WHERE canteen_id = 1
  AND name = 'จ๊ะโอ๋ครัวไทย';

UPDATE vendors
SET category = 'อาหารจานเดียว'
WHERE name = 'My Omelet Style'
  AND canteen_id IN (2, 3);

UPDATE vendors
SET name = 'ข้าวขาหมู & กะเพราหมู ข้าวหมูแดง ข้าวหมูกรอบ'
WHERE canteen_id = 5
  AND name = 'ข้าวขาหมู & กระเพราหมู ข้าวหมูแดง ข้าวหมูกรอบ';
