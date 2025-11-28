import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelBar from '../components/common/PixelBar';
import SideButton from '../components/common/SideButton';
import PetDisplay from '../components/PetDisplay';

const MyPet = () => {
    const navigate = useNavigate();

    // --- 0. NAME SYSTEM: ระบบชื่อ (ใหม่) ---
    // รายชื่อสุ่มเริ่มต้น
    const DEFAULT_NAMES = ["Draco", "Pyro", "Spike", "Falkor", "Smaug", "Yoshi", "Mushue", "Charizard"];
    
    // โหลดชื่อจาก LocalStorage หรือสุ่มใหม่ถ้าไม่มี
    const [petName, setPetName] = useState(() => {
        const savedName = localStorage.getItem('my_pet_name');
        if (savedName) return savedName;
        // สุ่มชื่อ
        const randomName = DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)];
        return randomName;
    });

    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(petName);
    const inputRef = useRef(null);

    // ฟังก์ชันบันทึกชื่อ
    const handleSaveName = () => {
        if (tempName.trim() !== "") {
            setPetName(tempName);
            localStorage.setItem('my_pet_name', tempName); // บันทึกลงเครื่อง
        } else {
            setTempName(petName); // ถ้าชื่อว่าง ให้กลับไปใช้ชื่อเดิม
        }
        setIsEditingName(false);
    };

    // Auto focus เมื่อกดแก้ไข
    useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingName]);


    // --- 1. STATE: ค่าสถานะต่างๆ ---
    const [health, setHealth] = useState(80);      
    const [hunger, setHunger] = useState(86);      
    const [happiness, setHappiness] = useState(88); 
    const [energy, setEnergy] = useState(98);      
    const [cleanliness, setCleanliness] = useState(100); 
    const [petStatus, setPetStatus] = useState('IDLE'); 

    // --- 2. GAME LOOP: ลดค่าต่างๆ ตามเวลา ---
    useEffect(() => {
        const timer = setInterval(() => {
            setHunger((prev) => Math.max(0, prev - 1.0));     
            setEnergy((prev) => Math.max(0, prev - 1.0));     
            setHappiness((prev) => Math.max(0, prev - 0.5));  
            setCleanliness((prev) => Math.max(0, prev - 2.0));
            setHealth(Math.floor((hunger + energy) / 2));
        }, 5000); 

        return () => clearInterval(timer); 
    }, [hunger, energy, happiness]);

    // --- 3. STATUS LOGIC ---
    useEffect(() => {
        if (hunger <= 0 || health <= 0) {
            setPetStatus('DEAD');
        } else if (hunger <= 30 || energy <= 20 || cleanliness <= 40) { 
            setPetStatus('TIRED');  
        } else if (!['EAT', 'WALK', 'SLEEP'].includes(petStatus)) {
            setPetStatus('IDLE');
        }
    }, [hunger, energy, cleanliness, health, petStatus]);

    // --- 4. ACTIONS ---
    const handleFeed = () => {
        if (petStatus === 'DEAD') return;
        setPetStatus('EAT');
        setHunger(prev => Math.min(prev + 30, 100));
        setTimeout(() => setPetStatus('IDLE'), 2000);
    };

    const handlePlay = () => {
        if (petStatus === 'DEAD' || energy < 5) return;
        setPetStatus('WALK');
        setHappiness(prev => Math.min(prev + 20, 100)); 
        setEnergy(prev => Math.max(0, prev - 5)); 
        setTimeout(() => setPetStatus('IDLE'), 2000);
    };

    const handleRest = () => {
        if (petStatus === 'DEAD') return;
        setPetStatus('SLEEP');
        setEnergy(prev => Math.min(prev + 40, 100)); 
        setTimeout(() => setPetStatus('IDLE'), 3000); 
    };

    const handleClean = () => {
        if (petStatus === 'DEAD') return;
        setPetStatus('WALK'); 
        setCleanliness(100);  
        setHappiness(prev => Math.min(prev + 10, 100)); 
        setTimeout(() => setPetStatus('IDLE'), 2000);
    };

    const renderBuffBadge = (val, icon, text) => {
        if (val < 90) return null; 
        return (
            <span className="absolute -top-3 right-0 bg-yellow-400 text-black text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded border border-black animate-bounce z-10 whitespace-nowrap">
                {icon} {text}
            </span>
        );
    };

    // --- 5. RENDER UI ---
    return (
        <div className="flex items-center justify-center p-4 font-mono select-none w-full h-full">
            
            <div className="relative bg-[#Fdfbf7] p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-[8px] md:border-[12px] border-gray-800 shadow-2xl max-w-4xl w-full">
                
                {/* === HEADER: NAME & HEALTH === */}
                <div className="flex flex-col items-center mb-6 px-4 md:px-12">
                    
                    {/* 👇👇👇 NAME DISPLAY / EDIT AREA 👇👇👇 */}
                    <div className="mb-4 flex items-center gap-2">
                        {isEditingName ? (
                            <div className="flex items-center border-b-2 border-black pb-1">
                                <input 
                                    ref={inputRef}
                                    type="text" 
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    maxLength={12}
                                    className="text-2xl font-black text-gray-800 bg-transparent outline-none text-center w-40 uppercase"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                />
                                <button onClick={handleSaveName} className="text-green-600 hover:text-green-500 ml-2">
                                    ✅
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center group cursor-pointer" onClick={() => { setTempName(petName); setIsEditingName(true); }}>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-widest uppercase relative">
                                    {petName}
                                </h1>
                                <span className="ml-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                                    ✏️
                                </span>
                            </div>
                        )}
                    </div>
                    {/* 👆👆👆 END NAME AREA 👆👆👆 */}

                    <h2 className="text-xs font-bold text-gray-400 tracking-widest mb-1 uppercase">Total Health</h2>
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

                {/* === MAIN CONTENT === */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    
                    {/* LEFT: ACTIONS */}
                    <div className="flex flex-row md:flex-col gap-4 justify-center w-full md:w-auto pt-4 order-2 md:order-1">
                        <SideButton emoji="🍖" label="FEED" onClick={handleFeed} disabled={petStatus === 'DEAD'} />
                        <SideButton emoji="🎾" label="PLAY" onClick={handlePlay} disabled={petStatus === 'DEAD' || energy < 10} />
                        <SideButton emoji="💤" label="REST" onClick={handleRest} disabled={petStatus === 'DEAD'} />
                        <SideButton emoji="🚿" label="CLEAN" onClick={handleClean} disabled={petStatus === 'DEAD'} />        
                    </div>

                    {/* CENTER: SCREEN & STATS */}
                    <div className="flex-1 w-full order-1 md:order-2">
                        
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4 px-2">
                            <div className="relative">
                                {renderBuffBadge(hunger, '⚔️', '+DMG')}
                                <PixelBar label="Hunger" value={hunger} max={100} color="bg-yellow-400" />
                            </div>
                            <div className="relative">
                                {renderBuffBadge(happiness, '💥', '+CRIT')}
                                <PixelBar label="Happiness" value={happiness} max={100} color="bg-pink-400" />
                            </div>
                            <div className="relative">
                                {renderBuffBadge(energy, '⚡', 'READY')}
                                <PixelBar label="Energy" value={energy} max={100} color="bg-blue-400" />
                            </div>
                            <div className="relative">
                                <PixelBar label="Cleanliness" value={cleanliness} max={100} color="bg-cyan-400" />
                            </div>
                        </div>

                        <div className="relative w-full h-[280px] bg-gray-800 rounded-2xl border-[6px] border-gray-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden">
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
                            
                            <div className="absolute inset-0 flex items-end justify-center pb-8">
                                <PetDisplay status={petStatus} size={200} />
                            </div>

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

                    {/* RIGHT: EQUIPMENT */}
                    <div className="flex flex-row md:flex-col gap-4 justify-center w-full md:w-auto pt-4 order-3">
                         <div className="text-center text-xs font-bold mb-1 md:hidden">EQUIP</div>
                        {[1, 2, 3].map((slot) => (
                            <div key={slot} className="w-16 h-16 bg-gray-300 rounded-xl border-4 border-gray-400 flex items-center justify-center shadow-inner">
                                <span className="text-[8px] text-gray-500 font-bold uppercase">Empty</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER: BATTLE */}
                <div className="flex justify-center gap-8 mt-8 pt-4 border-t-2 border-gray-200">
                    <button 
                        onClick={() => navigate('/battle', { 
                            state: { 
                                playerHealth: health,
                                hunger: hunger,
                                happiness: happiness,
                                energy: energy 
                            } 
                        })} 
                        disabled={petStatus === 'DEAD'}
                        className="flex flex-col items-center group transform hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-600 border-4 border-black flex items-center justify-center group-hover:bg-red-500 text-white text-2xl relative">
                            ⚔️
                            {(hunger >= 90 || happiness >= 90) && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border border-black animate-ping"></div>
                            )}
                        </div>
                        <span className="text-xs font-bold mt-2">BATTLE</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default MyPet;