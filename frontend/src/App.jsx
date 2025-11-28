import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import หน้าต่างๆ
import Home from './pages/Home';
import MyPet from './pages/MyPet'; 
import Battle from './pages/Battle';       // 👈 ต้องมี
import Leaderboard from './pages/Leaderboard'; // 👈 ต้องมี
import BattleHistory from './pages/BattleHistory'; 

// Import Layout
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <BrowserRouter>
      {/* ใช้ MainLayout ครอบ Routes ทั้งหมด เพื่อให้มี Sidebar ทุกหน้า */}
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-pet" element={<MyPet />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/battle-history" element={<BattleHistory />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;