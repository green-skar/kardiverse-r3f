"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
// Load environment variables
dotenv.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// Initialize OpenAI client
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || process.env.AI_TTS_API_KEY,
});
// Middleware
app.use(express_1.default.json());
// Serve React build
const buildPath = __dirname;
app.use(express_1.default.static(buildPath));
// 🔊 OpenAI TTS endpoint
app.get("/api/tts", async (req, res) => {
    const text = req.query.text || "Hello from Kardiverse";
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
    }
    catch (err) {
        console.error("TTS error:", err);
        res.status(500).send("TTS API failed");
    }
});
// Fallback: React Router
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path_1.default.join(buildPath, "index.html"));
});
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
