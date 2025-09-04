import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HologramScene from '../scene/HologramScene'
import { useAppStore } from '../store'
import axios from 'axios'

export default function Entry() {
  const addActivation = useAppStore(s => s.addActivation)
  const [greetingUrl, setGreetingUrl] = useState<string | null>(null)
  const [hasPlayed, setHasPlayed] = useState(false)

  // 🔊 Auto play greeting once on mount
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const res = await fetch(`/api/tts?text=${encodeURIComponent("Hello, welcome to the gates of display from Kardiverse")}`)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        setGreetingUrl(url)

        const audio = document.getElementById('kardi-voice') as HTMLAudioElement | null
        if (audio && !hasPlayed) {
          audio.src = url
          audio.currentTime = 0
          audio.play().catch(() => { })
          setHasPlayed(true)
        }
      } catch (err) {
        console.error("Failed to fetch greeting TTS:", err)
      }
    }

    fetchGreeting()
  }, [hasPlayed])

  const activate = () => {
    addActivation()
    axios.post('/api/log', { type: 'activation', ts: Date.now() }).catch(() => { })
    const bc = new BroadcastChannel('kardi-cue')
    bc.postMessage('cue')

    const audio = document.getElementById('kardi-voice') as HTMLAudioElement | null
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => { })
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

        {/*  shared audio element for both autoplay + lip sync */}
        <audio id="kardi-voice" src={greetingUrl || ''} controls style={{ marginTop: "10px" }} />
      </div>
    </div>
  )
}
