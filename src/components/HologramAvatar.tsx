import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

export default function HologramAvatar({ modelUrl = '/src/assets/avatar.glb', scale=1.0 }:{modelUrl?:string, scale?:number}){
  const group = useRef<any>()
  const { scene } = useGLTF(modelUrl) as any

  useEffect(()=>{
    scene.traverse((child:any)=>{
      if (child.isMesh && child.material){
        child.material.transparent = true
        child.material.depthWrite = false
        child.material.side = THREE.DoubleSide
        if (!child.material.emissive) child.material.emissive = new THREE.Color('#00c8ff')
        child.material.emissiveIntensity = 0.8
        child.material.color = new THREE.Color('#66dfff')
        child.material.opacity = 0.95
      }
    })
  },[scene])

  useFrame(({clock})=>{
    const t = clock.getElapsedTime()
    if (group.current) {
      group.current.rotation.y = Math.sin(t*0.5)*0.03
      group.current.position.y = 0.03*Math.sin(t*0.9)
    }
    scene.traverse((c:any)=>{ if(c.isMesh && c.material) c.material.emissiveIntensity = 0.6 + 0.35*Math.sin(clock.getElapsedTime()*2.2) })
  })

  return <group ref={group} scale={[scale,scale,scale]}><primitive object={scene} /></group>
}
