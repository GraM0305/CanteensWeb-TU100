
const express = require("express");
const pool = require("../config/db");
const { withImageUrl } = require("../config/image");

const router = express.Router();

// =========================================
// GET /api/vendors
// Get all vendors with optional filters
//
// Query Parameters:
// canteenId = Filter by canteen
// category  = Filter by food category
// halal     = true, false, or unknown
// =========================================

router.get("/", async (req, res) => {
  try {
    const { canteenId, category, halal } = req.query;

    const conditions = [];
    const values = [];

    // Filter by canteen ID
    if (canteenId !== undefined) {
      const id = Number(canteenId);

      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid canteen ID",
          },
        });
      }

      values.push(id);
      conditions.push(`v.canteen_id = $${values.length}`);
    }

    // Filter by food category
    if (category !== undefined) {
      if (
        typeof category !== "string" ||
        !category.trim() ||
        category.length > 50
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid food category",
          },
        });
      }

      values.push(category.trim());
      conditions.push(`v.category = $${values.length}`);
    }

    // Filter by halal status
    if (halal !== undefined) {
      if (typeof halal !== "string") {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid halal status",
          },
        });
      }

      const halalValue = halal.toLowerCase();

      if (halalValue === "true") {
        conditions.push("v.is_halal = TRUE");
      } else if (halalValue === "false") {
        conditions.push("v.is_halal = FALSE");
      } else if (halalValue === "unknown") {
        conditions.push("v.is_halal IS NULL");
      } else {
        return res.status(400).json({
          success: false,
          error: {
            message: "Halal must be true, false, or unknown",
          },
        });
      }
    }

    // Build SQL query
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
        v.image_key,
        v.created_at
      FROM vendors v
      INNER JOIN canteens c
        ON v.canteen_id = c.id
    `;

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY v.id ASC`;

    const result = await pool.query(sql, values);

    return res.status(200).json({
      success: true,
      data: result.rows.map(withImageUrl),
    });
  } catch (error) {
    console.error("Get vendors error:", error.message);

    return res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
      },
    });
  }
});


// =========================================
// GET /api/vendors/:id
// Get vendor details
// =========================================

router.get("/:id", async (req, res) => {
  try {
    const vendorId = Number(req.params.id);

    if (!Number.isSafeInteger(vendorId) || vendorId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid vendor ID",
        },
      });
    }

    const result = await pool.query(
      `
        SELECT
          v.id,
          v.canteen_id,
          c.name AS canteen_name,
          v.name,
          v.category,
          v.is_halal,
          v.opening_hours,
          v.starting_price,
          v.image_key,
          v.created_at
        FROM vendors v
        INNER JOIN canteens c
          ON v.canteen_id = c.id
        WHERE v.id = $1
      `,
      [vendorId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Vendor not found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: withImageUrl(result.rows[0]),
    });
  } catch (error) {
    console.error("Get vendor error:", error.message);

    return res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
      },
    });
  }
});

module.exports = router;
