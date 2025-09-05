import React from 'react'
import { Link } from 'react-router-dom'
import HologramScene from '../scene/HologramScene'
import { useAppStore } from '../store'
import axios from 'axios'

export default function Entry() {
  const addActivation = useAppStore(s => s.addActivation)

  const activate = async () => {
    try {
      // 1. Log the activation
      addActivation()
      axios.post('/api/log', { type: 'activation', ts: Date.now() }).catch(() => { })

      // 2. Fetch TTS audio from server (POST JSON body instead of GET)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Hello, welcome to the gates of display from Kardiverse"
        })
      })

      if (!res.ok) throw new Error("TTS request failed")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      // 3. Play the audio & trigger lipsync
      const audio = document.getElementById('kardi-voice') as HTMLAudioElement
      if (audio) {
        audio.src = url
        audio.currentTime = 0
        await audio.play().catch(() => { })
      }

      // 4. Broadcast to hologram scene (for lipsync animation)
      const bc = new BroadcastChannel('kardi-cue')
      bc.postMessage('cue')
    } catch (err) {
      console.error("Activation failed:", err)
    }
  }

  return (
    <div className='app-stage'>
      <div className='canvas-wrapper'>
        <HologramScene entryMode />
      </div>
      <div className='controls'>
        <button className='button' onClick={activate}>Activate Hologram</button>
        <Link to='/projector'><button className='button'>Open Projector</button></Link>
        <Link to='/remote'><button className='button'>Remote</button></Link>
      </div>

      {/* 🔊 Hidden audio element for lipsync (no controls shown) */}
      <audio id='kardi-voice' style={{ display: 'none' }} />
    </div>
  )
}
