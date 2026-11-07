BEGIN;

ALTER TABLE vendors
    ADD COLUMN IF NOT EXISTS starting_price INTEGER
        CHECK (starting_price >= 0),
    ADD COLUMN IF NOT EXISTS source_url TEXT;

ALTER TABLE vendors
    DROP COLUMN IF EXISTS avg_price_level;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vendors_canteen_name
    ON vendors(canteen_id, name);

COMMIT;
