import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The Worker is an ES module inside a CommonJS package, so load it from
// its source text instead of importing the .js file directly.
const source = readFileSync(new URL("./index.js", import.meta.url), "utf8");
const worker = (
  await import(
    "data:text/javascript;base64," + Buffer.from(source).toString("base64")
  )
).default;

// Minimal fake of the D1 binding: records SQL/params, returns fixed rows.
function fakeDb(rows = [{ id: 1, name: "Test canteen" }]) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      return {
        bind(...params) {
          calls.push({ sql, params });
          return {
            all: async () => ({ results: rows }),
            first: async () => rows[0] ?? null,
          };
        },
      };
    },
  };
}

const call = (path, env, method = "GET") =>
  worker.fetch(new Request(`https://example.test${path}`, { method }), env);

test("health returns success", async () => {
  const res = await call("/api/health", { DB: fakeDb() });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).success, true);
});

test("successful responses are cacheable for 5 minutes", async () => {
  const res = await call("/api/health", { DB: fakeDb() });
  assert.equal(res.headers.get("Cache-Control"), "public, max-age=300");
});

test("error responses are not cached", async () => {
  const res = await call("/api/nope", { DB: fakeDb() });
  assert.equal(res.status, 404);
  assert.equal(res.headers.get("Cache-Control"), null);
});

test("canteens list returns data", async () => {
  const res = await call("/api/canteens", { DB: fakeDb() });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(Array.isArray(body.data), true);
});

test("search longer than 100 chars is rejected with 400", async () => {
  const db = fakeDb();
  const res = await call(`/api/canteens?search=${"a".repeat(101)}`, { DB: db });
  assert.equal(res.status, 400);
  assert.equal(db.calls.length, 0);
});

test("search of exactly 100 chars is accepted", async () => {
  const res = await call(`/api/canteens?search=${"a".repeat(100)}`, {
    DB: fakeDb(),
  });
  assert.equal(res.status, 200);
});

test("search is passed as a bound parameter, not inlined in SQL", async () => {
  const db = fakeDb();
  const evil = "x' OR '1'='1";
  await call(`/api/canteens?search=${encodeURIComponent(evil)}`, { DB: db });
  assert.equal(db.calls[0].params[0], evil);
  assert.equal(db.calls[0].sql.includes(evil), false);
});

test("invalid canteen id returns 400", async () => {
  const res = await call("/api/canteens/abc", { DB: fakeDb() });
  assert.equal(res.status, 400);
});

test("invalid halal filter returns 400", async () => {
  const res = await call("/api/vendors?halal=maybe", { DB: fakeDb() });
  assert.equal(res.status, 400);
});

test("non-GET methods are rejected with 405", async () => {
  const res = await call("/api/canteens", { DB: fakeDb() }, "POST");
  assert.equal(res.status, 405);
});

const vendorRow = (overrides = {}) => ({
  id: 1,
  canteen_id: 1,
  name: "Test vendor",
  category: "ข้าวราดแกง",
  is_halal: 1,
  opening_hours: null,
  starting_price: 40,
  image_key: "vendors/12.webp",
  created_at: "2026-01-01",
  ...overrides,
});

test("vendor with image_key gets an image_url and no image_key", async () => {
  const env = {
    DB: fakeDb([vendorRow()]),
    IMAGE_BASE_URL: "https://img.example.test/",
  };
  const body = await (await call("/api/vendors/1", env)).json();
  assert.equal(body.data.image_url, "https://img.example.test/vendors/12.webp");
  assert.equal("image_key" in body.data, false);
  assert.equal(body.data.is_halal, true);
});

test("image_url is null when vendor has no photo", async () => {
  const env = {
    DB: fakeDb([vendorRow({ image_key: null })]),
    IMAGE_BASE_URL: "https://img.example.test",
  };
  const body = await (await call("/api/canteens/1/vendors", env)).json();
  assert.equal(body.data[0].image_url, null);
});

test("image_url is null when IMAGE_BASE_URL is not configured", async () => {
  const env = { DB: fakeDb([vendorRow()]) };
  const body = await (await call("/api/vendors", env)).json();
  assert.equal(body.data[0].image_url, null);
});

test("image key path segments are URL-encoded", async () => {
  const env = {
    DB: fakeDb([vendorRow({ image_key: "vendors/a b#1.webp" })]),
    IMAGE_BASE_URL: "https://img.example.test",
  };
  const body = await (await call("/api/vendors/1", env)).json();
  assert.equal(
    body.data.image_url,
    "https://img.example.test/vendors/a%20b%231.webp"
  );
});
