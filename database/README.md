# Database SQL file guide

The project has SQL for two database setups. Keep each set in its current location and use only the set for the database you are operating.

## Cloudflare D1 (used by the deployed website)

The Worker in `backend/cloudflare/` reads from the D1 database configured in `wrangler.toml`.

- `backend/cloudflare/migrations/0002` through `0010`: ordered, forward-only changes to the D1 schema and data.
- `0003_seed_restaurants.sql`: restaurant import from the earlier Excel file. The user later reported that its restaurant data was inaccurate, so do not treat those records as verified.
- `0006_green_night_vendors.sql`: adds the Green night canteen (`canteen_id = 4`) restaurants.
- `0007_remove_unneeded_green_night_data.sql`: removes the two requested restaurants and their unneeded columns.
- `0010_canonical_vendor_categories.sql`: standardizes vendor category names and replaces the catch-all category with specific categories.
- `0012_vendor_image_key.sql`: adds nullable `vendors.image_key` (object key of the vendor photo).
- `0013_fix_vendor_names_add_nong_muk.sql`: corrects vendor names to match the verified photo names and adds JC "น้องมุก ข้าวราดแกง".
- `0014_vendor_images_jc_engineering.sql`: sets `image_key` for JC and Engineering vendors (photos in `frontend/images/vendors/`).
- `0015_vendor_images_sc.sql`: sets `image_key` for the SC vendors that have photos.

Before applying D1 migrations, inspect the remote migration list and confirm that it agrees with the existing database state. Do not apply a list of historical migrations to a database that already contains their changes but has no corresponding migration records; reconcile the migration history first. When the history is consistent, apply migrations and deploy the Worker from `backend/cloudflare/`:

```powershell
npx wrangler d1 migrations list canteensweb-tu --remote
npx wrangler d1 migrations apply canteensweb-tu --remote
npx wrangler deploy
```

Wrangler records applied migrations in D1. Do not rename, reorder, edit, or delete an applied migration; make a new numbered migration for later changes.

## PostgreSQL (alternative/local setup)

- `schema.sql`: creates the canteen and vendor tables and indexes.
- `migrations/002` through `migrations/006`: subsequent PostgreSQL schema/data changes.
- `migrations/006_canonical_vendor_categories.sql`: standardizes existing vendor categories.
- `migrations/008_vendor_image_key.sql`: adds nullable `vendors.image_key`.
- `migrations/009_fix_vendor_names_add_nong_muk.sql`, `migrations/010_vendor_images_jc_engineering.sql`: PostgreSQL equivalents of D1 0013 / 0014.
- `migrations/011_vendor_images_sc.sql`: PostgreSQL equivalent of D1 0015.
- `seed_data.sql`: initial canteen and vendor data. The older sample restaurant records have been reported as inaccurate; verify or replace them before using this seed in a real environment. The Green night entries came from the later user-provided workbook.

For a new PostgreSQL database, apply `schema.sql`, then the migrations in ascending numeric order, then `seed_data.sql` only after verifying its restaurant records. For an existing database, apply only migrations that have not already run; do not recreate tables with `schema.sql`.

These PostgreSQL files are separate from the deployed D1 migrations. Do not run PostgreSQL scripts against D1 or D1 migrations against PostgreSQL.
