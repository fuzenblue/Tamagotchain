import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import MyPet from './pages/MyPet';
import Battle from './pages/Battle'
import Leaderboard from './pages/Leaderboard'
import BattleHistory from './pages/BattleHistory'
import Profile from './pages/Profile'

// Import Layout
import MainLayout from './components/layout/MainLayout'
import { Web3Provider } from './context/Web3Context'

console.log("Contract Address is:", import.meta.env.VITE_CONTRACT_ADDRESS)

function App() {
  return (
    <BrowserRouter>
      <Web3Provider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-pet" element={<MyPet />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/battle-history" element={<BattleHistory />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MainLayout>
      </Web3Provider>
    </BrowserRouter>
  )
}

export default App