
const express = require("express");
const pool = require("../config/db");
const { withImageUrl } = require("../config/image");

const router = express.Router();

// =========================================
// GET /api/canteens
// Get all canteens or search by name
// =========================================

router.get("/", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    if (search.length > 100) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Search query is too long",
        },
      });
    }

    const values = [];

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

    if (search) {
      values.push(`%${search}%`);
      sql += ` WHERE name ILIKE $1`;
    }

    sql += ` ORDER BY id ASC`;

    const result = await pool.query(sql, values);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get canteens error:", error.message);

    return res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
      },
    });
  }
});


// =========================================
// GET /api/canteens/:id/vendors
// Get vendors in a specific canteen
// =========================================

router.get("/:id/vendors", async (req, res) => {
  try {
    const canteenId = Number(req.params.id);

    if (!Number.isSafeInteger(canteenId) || canteenId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid canteen ID",
        },
      });
    }

    const canteen = await pool.query(
      "SELECT id FROM canteens WHERE id = $1",
      [canteenId]
    );

    if (canteen.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Canteen not found",
        },
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          canteen_id,
          name,
          category,
          is_halal,
          opening_hours,
          starting_price,
          image_key,
          created_at
        FROM vendors
        WHERE canteen_id = $1
        ORDER BY id ASC
      `,
      [canteenId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows.map(withImageUrl),
    });
  } catch (error) {
    console.error("Get canteen vendors error:", error.message);

    return res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
      },
    });
  }
});


// =========================================
// GET /api/canteens/:id
// Get canteen details
// =========================================

router.get("/:id", async (req, res) => {
  try {
    const canteenId = Number(req.params.id);

    if (!Number.isSafeInteger(canteenId) || canteenId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid canteen ID",
        },
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          name,
          operating_period,
          latitude,
          longitude,
          description,
          created_at
        FROM canteens
        WHERE id = $1
      `,
      [canteenId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Canteen not found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get canteen error:", error.message);

    return res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
      },
    });
  }
});

module.exports = router;
