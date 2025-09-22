import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import PERFORMANCE_CONFIG from '../config/performance'

interface LipSyncProps {
  audioElementId?: string
  intensity?: number
  smoothing?: number
  enableDebug?: boolean
}

export default function AvatarLipSync({ 
  audioElementId = 'kardi-voice',
  intensity = 1.0,
  smoothing = 0.8,
  enableDebug = false
}: LipSyncProps) {
  const analyserRef = useRef<AnalyserNode | null>(null)
  const morphsRef = useRef<any[]>([])
  const mouthRef = useRef<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  useEffect(() => {
    const audio = document.getElementById(audioElementId) as HTMLAudioElement | null
    if (!audio) return

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const src = ctx.createMediaElementSource(audio)
    const analyser = ctx.createAnalyser()
    
    // Optimized audio analysis settings for performance
    analyser.fftSize = PERFORMANCE_CONFIG.AUDIO.FFT_SIZE
    analyser.smoothingTimeConstant = PERFORMANCE_CONFIG.AUDIO.SMOOTHING_TIME_CONSTANT
    analyser.minDecibels = PERFORMANCE_CONFIG.AUDIO.MIN_DECIBELS
    analyser.maxDecibels = PERFORMANCE_CONFIG.AUDIO.MAX_DECIBELS
    
    src.connect(analyser)
    analyser.connect(ctx.destination)
    analyserRef.current = analyser

    // Audio event listeners
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    const findMorphs = () => {
      try {
        // @ts-ignore
        const scene = (window as any).__THREE_SCENE
        if (!scene) return
        
        // Find morph targets for lip sync
        scene.traverse((c: any) => {
          if (c.isMesh && c.morphTargetInfluences) {
            if (!morphsRef.current.includes(c)) {
              morphsRef.current.push(c)
            }
          }
        })

        // Find mouth mesh for fallback
        if (!mouthRef.current) {
          scene.traverse((c: any) => {
            if (c.name && (
              c.name.toLowerCase().includes('mouth') ||
              c.name.toLowerCase().includes('lip') ||
              c.name === '_kardi_fallback_mouth'
            )) {
              mouthRef.current = c
            }
          })
        }
      } catch (e) {
        if (enableDebug) console.error('Error finding morphs:', e)
      }
    }

    findMorphs()
    const id = setInterval(findMorphs, PERFORMANCE_CONFIG.AUDIO.MORPH_SEARCH_INTERVAL)

    return () => {
      clearInterval(id)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      try {
        analyser.disconnect()
        ctx.close()
      } catch (e) {}
    }
  }, [audioElementId, enableDebug])

  // Enhanced smoothing and lip sync calculation
  const levelRef = useRef(0)
  const peakRef = useRef(0)
  const historyRef = useRef<number[]>([])

  useFrame(() => {
    if (!analyserRef.current || !isPlaying) return

    const analyser = analyserRef.current
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)

    // Calculate audio level with frequency weighting
    let sum = 0
    let weightedSum = 0
    for (let i = 0; i < data.length; i++) {
      const value = data[i] / 255
      sum += value
      // Weight higher frequencies more for better lip sync
      const weight = Math.pow(i / data.length, 0.5)
      weightedSum += value * weight
    }

    const avg = sum / data.length
    const weightedAvg = weightedSum / data.length

    // Use weighted average for more natural lip movement
    const target = Math.min(1, weightedAvg * intensity)

    // Enhanced smoothing with peak detection
    levelRef.current = levelRef.current * smoothing + target * (1 - smoothing)
    
    // Track peak for more dynamic movement
    if (target > peakRef.current) {
      peakRef.current = target
    } else {
      peakRef.current *= 0.95 // Decay peak
    }

    // Store history for more natural movement (reduced for performance)
    historyRef.current.push(levelRef.current)
    if (historyRef.current.length > PERFORMANCE_CONFIG.AUDIO.HISTORY_LENGTH) {
      historyRef.current.shift()
    }

    // Calculate final lip sync value with variation
    const baseLevel = levelRef.current
    const peakBoost = Math.min(0.3, peakRef.current * 0.5)
    const variation = historyRef.current.length > 3 
      ? (historyRef.current[historyRef.current.length - 1] - historyRef.current[0]) * 0.1 
      : 0

    const finalLevel = Math.min(1, baseLevel + peakBoost + variation)
    setAudioLevel(finalLevel)

    // Apply to morph targets
    if (morphsRef.current.length > 0) {
      morphsRef.current.forEach((m: any) => {
        const count = Math.min(6, m.morphTargetInfluences.length) // Support more morph targets
        
        // Map different frequency ranges to different morph targets
        for (let i = 0; i < count; i++) {
          const morphIntensity = finalLevel * (0.7 + i * 0.1) // Vary intensity per morph
          const targetValue = Math.min(0.95, morphIntensity)
          
          m.morphTargetInfluences[i] = THREE.MathUtils.lerp(
            m.morphTargetInfluences[i], 
            targetValue, 
            0.3 // Faster response for more natural movement
          )
        }
      })
      return
    }

    // Enhanced fallback: scale mouth mesh
    if (mouthRef.current) {
      const targetScale = 0.5 + finalLevel * 1.5
      mouthRef.current.scale.y = THREE.MathUtils.lerp(
        mouthRef.current.scale.y, 
        targetScale, 
        0.25
      )
      
      // Add slight X scaling for more natural mouth movement
      const targetScaleX = 0.8 + finalLevel * 0.4
      mouthRef.current.scale.x = THREE.MathUtils.lerp(
        mouthRef.current.scale.x, 
        targetScaleX, 
        0.15
      )
    }

    // Debug visualization
    if (enableDebug) {
      console.log(`Lip Sync - Level: ${finalLevel.toFixed(3)}, Peak: ${peakRef.current.toFixed(3)}`)
    }
  })

  // Debug UI (only in development)
  if (enableDebug && process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: '#39e6ff',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>Lip Sync Debug</div>
        <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
        <div>Level: {audioLevel.toFixed(3)}</div>
        <div>Morphs: {morphsRef.current.length}</div>
        <div>Mouth: {mouthRef.current ? 'Found' : 'Not Found'}</div>
      </div>
    )
  }

  return null
}
