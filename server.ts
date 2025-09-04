import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import OpenAI from "openai";

//  Recreate __dirname in ESM/TypeScript
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // make sure to set this in Render/locally
});

// Middleware
app.use(express.json());

// Serve React build
const buildPath = path.join(__dirname, "dist");
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
            voice: "verse", // you can change to "alloy", "ash", etc.
            input: text,
        });

        // Convert ArrayBuffer → Buffer so Express can send audio
        const buffer = Buffer.from(await response.arrayBuffer());

        res.set("Content-Type", "audio/mpeg");
        res.send(buffer);
    } catch (err) {
        console.error("TTS error:", err);
        res.status(500).send("TTS API failed");
    }
});

// Fallback: always serve index.html for React Router
app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
