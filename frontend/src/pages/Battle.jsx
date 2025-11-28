import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PetDisplay from '../components/PetDisplay';


const Battle = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. รับค่า Stats ---
  const { 
    playerHealth = 100, 
    hunger = 80, 
    happiness = 80, 
    energy = 80 
  } = location.state || {};

<<<<<<< HEAD
  // พลังเรา = เลือดปัจจุบัน
  const [myEnergy] = useState(currentHp); 
  
  // --- 2. คำนวณพลังศัตรู (แบบสุ่มแฟร์ๆ Max 100) ---
  const [enemyEnergy] = useState(() => {
      
      let randomDiff = Math.floor(Math.random() * 41) - 20; 
      let enemyPower = currentHp + randomDiff;

      
      return Math.max(0, Math.min(100, enemyPower)); 
=======
  // --- 2. คำนวณพลังต่อสู้ (แก้ให้ไม่เกิน 100) ---
  const calculateCombatPower = (hp, hg, hpn, en) => {
    let power = hp; 
    
    // Logic: Buffs
    const attackBonus = hg >= 80 ? 15 : 0;      
    const critBonus = hpn >= 90 ? (Math.random() < 0.3 ? 30 : 0) : 0; 
    const dodgePenalty = en < 30 ? -20 : 0;      

    // คำนวณผลรวม
    const totalPower = Math.floor(power + attackBonus + critBonus + dodgePenalty);

    // 👇👇👇 แก้ไขจุดที่ 1: ใส่ Math.min(100, ...) เพื่อไม่ให้เกิน 100 👇👇👇
    return Math.max(0, Math.min(100, totalPower));
  };

  const [myStats] = useState({ health: playerHealth, hunger, happiness, energy });
  const [myPower, setMyPower] = useState(0); 

  // --- แก้ไขจุดที่ 2: ปรับพลังศัตรูให้ไม่เกิน 100 เช่นกัน ---
  const [enemyPower] = useState(() => {
    // ฐานพลังศัตรู (ลดความโหดลงหน่อยเพื่อให้สมดุลกับเพดาน 100)
    const baseEnemy = playerHealth + (Math.floor(Math.random() * 21) - 10); // +/- 10 พอ
    const randomBonus = Math.floor(Math.random() * 15); 
    
    // 👇 Limit ที่ 100
    return Math.max(0, Math.min(100, baseEnemy + randomBonus)); 
>>>>>>> 2d40926547477ee389b3af8a8d9a94215f96bab3
  });

  const [battleState, setBattleState] = useState('IDLE');
  const [winner, setWinner] = useState(null);
  const [log, setLog] = useState([]); 


  // --- 3. ฟังก์ชันเริ่มต่อสู้ ---
  const startBattle = () => {
    setBattleState('FIGHTING');
    setLog([]); 

    const finalMyPower = calculateCombatPower(myStats.health, myStats.hunger, myStats.happiness, myStats.energy);
    setMyPower(finalMyPower);

    const battleLogs = [];
    // ปรับข้อความ Log ให้สื่อความหมายว่าพลังตันที่ 100
    if (finalMyPower === 100) battleLogs.push("🔥 MAX POWER REACHED (100)!");
    if (myStats.hunger >= 80) battleLogs.push("🍖 Fed Well: Power Boosted");
    if (myStats.happiness >= 90) battleLogs.push("💖 Lucky: Critical Hit Chance");
    if (myStats.energy < 30) battleLogs.push("💤 Tired: Power Reduced");
    setLog(battleLogs);

    setTimeout(() => {
<<<<<<< HEAD
        let result; // <--- FIX 1: ประกาศตัวแปร result ก่อนใช้
        const currentStats = JSON.parse(localStorage.getItem('tamagotchain_stats')) || { wins: 0, eth: 0 };
        let netEthChange = 0; // ตัวแปรใหม่: ติดตามการเปลี่ยนแปลง ETH สุทธิ (กำไร/ขาดทุน)

        // ตัดสินผล
        if (myEnergy > enemyEnergy) {
            setWinner('PLAYER');
            result = 'WIN'; 
            netEthChange = 0.018; // (Win: 0.018 ETH) 
            
            // บันทึกสถิติชนะและ ETH
            const newStats = {
                wins: currentStats.wins + 1,
                eth: parseFloat(currentStats.eth) + netEthChange // Apply net change
            };
            localStorage.setItem('tamagotchain_stats', JSON.stringify(newStats));
            window.dispatchEvent(new Event('storage'));

        } else if (myEnergy < enemyEnergy) {
            setWinner('ENEMY');
            result = 'LOSE'; 
            netEthChange = -0.01; // (Lose: -0.01 ETH) 

            // บันทึกสถิติแพ้ (หัก ETH)
            const newStats = {
                wins: currentStats.wins,
                eth: parseFloat(currentStats.eth) + netEthChange // Apply net change (ติดลบ)
            };
            localStorage.setItem('tamagotchain_stats', JSON.stringify(newStats));
            window.dispatchEvent(new Event('storage'));

        } else {
            setWinner('DRAW'); 
            result = 'DRAW'; 
            netEthChange = 0; // Assume Draw means no change in ETH

            // บันทึกสถิติ Draw 
            const newStats = {
                wins: currentStats.wins,
                eth: parseFloat(currentStats.eth) + netEthChange
            };
            localStorage.setItem('tamagotchain_stats', JSON.stringify(newStats));
            window.dispatchEvent(new Event('storage'));
        }

        // --- บันทึกประวัติการต่อสู้ ---
        const history = JSON.parse(localStorage.getItem('battle_history')) || [];
        history.unshift({
            result, // ใช้ result ที่ถูกกำหนดค่าแล้ว
            myPower: myEnergy,
            enemyPower: enemyEnergy,
            netEthChange: netEthChange, // <--- FIX 3: บันทึกการเปลี่ยนแปลง ETH สำหรับ Earnings Dashboard
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('battle_history', JSON.stringify(history));
    
        setBattleState('FINISHED'); // โค้ดจะรันถึงบรรทัดนี้ได้แน่นอน
=======
      if (finalMyPower > enemyPower) {
        setWinner('PLAYER');
        saveWinRecord();
      } else if (finalMyPower < enemyPower) {
        setWinner('ENEMY');
      } else {
        setWinner('DRAW');
      }
      setBattleState('FINISHED');
>>>>>>> 2d40926547477ee389b3af8a8d9a94215f96bab3
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
<<<<<<< HEAD
            <p className="text-white mt-2 text-lg font-mono bg-black/50 inline-block px-4 rounded">
                Fair Fight Mode (Max 100)
            </p>
            {/* ปุ่ม Battle History */}
            <button 
                
                onClick={() => navigate('/battle-history')} 
                className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors border-b-2 border-gray-700"
                disabled={battleState === 'FIGHTING'} // ป้องกันการกดระหว่าง Animation ต่อสู้
            >
                📜 Battle History
            </button>
            {/* สิ้นสุดปุ่ม Battle History */}
=======
            <div className="flex gap-4 justify-center mt-2 text-xs md:text-sm text-gray-300">
                <span className={myStats.hunger >= 80 ? "text-green-400 font-bold" : ""}>🍖 Hunger &gt; 80 = Buff</span>
                <span className={myStats.happiness >= 90 ? "text-pink-400 font-bold" : ""}>💖 Happy &gt; 90 = Crit</span>
            </div>
>>>>>>> 2d40926547477ee389b3af8a8d9a94215f96bab3
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
                    
                    {/* Health Bar (แสดงผลตาม myPower ที่คำนวณแล้ว) */}
                    <div className="w-32 h-2 bg-gray-700 rounded-full mb-1 overflow-hidden border border-gray-600">
                        {/* ใช้ myPower แทน myStats.health เพื่อให้เห็นผลของการบัฟในการต่อสู้ */}
                        <div style={{width: `${battleState === 'IDLE' ? myStats.health : myPower}%`}} className="h-full bg-green-500 transition-all duration-1000"></div>
                    </div>
                    
                    <div className="text-white text-2xl font-black mt-2">
                        {battleState === 'IDLE' ? 'Ready?' : myPower} 
                        <span className="text-xs font-normal text-gray-400 block">Combat Power</span>
                    </div>
                </div>

                <div className="relative">
                    <PetDisplay status={battleState === 'FIGHTING' ? 'WALK' : 'IDLE'} size={180} />
                    {battleState === 'FIGHTING' && myStats.hunger >= 80 && (
                        <div className="absolute -top-5 right-0 text-2xl animate-bounce">🔥</div>
                    )}
                </div>
            </div>

            {/* --- VS / LOGS --- */}
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
                    <div className="text-red-300 font-bold mb-1 text-xl">RIVAL</div>
                    
                    {/* Enemy Bar (เพิ่มหลอดเลือดศัตรูให้ดูสมจริง) */}
                     <div className="w-32 h-2 bg-gray-700 rounded-full mb-1 overflow-hidden border border-gray-600">
                        <div style={{width: `${battleState === 'IDLE' ? 100 : enemyPower}%`}} className="h-full bg-red-500 transition-all duration-1000"></div>
                    </div>

                    <div className="text-white text-2xl font-black mt-2">
                        {battleState === 'IDLE' ? '???' : enemyPower}
                        <span className="text-xs font-normal text-gray-400 block">Power</span>
                    </div>
                </div>

                <div className="relative transform scale-x-[-1] filter hue-rotate-90">
                    <PetDisplay status={battleState === 'FIGHTING' ? 'WALK' : 'IDLE'} size={180} />
                </div>
            </div>

        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col items-center justify-center mt-4 min-h-[100px]">
            {battleState !== 'IDLE' && (
                <div className="mb-4 space-y-1 text-center h-16">
                    {log.map((l, i) => (
                        <div key={i} className="text-sm font-bold text-yellow-300 animate-fade-in-up">
                            {l}
                        </div>
                    ))}
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