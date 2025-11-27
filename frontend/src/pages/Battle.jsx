import React from 'react';
import { useNavigate } from 'react-router-dom';
import PetDisplay from '../components/PetDisplay';

const Battle = () => {
  const navigate = useNavigate();

  // Mock Data (ของจริงจะดึงจาก Blockchain)
  const walletBalance = "0.045"; // ETH
  const walletAddress = "0x12...34AB";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-mono text-white">
      
      {/* Container */}
      <div className="w-full max-w-4xl bg-gray-800 border-4 border-gray-600 rounded-3xl p-6 relative shadow-2xl">

        {/* --- Header: Blockchain Info --- */}
        <div className="flex justify-between items-center mb-8 bg-gray-900 p-4 rounded-xl border-2 border-gray-700">
          <button onClick={() => navigate('/')} className="text-yellow-400 hover:text-yellow-300 font-bold">
             ⬅ BACK HOME
          </button>
          
          <div className="text-right">
            <div className="text-xs text-gray-400">CONNECTED: {walletAddress}</div>
            <div className="text-xl font-bold text-green-400">💰 {walletBalance} ETH</div>
          </div>
        </div>

        {/* --- Battle Area --- */}
        <div className="flex justify-between items-center gap-4 mb-8">
          
          {/* Player (เรา) */}
          <div className="flex-1 flex flex-col items-center bg-blue-900/30 p-6 rounded-2xl border-2 border-blue-500">
            <h3 className="text-xl font-bold text-blue-300 mb-4">YOU</h3>
            <PetDisplay status="IDLE" size={120} />
            <div className="w-full h-4 bg-gray-700 rounded-full mt-4">
              <div className="w-full h-full bg-green-500 rounded-full"></div>
            </div>
            <p className="mt-2">HP: 100/100</p>
          </div>

          {/* VS Logo */}
          <div className="text-5xl font-black text-red-500 italic animate-pulse">
            VS
          </div>

          {/* Enemy (ศัตรู) */}
          <div className="flex-1 flex flex-col items-center bg-red-900/30 p-6 rounded-2xl border-2 border-red-500">
            <h3 className="text-xl font-bold text-red-300 mb-4">ENEMY</h3>
            {/* ใช้รูปมังกรแต่กลับด้าน (scale-x-[-1]) หรือเปลี่ยนสี */}
            <div className="transform scale-x-[-1] filter hue-rotate-90"> 
               <PetDisplay status="WALK" size={120} />
            </div>
            <div className="w-full h-4 bg-gray-700 rounded-full mt-4">
              <div className="w-[80%] h-full bg-red-500 rounded-full"></div>
            </div>
            <p className="mt-2">HP: 80/100</p>
          </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex justify-center gap-4">
          <button className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl border-b-4 border-red-800 text-xl shadow-lg active:mt-1 active:border-b-0">
             ⚔️ ATTACK
          </button>
          
          {/* ปุ่มไป Leaderboard */}
          <button 
            onClick={() => navigate('/leaderboard')}
            className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl border-b-4 border-yellow-700 text-xl shadow-lg active:mt-1 active:border-b-0"
          >
             🏆 LEADERBOARD
          </button>
        </div>

      </div>
    </div>
  );
};

export default Battle;