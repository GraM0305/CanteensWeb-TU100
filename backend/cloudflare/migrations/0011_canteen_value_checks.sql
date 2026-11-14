-- Validation for canteens.operating_period / latitude / longitude.
-- SQLite (D1) cannot add CHECK constraints to an existing table without
-- rebuilding it, so this uses triggers instead. Existing rows are not
-- touched or re-validated; only future INSERTs/UPDATEs are checked.

CREATE TRIGGER canteens_validate_insert
BEFORE INSERT ON canteens
FOR EACH ROW
WHEN (NEW.operating_period IS NOT NULL AND NEW.operating_period NOT IN ('DAY', 'NIGHT'))
  OR NEW.latitude < -90 OR NEW.latitude > 90
  OR NEW.longitude < -180 OR NEW.longitude > 180
BEGIN
    SELECT RAISE(ABORT, 'Invalid canteen: operating_period must be DAY or NIGHT, latitude -90..90, longitude -180..180');
END;

CREATE TRIGGER canteens_validate_update
BEFORE UPDATE OF operating_period, latitude, longitude ON canteens
FOR EACH ROW
WHEN (NEW.operating_period IS NOT NULL AND NEW.operating_period NOT IN ('DAY', 'NIGHT'))
  OR NEW.latitude < -90 OR NEW.latitude > 90
  OR NEW.longitude < -180 OR NEW.longitude > 180
BEGIN
    SELECT RAISE(ABORT, 'Invalid canteen: operating_period must be DAY or NIGHT, latitude -90..90, longitude -180..180');
END;
