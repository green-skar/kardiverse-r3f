const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

let scanCount = 0;

app.post("/api/log", (req, res) => {
  if (req.body.type === "scan") {
    scanCount++;
  }
  console.log("LOG", req.body);
  res.json({ ok: true });
});

app.get("/api/log", (req, res) => {
  if (req.query.type === "scan") {
    res.json({ count: scanCount });
  } else {
    res.json({ ok: true });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../dist")));

// Catch-all: send back React's index.html for any other request
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log("API listening on", port));
