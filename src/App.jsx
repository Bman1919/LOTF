import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Home from './pages/Home/Home.jsx'
import AppNotFound from './pages/AppNotFound/AppNotFound.jsx'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="*" element={<AppNotFound />} />
      </Routes>
    </>
  )
}

export default App
