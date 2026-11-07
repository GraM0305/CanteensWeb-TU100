
"use strict";

// =========================================
// TU Canteen Finder - Cloudflare Worker
// Database: Cloudflare D1
// Binding: DB
// =========================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function errorResponse(message, status) {
  return jsonResponse({
    success: false,
    error: { message },
  }, status);
}

function normalizeVendor(vendor) {
  return {
    ...vendor,
    is_halal:
      vendor.is_halal === null
        ? null
        : Boolean(vendor.is_halal),
  };
}

function normalizeVendors(vendors) {
  return vendors.map(normalizeVendor);
}

function isValidId(id) {
  return Number.isSafeInteger(id) && id > 0;
}

async function handleRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== "GET") {
    return errorResponse("Method not allowed", 405);
  }

  if (!env.DB) {
    console.error("D1 binding DB is missing");
    return errorResponse("Internal server error", 500);
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  try {
    // =========================================
    // GET /api/health
    // =========================================

    if (path === "/api/health") {
      return jsonResponse({
        success: true,
        message: "CanteensWeb API is running",
      });
    }

    // =========================================
    // GET /api/canteens
    // =========================================

    if (path === "/api/canteens") {
      const search = (url.searchParams.get("search") || "").trim();

      let sql = `
        SELECT
          id,
          name,
          operating_period,
          latitude,
          longitude,
          description,
          created_at
        FROM canteens
      `;

      const values = [];

      if (search) {
        sql += ` WHERE instr(name, ?) > 0`;
        values.push(search);
      }

      sql += ` ORDER BY id ASC`;

      const result = await env.DB
        .prepare(sql)
        .bind(...values)
        .all();

      return jsonResponse({
        success: true,
        data: result.results,
      });
    }

    // =========================================
    // GET /api/canteens/:id/vendors
    // =========================================

    let match = path.match(/^\/api\/canteens\/([^/]+)\/vendors$/);

    if (match) {
      const canteenId = Number(match[1]);

      if (!isValidId(canteenId)) {
        return errorResponse("Invalid canteen ID", 400);
      }

      const canteen = await env.DB
        .prepare("SELECT id FROM canteens WHERE id = ?")
        .bind(canteenId)
        .first();

      if (!canteen) {
        return errorResponse("Canteen not found", 404);
      }

      const result = await env.DB
        .prepare(`
          SELECT
            id,
            canteen_id,
            name,
            category,
            is_halal,
            opening_hours,
            starting_price,
            source_url,
            created_at
          FROM vendors
          WHERE canteen_id = ?
          ORDER BY id ASC
        `)
        .bind(canteenId)
        .all();

      return jsonResponse({
        success: true,
        data: normalizeVendors(result.results),
      });
    }

    // =========================================
    // GET /api/canteens/:id
    // =========================================

    match = path.match(/^\/api\/canteens\/([^/]+)$/);

    if (match) {
      const canteenId = Number(match[1]);

      if (!isValidId(canteenId)) {
        return errorResponse("Invalid canteen ID", 400);
      }

      const canteen = await env.DB
        .prepare(`
          SELECT
            id,
            name,
            operating_period,
            latitude,
            longitude,
            description,
            created_at
          FROM canteens
          WHERE id = ?
        `)
        .bind(canteenId)
        .first();

      if (!canteen) {
        return errorResponse("Canteen not found", 404);
      }

      return jsonResponse({
        success: true,
        data: canteen,
      });
    }

    // =========================================
    // GET /api/vendors
    // =========================================

    if (path === "/api/vendors") {
      const canteenId = url.searchParams.get("canteenId");
      const category = url.searchParams.get("category");
      const halal = url.searchParams.get("halal");

      const conditions = [];
      const values = [];

      if (canteenId !== null) {
        const id = Number(canteenId);

        if (!isValidId(id)) {
          return errorResponse("Invalid canteen ID", 400);
        }

        conditions.push("v.canteen_id = ?");
        values.push(id);
      }

      if (category !== null) {
        if (!category.trim() || category.length > 50) {
          return errorResponse("Invalid food category", 400);
        }

        conditions.push("v.category = ?");
        values.push(category.trim());
      }

      if (halal !== null) {
        const halalValue = halal.toLowerCase();

        if (halalValue === "true") {
          conditions.push("v.is_halal = 1");
        } else if (halalValue === "false") {
          conditions.push("v.is_halal = 0");
        } else if (halalValue === "unknown") {
          conditions.push("v.is_halal IS NULL");
        } else {
          return errorResponse(
            "Halal must be true, false, or unknown",
            400
          );
        }
      }

      let sql = `
        SELECT
          v.id,
          v.canteen_id,
          c.name AS canteen_name,
          v.name,
          v.category,
          v.is_halal,
          v.opening_hours,
          v.starting_price,
          v.source_url,
          v.created_at
        FROM vendors v
        INNER JOIN canteens c
          ON v.canteen_id = c.id
      `;

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
      }

      sql += ` ORDER BY v.id ASC`;

      const result = await env.DB
        .prepare(sql)
        .bind(...values)
        .all();

      return jsonResponse({
        success: true,
        data: normalizeVendors(result.results),
      });
    }

    // =========================================
    // GET /api/vendors/:id
    // =========================================

    match = path.match(/^\/api\/vendors\/([^/]+)$/);

    if (match) {
      const vendorId = Number(match[1]);

      if (!isValidId(vendorId)) {
        return errorResponse("Invalid vendor ID", 400);
      }

      const vendor = await env.DB
        .prepare(`
          SELECT
            v.id,
            v.canteen_id,
            c.name AS canteen_name,
            v.name,
            v.category,
            v.is_halal,
            v.opening_hours,
            v.starting_price,
            v.source_url,
            v.created_at
          FROM vendors v
          INNER JOIN canteens c
            ON v.canteen_id = c.id
          WHERE v.id = ?
        `)
        .bind(vendorId)
        .first();

      if (!vendor) {
        return errorResponse("Vendor not found", 404);
      }

      return jsonResponse({
        success: true,
        data: normalizeVendor(vendor),
      });
    }

    return errorResponse("Resource not found", 404);

  } catch (error) {
    console.error("Cloudflare Worker error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },
};
