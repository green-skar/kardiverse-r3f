import React from 'react'
import { Link } from 'react-router-dom'
import HologramScene from '../scene/HologramScene'
import { useAppStore } from '../store'
import axios from 'axios'

export default function Entry(){
  const addActivation = useAppStore(s=>s.addActivation)
  const activate = ()=>{
    addActivation()
    axios.post('/api/log', {type:'activation', ts:Date.now()}).catch(()=>{})
    const bc = new BroadcastChannel('kardi-cue'); bc.postMessage('cue')
    const audio = document.getElementById('kardi-voice') as HTMLAudioElement|null; if(audio){ audio.currentTime=0; audio.play().catch(()=>{}) }
  }
  return (<div className='app-stage'><div className='canvas-wrapper'><HologramScene entryMode/></div><div className='controls'><button className='button' onClick={activate}>Activate Hologram</button><Link to='/projector'><button className='button'>Open Projector</button></Link><Link to='/remote'><button className='button'>Remote</button></Link></div></div>)
}
