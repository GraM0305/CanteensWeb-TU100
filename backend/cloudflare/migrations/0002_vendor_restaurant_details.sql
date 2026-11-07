ALTER TABLE vendors
    ADD COLUMN starting_price INTEGER CHECK (starting_price >= 0);

ALTER TABLE vendors
    ADD COLUMN source_url TEXT;

CREATE UNIQUE INDEX idx_vendors_canteen_name
    ON vendors(canteen_id, name);
