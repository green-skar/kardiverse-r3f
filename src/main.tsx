import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Entry from './pages/Entry'
import Projector from './pages/Projector'
import Remote from './pages/Remote'
import './styles.css'

function App(){
  return (<BrowserRouter><Routes><Route path='/' element={<Entry/>}/><Route path='/projector' element={<Projector/>}/><Route path='/remote' element={<Remote/>}/></Routes></BrowserRouter>)
}
createRoot(document.getElementById('root')!).render(<App />)
