// frontend/src/pages/Dashboard.jsx
import React, { useState } from 'react';
import Button from '../components/common/Button';
import PetDisplay from '../components/PetDisplay';

const Dashboard = () => {
  const [petStatus, setPetStatus] = useState('IDLE');

  // ฟังก์ชันจำลองการกระทำ
  const handleAction = (action) => {
    setPetStatus(action);
    // หลังจาก 3 วินาที ให้กลับมายืนเฉยๆ
    setTimeout(() => {
      setPetStatus('IDLE');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-mono">
      
      {/* 🎮 Game Container */}
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl border-4 border-gray-600 max-w-md w-full">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 text-white">
          <div>
            <h1 className="text-xl font-bold text-yellow-400">Nong Dragon 🐲</h1>
            <p className="text-xs text-gray-400">Level 1</p>
          </div>
          <div className="bg-gray-700 px-3 py-1 rounded-lg text-sm">
            💎 0.00 ETH
          </div>
        </div>

        {/* 🖼️ Pet Screen */}
        <div className="bg-blue-200 rounded-xl border-4 border-gray-700 h-64 flex items-center justify-center mb-6 relative overflow-hidden">
          {/* Background (ใส่รูป bg.png ตรงนี้ได้) */}
          <div className="absolute inset-0 opacity-30" 
               style={{ backgroundImage: "url('/assets/pets/bg.png')", backgroundSize: 'cover' }}>
          </div>
          
          {/* ตัว Pet */}
          <PetDisplay status={petStatus} size={160} />
        </div>

        {/* 📊 Stats Bar (เดี๋ยวค่อยแยก Component) */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-white text-xs">
            <span>Hunger</span> <span>80/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
          </div>
        </div>

        {/* 🔘 Controls */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => handleAction('EAT')} variant="primary">
            🍖 Feed
          </Button>
          <Button onClick={() => handleAction('WALK')} variant="success">
            🎾 Play
          </Button>
          <Button onClick={() => handleAction('SLEEP')} variant="secondary">
            💤 Sleep
          </Button>
          <Button onClick={() => handleAction('DEAD')} variant="danger">
            💀 Kill (Test)
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;