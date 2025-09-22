const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { Pool } = require("pg");
const fs = require("fs");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// --- PostgreSQL setup ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Set this in Render's environment variables
  ssl: { rejectUnauthorized: false }
});

// Ensure the table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scan_counts (
      id SERIAL PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    );
  `);
  // Ensure a row exists
  const res = await pool.query("SELECT * FROM scan_counts WHERE id=1");
  if (res.rows.length === 0) {
    await pool.query("INSERT INTO scan_counts (id, count) VALUES (1, 0)");
  }
}
ensureTable();

// --- API ROUTES FIRST ---
app.post("/api/log", async (req, res) => {
  if (req.body.type === "scan") {
    await pool.query("UPDATE scan_counts SET count = count + 1 WHERE id=1");
  }
  res.json({ ok: true });
});

app.get("/api/log", async (req, res) => {
  if (req.query.type === "scan") {
    const result = await pool.query("SELECT count FROM scan_counts WHERE id=1");
    res.json({ count: result.rows[0]?.count ?? 0 });
  } else {
    res.json({ ok: true });
  }
});

// --- STATIC FILES ---
app.use(express.static(path.join(__dirname, "../dist")));

// --- CATCH-ALL FOR REACT ROUTER ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
