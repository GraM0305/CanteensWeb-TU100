-- Correct vendor names to match the verified storefront photo names, and add
-- the missing JC vendor. Renames match on canteen_id + old name, so re-running
-- them is a no-op.

UPDATE vendors SET name = 'KHAW' WHERE canteen_id = 6 AND name = 'KHAW cafe';
UPDATE vendors SET name = 'ลุงโรจน์หมูแดง' WHERE canteen_id = 6 AND name = 'ลุงโรจน์ หมูแดง';
UPDATE vendors SET name = 'ข้าวขาหมูมาลี สาขา3' WHERE canteen_id = 1 AND name = 'ข้าวขาหมูมาลี สาขา 3';
UPDATE vendors SET name = 'น้องเจี๊ยบ' WHERE canteen_id = 1 AND name = 'น้องเจี๊ยบ ข้าวมันไก่';
UPDATE vendors SET name = 'ออนเซ็น เอ็กเพลส' WHERE canteen_id = 1 AND name = 'ออนเซ็น เอ็กซ์เพลส';
UPDATE vendors SET name = 'My Omelet Style' WHERE canteen_id = 5 AND name = 'Mu Omelet Style';
UPDATE vendors SET name = 'ข้าวหน้าไก่' WHERE canteen_id = 5 AND name = 'ร้านข้าวหน้าไก่';
UPDATE vendors SET name = 'ไดโน่ ปาป้า เอ็กเพลส' WHERE canteen_id = 2 AND name = 'โดโน่ ปังปิ้ง เอ็กเพรส';
UPDATE vendors SET name = 'แจ้งข้าวราดแกง' WHERE canteen_id = 6 AND name = 'แจ๋ว ข้าวราดแกง';
UPDATE vendors SET name = 'จ๊ะเอ๋ครัวไทย' WHERE canteen_id = 1 AND name = 'จ๊ะโอ๋ครัวไทย';
UPDATE vendors SET name = 'ยำยูป้า' WHERE canteen_id = 1 AND name = 'ยำยำ';
UPDATE vendors SET name = 'หมูเบคอนทอดน้ำปลา' WHERE canteen_id = 1 AND name = 'หมูสามชั้นทอดน้ำปลา';
UPDATE vendors SET name = 'อิสลามดาวกะเดือน' WHERE canteen_id = 1 AND name = 'อิสลามเกี๊ยวเดือน';
UPDATE vendors SET name = 'เนปสปาเก็ตตี้' WHERE canteen_id = 5 AND name = 'เนปสปาแกตตี้';

-- New vendor: JC "น้องมุก ข้าวราดแกง" (not halal). starting price is 45 baht;
-- opening_hours is unknown, so it stays NULL (the UI shows "ไม่ระบุ").
INSERT INTO vendors (canteen_id, name, category, is_halal, starting_price)
SELECT 2, 'น้องมุก ข้าวราดแกง', 'ข้าวราดแกง', FALSE, 45
WHERE NOT EXISTS (
    SELECT 1 FROM vendors
    WHERE canteen_id = 2 AND name = 'น้องมุก ข้าวราดแกง'
);
