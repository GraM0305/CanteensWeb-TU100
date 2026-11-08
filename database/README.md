# Database SQL file guide

The project has SQL for two database setups. Keep each set in its current location and use only the set for the database you are operating.

## Cloudflare D1 (used by the deployed website)

The Worker in `backend/cloudflare/` reads from the D1 database configured in `wrangler.toml`.

- `backend/cloudflare/migrations/0002` through `0007`: ordered, forward-only changes to the D1 schema and data.
- `0003_seed_restaurants.sql`: restaurant import from the earlier Excel file. The user later reported that its restaurant data was inaccurate, so do not treat those records as verified.
- `0006_green_night_vendors.sql`: adds the Green night canteen (`canteen_id = 4`) restaurants.
- `0007_remove_unneeded_green_night_data.sql`: removes the two requested restaurants and their unneeded columns.

Apply pending D1 migrations and deploy the Worker from `backend/cloudflare/`:

```powershell
npx wrangler d1 migrations list canteensweb-tu --remote
npx wrangler d1 migrations apply canteensweb-tu --remote
npx wrangler deploy
```

Wrangler records applied migrations in D1. Do not rename, reorder, edit, or delete an applied migration; make a new numbered migration for later changes.

## PostgreSQL (alternative/local setup)

- `schema.sql`: creates the canteen and vendor tables and indexes.
- `migrations/002` through `migrations/005`: subsequent PostgreSQL schema/data changes.
- `seed_data.sql`: initial canteen and vendor data. The older sample restaurant records have been reported as inaccurate; verify or replace them before using this seed in a real environment. The Green night entries came from the later user-provided workbook.

For a new PostgreSQL database, apply `schema.sql`, then the migrations in ascending numeric order, then `seed_data.sql` only after verifying its restaurant records. For an existing database, apply only migrations that have not already run; do not recreate tables with `schema.sql`.

These PostgreSQL files are separate from the deployed D1 migrations. Do not run PostgreSQL scripts against D1 or D1 migrations against PostgreSQL.
