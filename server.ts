import express = require("express");
import path = require("path");
import * as dotenv from "dotenv";
import OpenAI from "openai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.AI_TTS_API_KEY,
});

// Middleware
app.use(express.json());

// Serve React build
const buildPath = __dirname;
app.use(express.static(buildPath));

// 🔊 OpenAI TTS endpoint
app.get("/api/tts", async (req, res) => {
    const text = (req.query.text as string) || "Hello from Kardiverse";

    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).send("Missing OPENAI_API_KEY");
        }

        const response = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "verse",
            input: text,
        });

        const buffer = Buffer.from(await response.arrayBuffer());

        res.set("Content-Type", "audio/mpeg");
        res.send(buffer);
    } catch (err) {
        console.error("TTS error:", err);
        res.status(500).send("TTS API failed");
    }
});

// Fallback: React Router
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});


app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
