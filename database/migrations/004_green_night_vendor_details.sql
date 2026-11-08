-- Extra vendor attributes present in the Green night restaurant workbook.
ALTER TABLE vendors
    ADD COLUMN IF NOT EXISTS food_group TEXT,
    ADD COLUMN IF NOT EXISTS menu_highlights TEXT,
    ADD COLUMN IF NOT EXISTS contact_info TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT;
