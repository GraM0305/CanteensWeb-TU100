
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const ca = fs.readFileSync(
  path.join(__dirname, "../../certs/us-east-1-bundle.pem"),
  "utf8"
);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    ca,
    rejectUnauthorized: true,
  },
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

module.exports = pool;

