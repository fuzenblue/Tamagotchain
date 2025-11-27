import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 👇 สังเกตตรงนี้ครับ ต้อง import ไฟล์ที่มีอยู่จริง (Dashboard)
import Dashboard from './pages/Dashboard'; 
import Battle from './pages/Battle';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 👇 ตรงนี้ element ต้องเป็น <Dashboard /> */}
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/battle" element={<Battle />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;