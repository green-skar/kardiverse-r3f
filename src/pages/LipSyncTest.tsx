import React from 'react'
import { Link } from 'react-router-dom'
import HologramScene from '../scene/HologramScene'
import LipSyncTest from '../components/LipSyncTest'

export default function LipSyncTestPage() {
  return (
    <div className="app-stage" style={{ position: 'relative' }}>
      {/* Lip Sync Test Controls */}
      <LipSyncTest />
      
      {/* Main hologram scene */}
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '400px',
          height: '400px',
          position: 'relative'
        }}>
          <HologramScene 
            avatarScale={2.0} 
            isActive={true}
            onPreloadComplete={() => {/* Optional: track preload completion */}}
            on2DFallback={() => {/* Optional: handle 2D fallback */}}
          />
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <Link to="/">
          <button className="button">Back to Main</button>
        </Link>
        <Link to="/projector">
          <button className="button">Projector Mode</button>
        </Link>
      </div>

      {/* Hidden audio element */}
      <audio
        id="kardi-voice"
        src="/assets/welcome.mp3"
        style={{ display: 'none' }}
      />
    </div>
  )
}
