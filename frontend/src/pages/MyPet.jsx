import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 👇 เช็ค Path ให้ตรงกับเครื่องคุณนะครับ
import PixelBar from '../components/common/PixelBar';
import SideButton from '../components/common/SideButton';
import PetDisplay from '../components/PetDisplay';

const MyPet = () => {
    const navigate = useNavigate();

    // --- 1. STATE: ค่าสถานะต่างๆ ---
    const [health, setHealth] = useState(80);      // หลอดเลือดใหญ่
    const [hunger, setHunger] = useState(86);      // ความหิว
    const [happiness, setHappiness] = useState(88); // ความสุข
    const [energy, setEnergy] = useState(98);      // พลังงาน
    const [cleanliness, setCleanliness] = useState(100); // ความสะอาด
    const [petStatus, setPetStatus] = useState('IDLE'); // ท่าทางน้อง

    // --- 2. GAME LOOP: ลดค่าต่างๆ ตามเวลา ---
    useEffect(() => {
        const timer = setInterval(() => {
            // ลดค่า Hunger และ Energy ลงเรื่อยๆ
            setHunger((prev) => Math.max(0, prev - 0.5));
            setEnergy((prev) => Math.max(0, prev - 0.2));
            setCleanliness((prev) => Math.max(0, prev - 2));
            setHealth(Math.floor((hunger + energy) / 2));
        }, 5000); // ทำงานทุกๆ 5 วินาที

        return () => clearInterval(timer); // เคลียร์ timer เมื่อปิดหน้า
    }, [hunger, energy]);

    // --- 3. STATUS LOGIC: เปลี่ยนท่าทางตามค่า stats ---
    useEffect(() => {
        if (hunger <= 0 || health <= 0) {
            setPetStatus('DEAD');
        }else if (hunger <= 30 || energy <= 20 || cleanliness <= 40) { 
            setPetStatus('TIRED');  
        } else if (!['EAT', 'WALK', 'SLEEP'].includes(petStatus)) {
            // ถ้าไม่ได้กำลังทำกิจกรรม ให้กลับเป็นท่ายืนปกติ
            setPetStatus('IDLE');
        }
        // อัปเดต Health พื้นฐานตามความหิว (ตัวอย่างง่ายๆ)
        setHealth(Math.floor((hunger + energy) / 2));
    }, [hunger, energy, health, petStatus]);

    // --- 4. ACTIONS: ฟังก์ชันปุ่มกด ---
    const handleFeed = () => {
        if (petStatus === 'DEAD') return;
        setPetStatus('EAT');
        setHunger(prev => Math.min(prev + 30, 100));
        setTimeout(() => setPetStatus('IDLE'), 2000); // กลับสู่ปกติหลัง 2 วิ
    };

    const handlePlay = () => {
        if (petStatus === 'DEAD' || energy < 5) return;
        setPetStatus('WALK');
        setHappiness(prev => Math.min(prev + 20, 100));
        setEnergy(prev => Math.max(0, prev - 1)); // เล่นแล้วเหนื่อย
        setTimeout(() => setPetStatus('IDLE'), 2000);
    };

    const handleRest = () => {
        if (petStatus === 'DEAD') return;
        setPetStatus('SLEEP');
        setEnergy(prev => Math.min(prev + 40, 100));
        setTimeout(() => setPetStatus('IDLE'), 3000); // นอนนานหน่อย 3 วิ
    };

    const handleClean = () => {
    if (petStatus === 'DEAD') return;
    setPetStatus('WALK'); // หรือท่าทางอื่นตอนอาบน้ำ
    setCleanliness(100);  // รีเซ็ตความสะอาดเต็ม
    setHappiness(prev => Math.min(prev + 10, 100)); // อาบน้ำแล้วมีความสุข
    setTimeout(() => setPetStatus('IDLE'), 2000);
    };
    // --- 5. RENDER UI ---
    return (
        // Container หลัก (จัดกึ่งกลาง)
        <div className="flex items-center justify-center p-4 font-mono select-none w-full h-full">
            
            {/* กรอบเครื่องเกมสีขาว */}
            <div className="relative bg-[#Fdfbf7] p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-[8px] md:border-[12px] border-gray-800 shadow-2xl max-w-4xl w-full">
                
                {/* === HEADER: HEALTH BAR ใหญ่ === */}
                <div className="flex flex-col items-center mb-8 px-4 md:px-12">
                    <h2 className="text-lg md:text-xl font-black text-gray-800 tracking-widest mb-2 uppercase">Health</h2>
                    {/* ใช้ PixelBar แบบปรับแต่งพิเศษสำหรับหลอดใหญ่ */}
                    <div className="w-full max-w-lg h-6 md:h-8 bg-gray-800 rounded-full p-1 border-2 border-gray-900">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 relative overflow-hidden border border-black
                                ${health <= 30 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
                            style={{ width: `${health}%` }}
                        >
                             <div className="absolute top-0 left-0 w-full h-2 bg-white opacity-30 rounded-full"></div>
                        </div>
                    </div>
                    <span className="text-xs font-bold mt-1">{health}%</span>
                </div>

                {/* === MAIN CONTENT: แบ่งเป็น 3 คอลัมน์ === */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    
                    {/* --- COLUMN 1: ปุ่มกดด้านซ้าย (Actions) --- */}
                    <div className="flex flex-row md:flex-col gap-4 justify-center w-full md:w-auto pt-4 order-2 md:order-1">
                        <SideButton emoji="🍖" label="FEED" onClick={handleFeed} disabled={petStatus === 'DEAD'} />
                        <SideButton emoji="🎾" label="PLAY" onClick={handlePlay} disabled={petStatus === 'DEAD' || energy < 10} />
                        <SideButton emoji="💤" label="REST" onClick={handleRest} disabled={petStatus === 'DEAD'} />
                        <SideButton emoji="🚿" label="CLEAN" onClick={handleClean} disabled={petStatus === 'DEAD'} />        
                    </div>

                    {/* --- COLUMN 2: จอภาพและ Stats ย่อย (ตรงกลาง) --- */}
                    <div className="flex-1 w-full order-1 md:order-2">
                        
                        {/* Stats ย่อย 4 หลอด */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4 px-2">
                            <PixelBar label="Hunger" value={hunger} max={100} color="bg-yellow-400" />
                            <PixelBar label="Happiness" value={happiness} max={100} color="bg-pink-400" />
                            <PixelBar label="Energy" value={energy} max={100} color="bg-blue-400" />
                            <PixelBar label="Cleanliness" value={cleanliness} max={100} color="bg-cyan-400" />
                        </div>

                        {/* จอภาพน้องมังกร */}
                        <div className="relative w-full h-[280px] bg-gray-800 rounded-2xl border-[6px] border-gray-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden">
                            {/* Background */}
                            <div 
                                className="absolute inset-0" 
                                style={{ 
                                    backgroundImage: `url('/assets/pets/${cleanliness <= 40 ? 'dustbg.png' : 'bg.png'}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    filter: petStatus === 'DEAD' ? 'grayscale(100%) brightness(50%)' : 'none',
                                    imageRendering: 'pixelated'
                                }} 
                            />
                            
                            {/* ตัวน้องมังกร */}
                            <div className="absolute inset-0 flex items-end justify-center pb-8">
                                {/* ตรวจสอบ Path PetDisplay */}
                                <PetDisplay status={petStatus} size={200} />
                            </div>

                            {/* หน้าจอ Game Over (ถ้าตาย) */}
                            {petStatus === 'DEAD' && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                                    <h3 className="text-red-500 text-2xl font-black mb-4 tracking-widest">GAME OVER</h3>
                                    <button 
                                        onClick={() => { setHunger(100); setEnergy(100); setHealth(100); setPetStatus('IDLE'); }} 
                                        className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 hover:bg-yellow-300"
                                    >
                                        REVIVE (0.01 ETH)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- COLUMN 3: ช่องใส่อุปกรณ์ด้านขวา (Equipment) --- */}
                    <div className="flex flex-row md:flex-col gap-4 justify-center w-full md:w-auto pt-4 order-3">
                         <div className="text-center text-xs font-bold mb-1 md:hidden">EQUIP</div>
                        {/* ช่องว่าง 3 ช่อง */}
                        {[1, 2, 3].map((slot) => (
                            <div key={slot} className="w-16 h-16 bg-gray-300 rounded-xl border-4 border-gray-400 flex items-center justify-center shadow-inner">
                                <span className="text-[8px] text-gray-500 font-bold uppercase">Empty</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* === FOOTER: ปุ่มเมนูด้านล่าง === */}
                <div className="flex justify-center gap-8 mt-8 pt-4 border-t-2 border-gray-200">
                    <button onClick={() => navigate('/battle')} className="flex flex-col items-center group transform hover:scale-110 transition-transform">
                        <div className="w-16 h-16 rounded-full bg-red-600 border-4 border-black flex items-center justify-center group-hover:bg-red-500 text-white text-2xl">⚔️</div>
                        <span className="text-xs font-bold mt-2">BATTLE</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default MyPet;