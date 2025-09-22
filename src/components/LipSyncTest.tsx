import React, { useState } from 'react'
import AvatarLipSync from './AvatarLipSync'

export default function LipSyncTest() {
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [intensity, setIntensity] = useState(1.2)
  const [smoothing, setSmoothing] = useState(0.85)

  const playAudio = () => {
    const audio = document.getElementById('kardi-voice') as HTMLAudioElement
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(console.error)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: '#39e6ff',
      padding: '20px',
      borderRadius: '10px',
      border: '1px solid #39e6ff',
      zIndex: 1000,
      minWidth: '300px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#39e6ff' }}>Lip Sync Test Controls</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={playAudio}
          style={{
            background: 'transparent',
            border: '1px solid #39e6ff',
            color: '#39e6ff',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Play Audio
        </button>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            checked={isDebugMode}
            onChange={(e) => setIsDebugMode(e.target.checked)}
          />
          Debug Mode
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Intensity: {intensity.toFixed(2)}
        </label>
        <input 
          type="range" 
          min="0.5" 
          max="2.0" 
          step="0.1" 
          value={intensity}
          onChange={(e) => setIntensity(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Smoothing: {smoothing.toFixed(2)}
        </label>
        <input 
          type="range" 
          min="0.1" 
          max="0.95" 
          step="0.05" 
          value={smoothing}
          onChange={(e) => setSmoothing(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ fontSize: '12px', color: '#aaa' }}>
        <div>• Higher intensity = more pronounced lip movement</div>
        <div>• Higher smoothing = smoother, less jittery movement</div>
        <div>• Debug mode shows real-time lip sync data</div>
      </div>

      {/* Hidden lip sync component with current settings */}
      <AvatarLipSync 
        audioElementId="kardi-voice"
        intensity={intensity}
        smoothing={smoothing}
        enableDebug={isDebugMode}
      />
    </div>
  )
}
