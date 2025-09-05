const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_TTS_API_KEY,
});

app.post("/api/tts", async (req, res) => {
  const text =
    req.body.text || "Welcome to the Gates of Display, from Kardiverse.";
  try {
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "verse", // try "alloy", "sage", "charlie" too
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    res.set("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (e) {
    console.error("TTS error:", e);
    res.status(500).json({ error: "TTS provider error", detail: String(e) });
  }
});

app.post("/api/log", (req, res) => {
  console.log("LOG", req.body);
  res.json({ ok: true });
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log("API listening on", port));
