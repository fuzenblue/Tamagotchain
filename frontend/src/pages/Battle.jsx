import React from 'react';
import { useNavigate } from 'react-router-dom';
import PetDisplay from '../components/PetDisplay'; 

const Battle = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-4xl bg-gray-800 border-4 border-gray-600 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-gray-900 p-4 rounded-xl border-2 border-gray-700 relative z-10">
          <div className="text-xl font-bold text-yellow-400">⚔️ ARENA MODE</div>
          <div className="text-xl font-bold text-green-400">Reward: 0.05 ETH</div>
        </div>

        {/* Battle Area */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8 relative z-10">
          
          {/* Player (เรา) */}
          <div className="flex-1 flex flex-col items-center bg-blue-900/40 p-6 rounded-2xl border-2 border-blue-500 w-full">
            <h3 className="text-xl font-bold text-blue-300 mb-4">YOU</h3>
            <PetDisplay status="IDLE" size={120} />
            {/* HP Bar */}
            <div className="w-full h-4 bg-gray-700 rounded-full mt-4 border border-black">
              <div className="w-full h-full bg-green-500 rounded-full"></div>
            </div>
            <p className="mt-2 font-mono text-green-300">HP: 100/100</p>
          </div>

          {/* VS Badge */}
          <div className="text-6xl font-black text-red-600 italic animate-pulse drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
            VS
          </div>

          {/* Enemy (ศัตรู) */}
          <div className="flex-1 flex flex-col items-center bg-red-900/40 p-6 rounded-2xl border-2 border-red-500 w-full">
            <h3 className="text-xl font-bold text-red-300 mb-4">EVIL DRAGON</h3>
            {/* กลับด้านรูปให้หันหน้าชนกัน */}
            <div className="transform scale-x-[-1] filter hue-rotate-[90deg] brightness-75"> 
               <PetDisplay status="WALK" size={120} />
            </div>
            {/* HP Bar */}
            <div className="w-full h-4 bg-gray-700 rounded-full mt-4 border border-black">
              <div className="w-[80%] h-full bg-red-600 rounded-full"></div>
            </div>
            <p className="mt-2 font-mono text-red-300">HP: 80/100</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 relative z-10">
          <button className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl border-b-4 border-red-800 text-xl shadow-lg active:mt-1 active:border-b-0 transition-all uppercase tracking-widest">
             🔥 Attack
          </button>
          <button className="px-8 py-4 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl border-b-4 border-gray-800 text-xl shadow-lg active:mt-1 active:border-b-0 transition-all uppercase tracking-widest">
             🛡️ Defend
          </button>
        </div>

        {/* Background Effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: "url('/assets/pets/bg.png')", backgroundSize: 'cover' }}>
        </div>
    </div>
  );
};

export default Battle;