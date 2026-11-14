-- Rename two SC vendors. Matches on canteen_id + old name, so re-running is a no-op.
-- image_key is untouched, so existing photos stay attached.

UPDATE vendors SET name = 'ออนเซ็น เอ็กซ์เพลส' WHERE canteen_id = 1 AND name = 'ออนเซ็น เอ็กเพลส';
UPDATE vendors SET name = 'ก๋วยเตี๋ยวบุ๊คเบ๊บ' WHERE canteen_id = 1 AND name = 'ก๋วยเตี๋ยวบุ๊คเบบ';
