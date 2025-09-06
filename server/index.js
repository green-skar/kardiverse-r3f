const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

let scanCount = 0;

// --- API ROUTES FIRST ---
app.post("/api/log", (req, res) => {
  if (req.body.type === "scan") scanCount++;
  res.json({ ok: true });
});

app.get("/api/log", (req, res) => {
  if (req.query.type === "scan") {
    res.json({ count: scanCount });
  } else {
    res.json({ ok: true });
  }
});

// --- THEN STATIC FILES ---
app.use(express.static(path.join(__dirname, "../dist")));

// --- THEN CATCH-ALL FOR REACT ROUTER ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
