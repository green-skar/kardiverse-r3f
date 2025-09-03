import React, { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import HologramAvatar from '../components/HologramAvatar'
import AvatarLipSync from '../components/AvatarLipSync'
import LogoGlow from '../components/LogoGlow'
import { useAppStore } from '../store'

export default function HologramScene({entryMode=false, projectorMode=false}:{entryMode?:boolean, projectorMode?:boolean}){
  const setPlaying = useAppStore(s=>s.setPlaying)
  const addActivation = useAppStore(s=>s.addActivation)

  useEffect(()=>{
    const bc = new BroadcastChannel('kardi-cue')
    bc.onmessage = (ev)=>{ if(ev.data==='cue'){ addActivation(); setPlaying(true); const audio = document.getElementById('kardi-voice') as HTMLAudioElement|null; if(audio){ audio.currentTime=0; audio.play().catch(()=>{}) } setTimeout(()=>setPlaying(false),28000) } }
    return ()=> bc.close()
  },[])

  const onCreated = (state:any)=>{ try{ (window as any).__THREE_SCENE = state.scene }catch(e){} }

  return (<div style={{width:'100%',height:'100%'}}>
    <Canvas camera={{position:[0,0,5], fov:50}} onCreated={onCreated}>
      <ambientLight intensity={0.6} />
      <directionalLight intensity={0.2} position={[5,5,5]} />
      <Suspense fallback={null}>
        <HologramAvatar modelUrl={'/avatar.glb'} scale={1.2} />
        <LogoGlow />
        <AvatarLipSync audioElementId={'kardi-voice'} />
        <Environment preset='city' />
      </Suspense>
    </Canvas>
    <audio id='kardi-voice' src='/voice.mp3' crossOrigin='anonymous'></audio>
  </div>)
}
