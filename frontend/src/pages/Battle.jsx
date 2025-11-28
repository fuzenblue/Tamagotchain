import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PetDisplay from '../components/PetDisplay';

const Battle = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. รับค่า Stats ทั้งหมดจากหน้า MyPet ---
  // ถ้าไม่มีค่าส่งมา ให้ใช้ค่า Default 
  const { 
    playerHealth = 100, 
    hunger = 80, 
    happiness = 80, 
    energy = 80 
  } = location.state || {};

  // --- 2. คำนวณพลังต่อสู้ (Combat Power Calculation) ---
  const calculateCombatPower = (hp, hg, hpn, en) => {
    let power = hp; // เริ่มต้นที่เลือด
    
    // Logic: Buffs
    const attackBonus = hg >= 80 ? 15 : 0;       // อิ่มแล้วตีแรง +15
    const critBonus = hpn >= 90 ? (Math.random() < 0.3 ? 30 : 0) : 0; // สุขมาก มีโอกาส 30% ที่จะ +30 (Critical)
    const dodgePenalty = en < 30 ? -20 : 0;      // เหนื่อยเกินไป พลังลด -20

    return Math.floor(power + attackBonus + critBonus + dodgePenalty);
  };

  // คำนวณพลังของเรา
  const [myStats] = useState({ health: playerHealth, hunger, happiness, energy });
  const [myPower, setMyPower] = useState(0); // จะคำนวณตอนเริ่มสู้ หรือคำนวณเลยก็ได้

  // คำนวณพลังศัตรู (Random ให้ใกล้เคียงเรา แต่มีความผันผวน)
  const [enemyPower] = useState(() => {
    // ฐานพลังศัตรูอิงจากเลือดเรา +/- 15
    const baseEnemy = playerHealth + (Math.floor(Math.random() * 31) - 15);
    // สุ่มโบนัสศัตรูเล็กน้อย
    const randomBonus = Math.floor(Math.random() * 20); 
    return Math.max(0, Math.min(130, baseEnemy + randomBonus)); // Max 130 เผื่อคริ
  });

  const [battleState, setBattleState] = useState('IDLE');
  const [winner, setWinner] = useState(null);
  const [log, setLog] = useState([]); // เก็บข้อความการต่อสู้

  // --- 3. ฟังก์ชันเริ่มต่อสู้ ---
  const startBattle = () => {
    setBattleState('FIGHTING');
    setLog([]); // เคลียร์ log เก่า

    // Phase 1: คำนวณพลังของเรา (แสดง Effect)
    const finalMyPower = calculateCombatPower(myStats.health, myStats.hunger, myStats.happiness, myStats.energy);
    setMyPower(finalMyPower);

    // สร้าง Log การต่อสู้เพื่อความสนุก
    const battleLogs = [];
    if (myStats.hunger >= 80) battleLogs.push("🍖 Full Stomach! Attack Bonus +15");
    if (myStats.happiness >= 90) battleLogs.push("💖 High Spirits! Critical Chance Active...");
    if (myStats.energy < 30) battleLogs.push("💤 Too Tired... Power Penalty -20");
    setLog(battleLogs);

    // รอ Animation
    setTimeout(() => {
      // ตัดสินผล
      if (finalMyPower > enemyPower) {
        setWinner('PLAYER');
        saveWinRecord();
      } else if (finalMyPower < enemyPower) {
        setWinner('ENEMY');
      } else {
        setWinner('DRAW');
      }
      setBattleState('FINISHED');
    }, 2500);
  };

  const saveWinRecord = () => {
    const currentStats = JSON.parse(localStorage.getItem('tamagotchain_stats')) || { wins: 0, eth: 0 };
    const newStats = {
        wins: currentStats.wins + 1,
        eth: parseFloat(currentStats.eth) + 0.05
    };
    localStorage.setItem('tamagotchain_stats', JSON.stringify(newStats));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black font-mono select-none">
      
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

      <div className="w-full max-w-5xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-yellow-500 tracking-widest drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                ⚔️ BATTLE ARENA
            </h1>
            <div className="flex gap-4 justify-center mt-2 text-xs md:text-sm text-gray-300">
                <span className={myStats.hunger >= 80 ? "text-green-400 font-bold" : ""}>🍖 Hunger &gt; 80 = +ATK</span>
                <span className={myStats.happiness >= 90 ? "text-pink-400 font-bold" : ""}>💖 Happy &gt; 90 = CRIT?</span>
            </div>
        </div>

        {/* Battle Field */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end min-h-[400px] px-4 md:px-8 pb-12 relative gap-8">
            
            {/* --- PLAYER --- */}
            <div className={`
                flex flex-col items-center transition-all duration-500 order-2 md:order-1
                ${battleState === 'FIGHTING' ? 'translate-x-0 md:translate-x-[150px] scale-110' : ''} 
                ${winner === 'ENEMY' ? 'grayscale opacity-50 blur-sm' : ''}
            `}>
                <div className="mb-4 text-center bg-black/60 p-3 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                    <div className="text-blue-300 font-bold mb-1 text-xl">YOU</div>
                    {/* Health Bar */}
                    <div className="w-32 h-2 bg-gray-700 rounded-full mb-1">
                        <div style={{width: `${myStats.health}%`}} className="h-full bg-green-500 rounded-full"></div>
                    </div>
                    {/* Final Power Display */}
                    <div className="text-white text-2xl font-black mt-2">
                        {battleState === 'IDLE' ? 'Ready?' : myPower} 
                        <span className="text-xs font-normal text-gray-400 block">Combat Power</span>
                    </div>
                </div>

                <div className="relative">
                    <PetDisplay status={battleState === 'FIGHTING' ? 'WALK' : 'IDLE'} size={180} />
                    {/* Effect Visuals */}
                    {battleState === 'FIGHTING' && myStats.hunger >= 80 && (
                        <div className="absolute -top-5 right-0 text-2xl animate-bounce">🔥</div>
                    )}
                </div>
            </div>

            {/* --- VS / LOGS (Center) --- */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-xs text-center pointer-events-none">
                {battleState === 'FIGHTING' ? (
                     <div className="text-9xl animate-ping opacity-80">💥</div>
                ) : battleState === 'FINISHED' ? (
                    <div className="text-6xl font-black text-yellow-500 drop-shadow-xl animate-bounce">
                        {winner === 'PLAYER' ? 'VICTORY' : winner === 'ENEMY' ? 'DEFEAT' : 'DRAW'}
                    </div>
                ) : (
                    <div className="text-6xl font-black text-white/20">VS</div>
                )}
            </div>

            {/* --- ENEMY --- */}
            <div className={`
                flex flex-col items-center transition-all duration-500 order-1 md:order-3
                ${battleState === 'FIGHTING' ? 'translate-x-0 md:-translate-x-[150px] scale-110' : ''}
                ${winner === 'PLAYER' ? 'grayscale opacity-50 blur-sm' : ''}
            `}>
                <div className="mb-4 text-center bg-black/60 p-3 rounded-xl border border-red-500/30 backdrop-blur-sm">
                    <div className="text-red-300 font-bold mb-1 text-xl">RIVAL DRAGON</div>
                    <div className="text-white text-2xl font-black mt-2">
                        {battleState === 'IDLE' ? '???' : enemyPower}
                        <span className="text-xs font-normal text-gray-400 block">Estimated Power</span>
                    </div>
                </div>

                <div className="relative transform scale-x-[-1] filter hue-rotate-90">
                    <PetDisplay status={battleState === 'FIGHTING' ? 'WALK' : 'IDLE'} size={180} />
                </div>
            </div>

        </div>

        {/* --- CONTROLS / LOGS --- */}
        <div className="flex flex-col items-center justify-center mt-4 min-h-[100px]">
            
            {/* Battle Logs */}
            {battleState !== 'IDLE' && (
                <div className="mb-4 space-y-1 text-center h-16">
                    {log.map((l, i) => (
                        <div key={i} className="text-sm font-bold text-yellow-300 animate-fade-in-up">
                            {l}
                        </div>
                    ))}
                    {battleState === 'FINISHED' && (
                        <div className="text-white text-sm">
                            Your Power: {myPower} vs Enemy: {enemyPower}
                        </div>
                    )}
                </div>
            )}

            {battleState === 'IDLE' && (
                <button 
                    onClick={startBattle}
                    className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-2xl rounded-2xl border-b-8 border-red-900 active:border-b-0 active:translate-y-2 transition-all shadow-lg hover:shadow-red-500/50 hover:scale-105"
                >
                    🔥 FIGHT!
                </button>
            )}

            {battleState === 'FINISHED' && (
                 <div className="flex gap-4">
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">
                        Rematch
                    </button>
                    <button onClick={() => navigate('/my-pet')} className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 border-b-4 border-gray-800 active:border-b-0 active:translate-y-1">
                        Back Home
                    </button>
                 </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Battle;