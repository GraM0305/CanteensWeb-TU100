-- Validation for canteens.operating_period / latitude / longitude.
-- Fails (and changes nothing) if existing rows already violate a rule;
-- fix those rows first, then re-run.

ALTER TABLE canteens
    ADD CONSTRAINT canteens_operating_period_check
    CHECK (operating_period IN ('DAY', 'NIGHT'));

ALTER TABLE canteens
    ADD CONSTRAINT canteens_latitude_check
    CHECK (latitude BETWEEN -90 AND 90);

ALTER TABLE canteens
    ADD CONSTRAINT canteens_longitude_check
    CHECK (longitude BETWEEN -180 AND 180);
