import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Home from './pages/Home/Home.jsx'
import AppNotFound from './pages/AppNotFound/AppNotFound.jsx'
import Lobby from './pages/Lobby/Lobby.jsx'
import Game from './pages/Game/Game.jsx'
import { Routes, Route } from 'react-router-dom'

function App() {
  const [charInd, setCharInd] = useState(-1);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="lobby/:id" element={<Lobby setPlayerInd={setCharInd}/>} />
        <Route path="game/:id" element={<Game playerId={charInd}/>} />
        <Route path="*" element={<AppNotFound />} />
      </Routes>
    </>
  )
}

export default App
