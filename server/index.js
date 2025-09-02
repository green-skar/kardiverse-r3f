const express = require('express')
const fetch = require('node-fetch')
const cors = require('cors')
const app = express()
app.use(cors()); app.use(express.json({limit:'1mb'}))

app.post('/api/tts', async (req,res)=>{
  const text = req.body.text || 'Welcome to the Gates of Display, from Kardiverse.'
  const voice = req.body.voice || 'alloy'
  const apiKey = process.env.AI_TTS_API_KEY
  if(!apiKey) return res.status(500).json({error:'Missing AI_TTS_API_KEY env var on server'})
  try{
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method:'POST',
      headers:{ 'xi-api-key': apiKey, 'Content-Type':'application/json' },
      body: JSON.stringify({ text })
    })
    if(!r.ok){ const txt = await r.text(); return res.status(502).send(txt) }
    const buffer = Buffer.from(await r.arrayBuffer())
    res.set('Content-Type','audio/mpeg')
    res.send(buffer)
  }catch(e){ console.error(e); res.status(500).json({error:'TTS provider error', detail:String(e)}) }
})

app.post('/api/log', (req,res)=>{ console.log('LOG', req.body); res.json({ok:true}) })

const port = process.env.PORT || 8787
app.listen(port, ()=> console.log('API listening on', port))
