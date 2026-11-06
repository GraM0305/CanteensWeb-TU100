
const express = require("express");
const cors = require("cors");

// Import Routes
const canteenRoutes = require("./routes/canteen.routes");
const vendorRoutes = require("./routes/vendor.routes");

const app = express();

// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());
app.use(express.json());

// =========================================
// HEALTH CHECK
// GET /api/health
// =========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CanteensWeb API is running",
  });
});

// =========================================
// API ROUTES
// =========================================

// Canteens API
app.use("/api/canteens", canteenRoutes);
// Vendors API
app.use("/api/vendors", vendorRoutes);

// =========================================
// 404 NOT FOUND
// =========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Resource not found",
    },
  });
});

// =========================================
// EXPORT APP
// =========================================

module.exports = app;
