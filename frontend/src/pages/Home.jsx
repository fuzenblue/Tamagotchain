import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 1. Import ตัวเปลี่ยนหน้า
import PetDisplay from '../components/PetDisplay';

// --- Components ย่อยสำหรับ UI ---

// 1. หลอดพลัง (Pixel Bar)
const PixelBar = ({ label, value, max, color }) => {
  const percentage = Math.max(0, Math.min((value / max) * 100, 100));
  return (
    <div className="flex flex-col w-full mb-2">
      <div className="flex justify-between text-[10px] font-bold uppercase mb-1 text-gray-700 tracking-wider font-mono">
        <span>{label}</span>
        <span>{Math.floor(value)}%</span>
      </div>
      <div className="h-4 bg-gray-300 border-2 border-gray-900 rounded-lg overflow-hidden relative">
        <div
          className={`h-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
        {/* ลายเงาคาดหลอด */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-30"></div>
      </div>
    </div>
  );
};

// 2. ปุ่มด้านข้าง (Side Button)
const SideButton = ({ emoji, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      w-16 h-16 mb-4 flex flex-col items-center justify-center 
      bg-gray-800 border-4 border-gray-900 rounded-xl shadow-lg
      hover:bg-gray-700 active:scale-95 transition-all
      disabled:opacity-50 disabled:cursor-not-allowed
      group relative
    `}
  >
    <span className="text-2xl group-hover:scale-110 transition-transform">{emoji}</span>
    <span className="text-[8px] text-white font-bold mt-1 uppercase">{label}</span>
    <div className="absolute inset-0 border-t-4 border-white opacity-10 rounded-xl pointer-events-none"></div>
  </button>
);

// 3. ช่องใส่อุปกรณ์ (Equipment Slot)
const EquipSlot = () => (
  <div className="w-16 h-16 mb-4 bg-gray-700 border-4 border-gray-900 rounded-xl shadow-inner flex items-center justify-center opacity-50">
    <span className="text-gray-500 text-xs">EMPTY</span>
  </div>
);

// --- Main Dashboard ---
const Dashboard = () => {
  const navigate = useNavigate(); // 👈 2. เรียกใช้ฟังก์ชันนำทาง

  // Stats
  const [hunger, setHunger] = useState(100);
  const [happiness, setHappiness] = useState(80);
  const [energy, setEnergy] = useState(90);
  const [petStatus, setPetStatus] = useState('IDLE');

  // ⏳ ระบบลดค่าพลัง (ปรับให้ช้าลงแล้ว: ลดทีละ 1 ทุกๆ 3 วินาที)
  useEffect(() => {
    const timer = setInterval(() => {
      setHunger((prev) => {
        if (prev <= 0) return 0;
        return Math.max(0, prev - 1); 
      });
    }, 3000); 

    return () => clearInterval(timer);
  }, []);

  // 🏥 ระบบเช็คสถานะ (ป่วย/ตาย)
  useEffect(() => {
    if (hunger <= 0) {
      setPetStatus('DEAD');
    } else if (hunger <= 30) {
      setPetStatus('TIRED');
    } else if (petStatus !== 'EAT' && petStatus !== 'WALK' && petStatus !== 'SLEEP') {
      setPetStatus('IDLE');
    }
  }, [hunger]);

  // Actions Logic
  const handleFeed = () => {
    if (petStatus === 'DEAD') return;
    setPetStatus('EAT');
    setHunger(prev => Math.min(prev + 30, 100)); // เพิ่มเลือด 30
    setTimeout(() => setPetStatus('IDLE'), 2000);
  };

  const handlePlay = () => {
    if (petStatus === 'DEAD') return;
    setPetStatus('WALK');
    setHappiness(prev => Math.min(prev + 20, 100));
    setTimeout(() => setPetStatus('IDLE'), 2000);
  };

  const handleSleep = () => {
    if (petStatus === 'DEAD') return;
    setPetStatus('SLEEP');
    setEnergy(prev => Math.min(prev + 50, 100));
    setTimeout(() => setPetStatus('IDLE'), 3000);
  };

  const handleRevive = () => {
    setHunger(100);
    setPetStatus('IDLE');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-mono select-none">
      
      {/* 📱 กรอบเครื่องเกม */}
      <div className="relative bg-[#Fdfbf7] p-8 rounded-[40px] border-[12px] border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-3xl w-full">
        
        {/* น็อตตกแต่ง */}
        <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-400 flex items-center justify-center"><div className="w-2 h-0.5 bg-gray-400 transform rotate-45"></div></div>
        <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-400 flex items-center justify-center"><div className="w-2 h-0.5 bg-gray-400 transform rotate-45"></div></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-400 flex items-center justify-center"><div className="w-2 h-0.5 bg-gray-400 transform rotate-45"></div></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-400 flex items-center justify-center"><div className="w-2 h-0.5 bg-gray-400 transform rotate-45"></div></div>

        {/* 1. Header: Health Bar ใหญ่ */}
        <div className="flex flex-col items-center mb-6 px-12">
          <h2 className="text-xl font-black text-gray-800 tracking-widest mb-1">HEALTH</h2>
          <div className="w-full max-w-md h-6 bg-gray-800 rounded-full p-1">
             <div 
               className={`h-full rounded-full transition-all duration-500 ${petStatus === 'TIRED' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
               style={{ width: `${hunger}%` }}
             ></div>
          </div>
        </div>

        {/* 2. พื้นที่หลัก (จอ + ปุ่ม) */}
        <div className="flex justify-between items-start gap-6">
          
          {/* ซ้าย: ปุ่มกด Action */}
          <div className="flex flex-col pt-8">
            <SideButton emoji="🍖" label="FEED" onClick={handleFeed} disabled={petStatus === 'DEAD'} />
            <SideButton emoji="💤" label="Sleep" onClick={handleSleep} disabled={petStatus === 'DEAD'} />
            <SideButton emoji="🎮" label="Play" onClick={handlePlay} disabled={petStatus === 'DEAD'} />
            <SideButton emoji="⚔️" label="BATTLE" onClick={() => navigate('/battle')} disabled={petStatus === 'DEAD' || petStatus === 'TIRED'} />
          </div>

          {/* กลาง: หน้าจอ + Stats ย่อย */}
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Stats Bar เล็กๆ */}
            <div className="grid grid-cols-2 gap-4 px-2">
              <PixelBar label="Hunger" value={hunger} max={100} color="bg-yellow-400" />
              <PixelBar label="Happiness" value={happiness} max={100} color="bg-pink-400" />
              <PixelBar label="Energy" value={energy} max={100} color="bg-blue-400" />
              <PixelBar label="Clean" value={100} max={100} color="bg-cyan-400" />
            </div>

            {/* 📺 จอแสดงผลสัตว์เลี้ยง */}
            <div className="relative w-full aspect-[4/3] bg-gray-800 rounded-2xl border-[6px] border-gray-700 shadow-inner overflow-hidden group">
              {/* พื้นหลัง */}
              <div 
                className="absolute inset-0 transition-all duration-1000"
                style={{ 
                  backgroundImage: "url('/assets/pets/bg.png')", 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center',
                  filter: petStatus === 'DEAD' ? 'grayscale(100%) brightness(50%)' : 'none'
                }}
              />
              
              {/* ตัวสัตว์เลี้ยง */}
              <div className="absolute inset-0 flex items-end justify-center pb-6">
                 <PetDisplay status={petStatus} size={180} />
              </div>

              {/* หน้าจอ Game Over */}
              {petStatus === 'DEAD' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                  <span className="text-3xl mb-4">💀</span>
                  <h3 className="text-white text-xl font-bold mb-4 pixel-font">GAME OVER</h3>
                  <button 
                    onClick={handleRevive}
                    className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded border-b-4 border-yellow-700 active:border-b-0 active:mt-1 transition-all"
                  >
                    TRY AGAIN
                  </button>
                </div>
              )}
            </div>
          </div>

        

        </div>

        {/* 3. ล่าง: ปุ่มเมนู */}
        <div className="flex justify-center gap-8 mt-8">
           <button className="flex flex-col items-center gap-1 group">
             <div className="w-12 h-12 rounded-full bg-gray-200 border-4 border-gray-800 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
               🛒
             </div>
             <span className="text-[10px] font-bold text-gray-600">SHOP</span>
           </button>
           <button className="flex flex-col items-center gap-1 group">
             <div className="w-12 h-12 rounded-full bg-gray-200 border-4 border-gray-800 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
               🎒
             </div>
             <span className="text-[10px] font-bold text-gray-600">ITEMS</span>
           </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;