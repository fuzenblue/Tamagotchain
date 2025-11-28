import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PetDisplay from '../components/PetDisplay';

const Battle = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. รับค่า Stats จากหน้า MyPet ---
  const { 
    playerHealth = 80, 
    hunger = 50, 
    happiness = 50, 
    energy = 50,
    petName = "MY PET" // รับชื่อมาด้วย (ถ้ามี)
  } = location.state || {}; // กัน Crash กรณีเข้าลิงก์ตรงๆ

  // --- 2. State การต่อสู้ ---
  const [battleState, setBattleState] = useState('IDLE'); // IDLE, FIGHTING, FINISHED
  const [myPower, setMyPower] = useState(playerHealth);   // พลังโชว์หน้า UI
  const [enemyPower, setEnemyPower] = useState(0);        // พลังศัตรู
  const [winner, setWinner] = useState(null);
  const [logs, setLogs] = useState([]);

  // ตั้งชื่อศัตรูสุ่ม
  const ENEMY_NAMES = ["Dark Dragon", "Shadow Fang", "Void Beast", "Crimson Eye"];
  const [enemyName] = useState(ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)]);

  // --- 3. Logic คำนวณพลัง (หัวใจสำคัญ) ---
  const calculateCombatPower = () => {
    let power = playerHealth;
    let battleLogs = [`Base Health Power: ${power}`];

    // 🍖 Hunger Buff
    if (hunger >= 90) {
      power += 15;
      battleLogs.push("🍖 Well Fed: Attack +15");
    }

    // 💖 Happiness Crit (โอกาส 40%)
    if (happiness >= 90) {
      const isCrit = Math.random() < 0.4;
      if (isCrit) {
        power += 30;
        battleLogs.push("💖 CRITICAL HIT! Power +30");
      } else {
        battleLogs.push("💖 High Spirit: Crit missed...");
      }
    }

    // 💤 Energy Debuff
    if (energy < 30) {
      power -= 20;
      battleLogs.push("💤 Exhausted: Power -20");
    }

    // 🔒 จำกัดเพดานที่ 100 (ตาม Logic เกม)
    const finalPower = Math.max(0, Math.min(100, power));
    
    // ถ้าพลังเกิน 100 จริงๆ ให้ Log บอกว่า Maxed out
    if (power > 100) battleLogs.push("🔥 POWER OVERFLOW! Capped at 100");

    return { finalPower, battleLogs };
  };

  // --- 4. เริ่มการต่อสู้ ---
  const startBattle = () => {
    setBattleState('FIGHTING');
    setLogs([]); // เคลียร์ Log เก่า

    // 4.1 คำนวณพลังเรา
    const { finalPower, battleLogs } = calculateCombatPower();
    
    // 4.2 คำนวณพลังศัตรู (ให้สูสีกับเลือดตั้งต้นเรา +/- 15)
    // สุ่มพลังศัตรูระหว่าง playerHealth-15 ถึง playerHealth+15
    let enemyBase = playerHealth + (Math.floor(Math.random() * 31) - 15);
    // จำกัดพลังศัตรูที่ 100 เช่นกัน
    const finalEnemyPower = Math.max(0, Math.min(100, enemyBase));

    // 4.3 อัปเดต State เพื่อแสดงผล
    setMyPower(finalPower);
    setEnemyPower(finalEnemyPower);
    setLogs(battleLogs);

    // 4.4 รอ Animation 2.5 วินาที แล้วตัดสิน
    setTimeout(() => {
      determineWinner(finalPower, finalEnemyPower);
      setBattleState('FINISHED');
    }, 2500);
  };

  // --- 5. ตัดสินแพ้ชนะ & บันทึกผล ---
  const determineWinner = (myP, enemyP) => {
    let result = 'DRAW';
    if (myP > enemyP) result = 'PLAYER';
    else if (myP < enemyP) result = 'ENEMY';

    setWinner(result);

    // บันทึก History ลง LocalStorage
    saveHistory(result, myP, enemyP);

    // อัปเดต Global Stats (Leaderboard)
    if (result === 'PLAYER') {
      updateLeaderboardStats();
    }
  };

  const saveHistory = (result, myP, enemyP) => {
    const historyItem = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      result: result === 'PLAYER' ? 'WIN' : result === 'ENEMY' ? 'LOSE' : 'DRAW',
      enemyName: enemyName,
      myPower: myP,
      enemyPower: enemyP,
      reward: result === 'PLAYER' ? '0.05 ETH' : '0'
    };

    const existingHistory = JSON.parse(localStorage.getItem('battle_history')) || [];
    // เก็บแค่ 20 รายการล่าสุด
    const newHistory = [historyItem, ...existingHistory].slice(0, 20);
    localStorage.setItem('battle_history', JSON.stringify(newHistory));
  };

  const updateLeaderboardStats = () => {
    const stats = JSON.parse(localStorage.getItem('tamagotchain_stats')) || { wins: 0, eth: 0 };
    stats.wins += 1;
    stats.eth = parseFloat((stats.eth + 0.05).toFixed(4));
    localStorage.setItem('tamagotchain_stats', JSON.stringify(stats));
    // Trigger ให้ Sidebar อัปเดตเงินทันที (ถ้ามี)
    window.dispatchEvent(new Event('storage'));
  };

  // --- UI Helpers ---
  const getBarColor = (val) => {
    if (val >= 80) return 'bg-green-500 shadow-[0_0_10px_#22c55e]';
    if (val >= 40) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black font-mono select-none">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
            backgroundImage: "url('/assets/pets/btbg.png')",
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            filter: 'brightness(40%)'
        }}
      />

      <div className="w-full max-w-5xl relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tracking-widest drop-shadow-sm uppercase">
                BATTLE ARENA
            </h1>
            
            {/* Buff Indicators (แสดงก่อนสู้) */}
            <div className="flex gap-4 justify-center mt-4">
                <div className={`px-3 py-1 rounded text-xs font-bold border ${hunger >= 90 ? 'bg-green-900/50 border-green-400 text-green-400' : 'bg-gray-800/50 border-gray-600 text-gray-500'}`}>
                    🍖 Hunger {hunger >= 90 ? '≥90 (+15 ATK)' : '<90'}
                </div>
                <div className={`px-3 py-1 rounded text-xs font-bold border ${happiness >= 90 ? 'bg-pink-900/50 border-pink-400 text-pink-400' : 'bg-gray-800/50 border-gray-600 text-gray-500'}`}>
                    💖 Happy {happiness >= 90 ? '≥90 (+Crit)' : '<90'}
                </div>
                <div className={`px-3 py-1 rounded text-xs font-bold border ${energy < 30 ? 'bg-red-900/50 border-red-400 text-red-400' : 'bg-blue-900/50 border-blue-400 text-blue-400'}`}>
                    ⚡ Energy {energy < 30 ? '<30 (-20 Penalty)' : 'Normal'}
                </div>
            </div>
        </div>

        {/* BATTLE FIELD */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end min-h-[350px] px-4 md:px-12 pb-8 relative gap-8">
            
            {/* --- PLAYER SIDE --- */}
            <div className={`
                flex flex-col items-center transition-all duration-500 order-2 md:order-1 relative
                ${battleState === 'FIGHTING' ? 'translate-x-0 md:translate-x-[100px] scale-110' : ''} 
                ${winner === 'ENEMY' ? 'grayscale opacity-50 blur-[2px]' : ''}
            `}>
                <div className="mb-4 text-center bg-gray-900/80 p-4 rounded-2xl border-2 border-blue-500/50 backdrop-blur-md shadow-xl w-48">
                    <div className="text-blue-300 font-bold mb-2 text-lg uppercase truncate">{petName}</div>
                    
                    {/* Power Bar */}
                    <div className="w-full h-3 bg-gray-700 rounded-full mb-2 overflow-hidden border border-gray-600">
                        <div style={{width: `${battleState === 'IDLE' ? playerHealth : myPower}%`}} className={`h-full transition-all duration-1000 ${getBarColor(battleState === 'IDLE' ? playerHealth : myPower)}`}></div>
                    </div>
                    
                    <div className="text-white text-3xl font-black">
                        {battleState === 'IDLE' ? playerHealth : myPower}
                        <span className="text-[10px] font-normal text-gray-400 block tracking-widest uppercase mt-1">Combat Power</span>
                    </div>
                </div>

                <div className="relative">
                    <PetDisplay status={battleState === 'FIGHTING' ? 'WALK' : 'IDLE'} size={180} />
                    {/* Visual Effect: Ready Aura */}
                    {battleState === 'IDLE' && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-blue-500/30 blur-xl rounded-full animate-pulse"></div>}
                </div>
            </div>

            {/* --- VS / RESULT CENTER --- */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full text-center pointer-events-none">
                {battleState === 'FIGHTING' ? (
                     <div className="text-8xl animate-ping opacity-90 drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]">⚔️</div>
                ) : battleState === 'FINISHED' ? (
                    <div className="flex flex-col items-center animate-bounce-in">
                        <div className={`text-6xl md:text-8xl font-black drop-shadow-[0_5px_5px_rgba(0,0,0,1)] 
                            ${winner === 'PLAYER' ? 'text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-600' : 
                              winner === 'ENEMY' ? 'text-red-600' : 'text-gray-300'}`}>
                            {winner === 'PLAYER' ? 'VICTORY!' : winner === 'ENEMY' ? 'DEFEATED' : 'DRAW'}
                        </div>
                    </div>
                ) : (
                    <div className="text-7xl font-black text-white/10 italic pr-4">VS</div>
                )}
            </div>

            {/* --- ENEMY SIDE --- */}
            <div className={`
                flex flex-col items-center transition-all duration-500 order-1 md:order-3 relative
                ${battleState === 'FIGHTING' ? 'translate-x-0 md:-translate-x-[100px] scale-110' : ''}
                ${winner === 'PLAYER' ? 'grayscale opacity-50 blur-[2px]' : ''}
            `}>
                <div className="mb-4 text-center bg-gray-900/80 p-4 rounded-2xl border-2 border-red-500/50 backdrop-blur-md shadow-xl w-48">
                    <div className="text-red-300 font-bold mb-2 text-lg uppercase truncate">{enemyName}</div>
                    
                    {/* Enemy Power Bar */}
                     <div className="w-full h-3 bg-gray-700 rounded-full mb-2 overflow-hidden border border-gray-600">
                        <div style={{width: `${battleState === 'IDLE' ? 100 : enemyPower}%`}} className="h-full bg-red-500 transition-all duration-1000"></div>
                    </div>

                    <div className="text-white text-3xl font-black">
                        {battleState === 'IDLE' ? '???' : enemyPower}
                        <span className="text-[10px] font-normal text-gray-400 block tracking-widest uppercase mt-1">Power</span>
                    </div>
                </div>

                <div className="relative transform scale-x-[-1] filter hue-rotate-[280deg] saturate-50">
                    <PetDisplay status={battleState === 'FIGHTING' ? 'WALK' : 'IDLE'} size={180} />
                    {battleState === 'IDLE' && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-red-500/30 blur-xl rounded-full animate-pulse"></div>}
                </div>
            </div>

        </div>

        {/* --- CONTROLS / LOGS AREA --- */}
        <div className="flex flex-col items-center justify-center mt-6 min-h-[120px]">
            
            {/* Logs: แสดงเฉพาะตอนสู้หรือจบแล้ว */}
            {battleState !== 'IDLE' && (
                <div className="mb-6 space-y-1 text-center bg-black/40 p-4 rounded-xl border border-white/10 w-full max-w-md backdrop-blur-sm">
                    {logs.map((l, i) => (
                        <div key={i} className="text-xs md:text-sm font-bold text-yellow-300 animate-fade-in-up">
                            {l}
                        </div>
                    ))}
                    {battleState === 'FINISHED' && winner === 'PLAYER' && (
                        <div className="text-green-400 font-bold mt-2 pt-2 border-t border-white/20">
                            Reward Received: +0.05 ETH 💰
                        </div>
                    )}
                </div>
            )}

            {/* Button: FIGHT */}
            {battleState === 'IDLE' && (
                <button 
                    onClick={startBattle}
                    className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-2xl rounded-2xl border-b-8 border-red-900 active:border-b-0 active:translate-y-2 transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-105 hover:brightness-110"
                >
                    🔥 FIGHT NOW!
                </button>
            )}

            {/* Buttons: Result Actions */}
            {battleState === 'FINISHED' && (
                 <div className="flex gap-4">
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 shadow-lg">
                        🔄 Rematch
                    </button>
                    <button onClick={() => navigate('/my-pet')} className="px-6 py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-500 border-b-4 border-gray-800 active:border-b-0 active:translate-y-1 shadow-lg">
                        🏠 Home
                    </button>
                    <button onClick={() => navigate('/battle-history')} className="px-6 py-3 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-500 border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1 shadow-lg">
                        📜 History
                    </button>
                 </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Battle;