import React from 'react'
import HologramScene from '../scene/HologramScene'
export default function Projector(){ return <div className='app-stage'><div className='canvas-wrapper'><HologramScene projectorMode/></div><div style={{position:'absolute',left:18,top:18}}>Projector Mode</div><div className='controls small'>Press Space to trigger</div></div> }
