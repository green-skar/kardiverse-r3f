import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function AvatarLipSync({ audioElementId='kardi-voice' }:{audioElementId?:string}){
  const analyserRef = useRef<AnalyserNode|null>(null)
  const morphsRef = useRef<any[]>([])

  useEffect(()=>{
    const audio = document.getElementById(audioElementId) as HTMLAudioElement|null
    if (!audio) return
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const src = ctx.createMediaElementSource(audio)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    src.connect(analyser); analyser.connect(ctx.destination)
    analyserRef.current = analyser

    const findMorphs = ()=>{
      try{
        // @ts-ignore
        const scene = (window as any).__THREE_SCENE
        if(!scene) return
        scene.traverse((c:any)=>{ if(c.isMesh && c.morphTargetInfluences) morphsRef.current.push(c) })
      }catch(e){}
    }
    findMorphs()
    const id = setInterval(findMorphs, 1200)
    return ()=>{ clearInterval(id); try{ analyser.disconnect(); ctx.close() }catch(e){} }
  },[audioElementId])

  // smoothing state
  const levelRef = useRef(0)
  useFrame(()=>{
    if(!analyserRef.current) return
    const analyser = analyserRef.current
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    let sum=0; for(let i=0;i<data.length;i++) sum+=data[i]
    const avg = sum/data.length/255
    // envelope smoothing
    const target = avg
    levelRef.current = levelRef.current*0.8 + target*0.2

    if(morphsRef.current.length>0){
      morphsRef.current.forEach((m:any)=>{
        const count = Math.min(4, m.morphTargetInfluences.length)
        for(let i=0;i<count;i++){
          m.morphTargetInfluences[i] = THREE.MathUtils.lerp(m.morphTargetInfluences[i], Math.min(0.95, levelRef.current*(0.9 + i*0.2)), 0.25)
        }
      })
      return
    }

    // fallback: scale a mesh named _kardi_fallback_mouth if present
    try{
      // @ts-ignore
      const scene = (window as any).__THREE_SCENE
      if(!scene) return
      let mouth=null
      scene.traverse((c:any)=>{ if(c.name === '_kardi_fallback_mouth') mouth = c })
      if(mouth){
        const targetScale = 0.6 + levelRef.current*1.6
        mouth.scale.y = THREE.MathUtils.lerp(mouth.scale.y, targetScale, 0.2)
      }
    }catch(e){}
  })

  return null
}
