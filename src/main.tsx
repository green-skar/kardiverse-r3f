import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Entry from './pages/Entry'
import Projector from './pages/Projector'
import Mobile from './pages/Mobile'
import VideoExport from './pages/VideoExport'
import QRScan from './pages/QRScan'
import ErrorBoundary from './components/ErrorBoundary'
import ModelPreloader from './components/ModelPreloader'
import './styles.css'

// Configure DRACO loader globally for @react-three/drei (local development)
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
dracoLoader.setWorkerLimit(1)

// Configure GLTF loader with DRACO support
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Make the configured loader available globally
;(window as any).__THREE_GLTF_LOADER = gltfLoader

console.log('App: Running in local development mode with DRACO support for compressed GLB files');

function App(){
  console.log('App: Component rendering, current path:', window.location.pathname);
  
  return (
    <ErrorBoundary fallback={
      <div style={{
        padding: '20px',
        background: 'red',
        color: 'white',
        fontSize: '18px',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h1>Error: Something went wrong</h1>
        <p>Check console for details</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    }>
      <ModelPreloader />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Entry/>}/>
          <Route path='/projector' element={<Projector/>}/>
          <Route path='/mobile' element={<Mobile/>}/>
          <Route path='/video-export' element={<VideoExport/>}/>
          <Route path='/qr-scan' element={<QRScan/>}/>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
createRoot(document.getElementById('root')!).render(<App />)