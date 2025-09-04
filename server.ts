// server.ts
import express from "express"
import path from "path"
import fetch from "node-fetch"

const app = express()
const port = process.env.PORT || 3000

// --- TTS route ---
app.get("/api/tts", async (req, res) => {
    const text = req.query.text as string
    if (!text) return res.status(400).send("Missing text")

    try {
        const resp = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.AI_TTS_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-tts",
                voice: "alloy",
                input: text
            })
        })

        if (!resp.ok) {
            const msg = await resp.text()
            return res.status(500).send("TTS failed: " + msg)
        }

        res.setHeader("Content-Type", "audio/mpeg")
        resp.body.pipe(res)
    } catch (err) {
        res.status(500).send("Server error: " + (err as Error).message)
    }
})

// --- Serve React build ---
const buildPath = path.join(__dirname, "dist")
app.use(express.static(buildPath))
app.get("*", (_, res) => {
    res.sendFile(path.join(buildPath, "index.html"))
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
