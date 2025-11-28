import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PetDisplay from '../components/PetDisplay'; 

const Battle = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. รับค่าเลือดมาจากหน้า MyPet ---
  const currentHp = location.state?.playerHealth || 100;

  // พลังเรา = เลือดปัจจุบัน
  const [myEnergy] = useState(currentHp); 
  
  // --- 2. คำนวณพลังศัตรู (แบบสุ่มแฟร์ๆ Max 100) ---
  const [enemyEnergy] = useState(() => {
      // สุ่มพลังบวกลบ 20 (เช่น เรา 80 ศัตรูอาจจะ 60-100)
      let randomDiff = Math.floor(Math.random() * 41) - 20; 
      let enemyPower = currentHp + randomDiff;

      // 👇👇👇 แก้ไขตรงนี้: ตัดระบบโกงออก ให้ตันที่ 100 เท่ากัน 👇👇👇
      return Math.max(0, Math.min(100, enemyPower)); 
  });

  const [battleState, setBattleState] = useState('IDLE'); // IDLE, FIGHTING, FINISHED
  const [winner, setWinner] = useState(null); // PLAYER, ENEMY, DRAW

  // --- 3. ฟังก์ชันเริ่มต่อสู้ ---
  const startBattle = () => {
    setBattleState('FIGHTING');

    // รอ Animation 2.5 วินาที
    setTimeout(() => {
      // ตัดสินผล (แบบแฟร์ๆ มีแพ้ ชนะ เสมอ)
      if (myEnergy > enemyEnergy) {
        setWinner('PLAYER');
        
        // บันทึกสถิติชนะ
        const currentStats = JSON.parse(localStorage.getItem('tamagotchain_stats')) || { wins: 0, eth: 0 };
        const newStats = {
            wins: currentStats.wins + 1,
            eth: parseFloat(currentStats.eth) + 0.05
        };
        localStorage.setItem('tamagotchain_stats', JSON.stringify(newStats));
        window.dispatchEvent(new Event('storage'));

      } else if (myEnergy < enemyEnergy) {
        setWinner('ENEMY');
      } else {
        setWinner('DRAW'); // ถ้าเท่ากันก็เสมอ
      }
      setBattleState('FINISHED');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      
      {/* Background */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
            backgroundImage: "url('/assets/pets/btbg.png')",
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            filter: 'brightness(60%)'
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-5xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-yellow-500 tracking-widest drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-pulse">
                ⚔️ BATTLE ARENA ⚔️
            </h1>
            <p className="text-white mt-2 text-lg font-mono bg-black/50 inline-block px-4 rounded">
                Fair Fight Mode (Max 100)
            </p>
        </div>

        {/* Battle Field */}
        <div className="flex justify-between items-end min-h-[400px] px-8 pb-12 relative">
            
            {/* --- PLAYER (ฝั่งซ้าย) --- */}
            <div className={`
                flex flex-col items-center transition-all duration-500
                ${battleState === 'FIGHTING' ? 'translate-x-[150px] scale-125' : ''} 
                ${winner === 'ENEMY' ? 'grayscale opacity-50' : ''}
            `}>
                <div className="mb-4 text-center">
                    <div className="text-blue-300 font-bold mb-1 text-xl">YOU</div>
                    <div className="w-32 h-4 bg-gray-700 rounded-full border-2 border-white">
                        <div style={{width: `${myEnergy}%`}} className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
                    </div>
                    <div className="text-white font-mono text-sm mt-1">Power: {myEnergy}/100</div>
                </div>

                <div className="relative">
                    <PetDisplay status="WALK" size={200} />
                    {winner === 'PLAYER' && <div className="absolute -top-10 left-10 text-6xl animate-bounce">👑</div>}
                </div>
            </div>

            {/* --- EFFECT --- */}
            {battleState === 'FIGHTING' && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="text-9xl animate-ping opacity-80">💥</div>
                    <div className="absolute text-8xl font-black text-yellow-500 -rotate-12 animate-bounce">POW!</div>
                </div>
            )}

            {/* --- ENEMY (ฝั่งขวา) --- */}
            <div className={`
                flex flex-col items-center transition-all duration-500
                ${battleState === 'FIGHTING' ? '-translate-x-[150px] scale-125' : ''}
                ${winner === 'PLAYER' ? 'grayscale opacity-50' : ''}
            `}>
                <div className="mb-4 text-center">
                    <div className="text-red-300 font-bold mb-1 text-xl">ENEMY</div>
                    <div className="w-32 h-4 bg-gray-700 rounded-full border-2 border-white">
                        <div style={{width: `${enemyEnergy}%`}} className="h-full bg-red-600 rounded-full shadow-[0_0_10px_#dc2626]"></div>
                    </div>
                    <div className="text-white font-mono text-sm mt-1">Power: {enemyEnergy}/100</div>
                </div>

                <div className="relative transform scale-x-[-1] filter hue-rotate-90">
                    <PetDisplay status="WALK" size={200} />
                    {winner === 'ENEMY' && <div className="absolute -top-10 left-10 text-6xl animate-bounce transform scale-x-[-1]">👑</div>}
                </div>
            </div>

        </div>

        {/* --- CONTROLS / RESULT --- */}
        <div className="flex justify-center mt-8 h-24">
            
            {battleState === 'IDLE' && (
                <button 
                    onClick={startBattle}
                    className="px-12 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-2xl rounded-2xl border-b-8 border-red-900 active:border-b-0 active:translate-y-2 transition-all shadow-2xl hover:scale-105"
                >
                    🔥 FIGHT!
                </button>
            )}

            {battleState === 'FINISHED' && (
                <div className="bg-gray-900/90 p-8 rounded-2xl border-4 border-yellow-500 text-center animate-bounce-slow backdrop-blur-sm fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 shadow-2xl">
                    <h2 className={`text-5xl font-black mb-2 uppercase 
                        ${winner === 'PLAYER' ? 'text-green-400' : winner === 'ENEMY' ? 'text-red-500' : 'text-gray-300'}`}>
                        {winner === 'PLAYER' ? '🏆 YOU WIN!' : winner === 'ENEMY' ? '💀 YOU LOSE!' : '🤝 DRAW!'}
                    </h2>
                    
                    <p className="text-yellow-400 font-bold text-xl mb-6">
                         {winner === 'PLAYER' ? 'Reward: +0.05 ETH & +1 Win' : 
                          winner === 'DRAW' ? 'Matched Power! No Winner.' : 'Better luck next time!'}
                    </p>
                    
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-400">
                            Rematch
                        </button>
                        <button onClick={() => navigate('/my-pet')} className="px-6 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-500">
                            Back Home
                        </button>
                        <button onClick={() => navigate('/leaderboard')} className="px-6 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400">
                            Check Rank 🏆
                        </button>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Battle;