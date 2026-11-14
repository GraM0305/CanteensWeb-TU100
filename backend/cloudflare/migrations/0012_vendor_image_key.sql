-- Vendor storefront photo. Stores only the object key in the R2 bucket
-- (e.g. "vendors/12.webp"); the API builds the public URL from IMAGE_BASE_URL.
-- NULL means the vendor has no photo yet.

ALTER TABLE vendors ADD COLUMN image_key TEXT;
