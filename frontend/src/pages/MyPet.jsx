import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import PixelBar from '../components/common/PixelBar';
import SideButton from '../components/common/SideButton';
import PetDisplay from '../components/PetDisplay';

// --- CONFIGURATION ---
const COOLDOWN_MS = 60 * 1000;         // Cooldown ระหว่างกด (1 นาที)
const ACTION_REGEN_MS = 60 * 60 * 1000; // Play/Rest รีเจนทุก 1 ชั่วโมง
const FOOD_REGEN_MS = 30 * 60 * 1000;  // อาหารรีเจนทุก 30 นาที

const MAX_FOOD = 3;    // อาหารเก็บได้ 3
const MAX_ACTION = 5;  // Play/Rest เก็บได้ 5

// Costs
const SKIP_COOLDOWN_COST = 0.005; // จ่ายข้ามคูลดาวน์
const REFILL_COST = 0.01;         // จ่ายเติมแต้ม (Food/Play/Rest)

const MyPet = () => {
    const navigate = useNavigate();

    // --- 0. BASIC SETUP ---
    const DEFAULT_NAMES = ["Draco", "Pyro", "Spike", "Falkor", "Smaug"];
    const [petName, setPetName] = useState(() => localStorage.getItem('my_pet_name') || DEFAULT_NAMES[0]);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(petName);
    const inputRef = useRef(null);
    const [notification, setNotification] = useState(null);

    // --- CONFIRM MODAL ---
    const [confirmData, setConfirmData] = useState(null); // { mode, type, cost, msg }

    // --- 1. STATS STATE ---
    const [health, setHealth] = useState(80);      
    const [hunger, setHunger] = useState(86);      
    const [happiness, setHappiness] = useState(88); 
    const [energy, setEnergy] = useState(98);      
    const [cleanliness, setCleanliness] = useState(100); 
    const [petStatus, setPetStatus] = useState('IDLE'); 

    // --- 2. INVENTORY & TIMERS STATE ---
    
    // 🍔 Food Stock
    const [foodStock, setFoodStock] = useState(() => {
        const saved = localStorage.getItem('pet_food_stock');
        return saved ? JSON.parse(saved) : { count: 3, lastRegen: Date.now() };
    });

    // ⚡ Action Stocks (Play/Rest) - Start with 5
    const [actionStock, setActionStock] = useState(() => {
        const saved = localStorage.getItem('pet_action_stock');
        return saved ? JSON.parse(saved) : { 
            play: 5, lastRegenPlay: Date.now(),
            rest: 5, lastRegenRest: Date.now() 
        };
    });

    // ⏱️ Cooldown Timers (Last used time)
    const [lastActionTime, setLastActionTime] = useState(() => {
        const saved = localStorage.getItem('pet_cooldowns');
        return saved ? JSON.parse(saved) : { play: 0, rest: 0 };
    });

    // Save Data
    useEffect(() => {
        localStorage.setItem('pet_food_stock', JSON.stringify(foodStock));
        localStorage.setItem('pet_action_stock', JSON.stringify(actionStock));
        localStorage.setItem('pet_cooldowns', JSON.stringify(lastActionTime));
    }, [foodStock, actionStock, lastActionTime]);

    // --- 3. HELPER FUNCTIONS ---
    const showToast = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const getHealthColor = (hp) => {
        if (hp > 60) return 'bg-green-500';
        if (hp > 30) return 'bg-yellow-400';
        return 'bg-red-600 animate-pulse';
    };

    const processPayment = (amount) => {
        const stats = JSON.parse(localStorage.getItem('tamagotchain_stats')) || { eth: 0 };
        if (stats.eth < amount) return false;
        stats.eth = parseFloat((stats.eth - amount).toFixed(4));
        localStorage.setItem('tamagotchain_stats', JSON.stringify(stats));
        window.dispatchEvent(new Event('storage')); 
        return true;
    };

    // --- 4. GAME LOOP & REGEN SYSTEM ---
    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();

            // 1. REGEN FOOD (Every 30m)
            if (foodStock.count < MAX_FOOD) {
                if (now - foodStock.lastRegen >= FOOD_REGEN_MS) {
                    setFoodStock(prev => ({
                        count: Math.min(MAX_FOOD, prev.count + 1),
                        lastRegen: now
                    }));
                    showToast("Food +1 (Auto Regen)");
                }
            }

            // 2. REGEN PLAY (Every 60m)
            if (actionStock.play < MAX_ACTION) {
                if (now - actionStock.lastRegenPlay >= ACTION_REGEN_MS) {
                    setActionStock(prev => ({
                        ...prev,
                        play: Math.min(MAX_ACTION, prev.play + 1),
                        lastRegenPlay: now
                    }));
                    showToast("Play Energy +1 (Auto Regen)");
                }
            }

            // 3. REGEN REST (Every 60m)
            if (actionStock.rest < MAX_ACTION) {
                if (now - actionStock.lastRegenRest >= ACTION_REGEN_MS) {
                    setActionStock(prev => ({
                        ...prev,
                        rest: Math.min(MAX_ACTION, prev.rest + 1),
                        lastRegenRest: now
                    }));
                    showToast("Rest Energy +1 (Auto Regen)");
                }
            }

            // 4. STAT DECAY
            setHunger(prev => Math.max(0, prev - 1.0));     
            setEnergy(prev => Math.max(0, prev - 1.0));
            setCleanliness(prev => Math.max(0, prev - 2.0));
            
            let happyDecay = 0.5;
            if (cleanliness < 40) happyDecay = 1.5;
            setHappiness(prev => Math.max(0, prev - happyDecay));  
            setHealth(Math.floor((hunger + energy) / 2));

        }, 5000); 

        return () => clearInterval(timer); 
    }, [hunger, energy, happiness, cleanliness, foodStock, actionStock]);

    // Status Logic
    useEffect(() => {
        if (hunger <= 0 || health <= 0) {
            setPetStatus('DEAD');
        } else if (hunger <= 30 || energy <= 20 || cleanliness <= 40) { 
            setPetStatus('TIRED');  
        } else if (!['EAT', 'WALK', 'SLEEP'].includes(petStatus)) {
            setPetStatus('IDLE');
        }
    }, [hunger, energy, cleanliness, health, petStatus]);


    // --- 5. ACTION LOGIC ---

    // 🍔 FEED: Stock System
    const handleFeedClick = () => {
        if (petStatus === 'DEAD') return;

        if (foodStock.count > 0) {
            // ✅ Free
            setFoodStock(prev => ({ ...prev, count: prev.count - 1 }));
            setPetStatus('EAT');
            setHunger(prev => Math.min(prev + 30, 100));
            showToast(`Yummy! (+30 Hunger)`);
            setTimeout(() => setPetStatus('IDLE'), 2000);
        } else {
            // ❌ Empty -> Buy
            const minsLeft = Math.ceil((FOOD_REGEN_MS - (Date.now() - foodStock.lastRegen)) / 60000);
            setConfirmData({
                mode: 'REFILL_FOOD',
                type: 'Feed',
                cost: REFILL_COST,
                msg: `Out of food! (Regen in ${minsLeft}m)`
            });
        }
    };

    // ⚡ PLAY / REST: Stock + Cooldown System
    const checkAction = (type) => {
        const now = Date.now();
        const stock = actionStock[type];
        const last = lastActionTime[type];
        const onCooldown = (now - last) < COOLDOWN_MS;

        // 1. Check Cooldown First
        if (onCooldown) {
            const secLeft = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
            return { status: 'COOLDOWN', cost: SKIP_COOLDOWN_COST, msg: `Cooldown: ${secLeft}s` };
        }

        // 2. Check Stock
        if (stock > 0) {
            return { status: 'FREE', cost: 0 };
        } else {
            const minsLeft = Math.ceil((ACTION_REGEN_MS - (now - (type === 'play' ? actionStock.lastRegenPlay : actionStock.lastRegenRest))) / 60000);
            return { status: 'EMPTY', cost: REFILL_COST, msg: `Out of energy! (Regen in ${minsLeft}m)` };
        }
    };

    const handleActionClick = (type) => {
        if (petStatus === 'DEAD') return;
        if (type === 'play' && energy < 5) return showToast("Too tired!", "error");

        const check = checkAction(type);

        if (check.status === 'FREE') {
            executeAction(type);
        } else if (check.status === 'COOLDOWN') {
            setConfirmData({ mode: 'SKIP_CD', type, cost: check.cost, msg: check.msg });
        } else if (check.status === 'EMPTY') {
            setConfirmData({ mode: 'REFILL_STOCK', type, cost: check.cost, msg: check.msg });
        }
    };

    const executeAction = (type) => {
        // Decrease Stock
        setActionStock(prev => ({
            ...prev,
            [type]: Math.max(0, prev[type] - 1)
        }));
        // Set Cooldown
        setLastActionTime(prev => ({ ...prev, [type]: Date.now() }));

        // Animation
        if (type === 'play') {
            showToast("Playing! (Stock -1)");
            setPetStatus('WALK');
            setHappiness(prev => Math.min(prev + 20, 100)); 
            setEnergy(prev => Math.max(0, prev - 5)); 
            setTimeout(() => setPetStatus('IDLE'), 2000);
        } else {
            showToast("Resting... (Stock -1)");
            setPetStatus('SLEEP');
            setEnergy(prev => Math.min(prev + 40, 100)); 
            setTimeout(() => setPetStatus('IDLE'), 3000); 
        }
    };

    const handleClean = () => {
        if (petStatus === 'DEAD') return;
        setPetStatus('WALK'); 
        setCleanliness(100);  
        setHappiness(prev => Math.min(prev + 10, 100)); 
        showToast("Sparkling Clean!");
        setTimeout(() => setPetStatus('IDLE'), 2000);
    };

    // --- 6. CONFIRMATION HANDLER ---
    const onConfirm = () => {
        if (!confirmData) return;
        const { mode, type, cost } = confirmData;

        // Pay
        if (!processPayment(cost)) {
            showToast("Not enough ETH!", "error");
            setConfirmData(null);
            return;
        }

        // Execute Logic
        if (mode === 'REFILL_FOOD') {
            setFoodStock(prev => ({ ...prev, count: prev.count + 1 }));
            setPetStatus('EAT');
            setHunger(prev => Math.min(prev + 30, 100));
            showToast("Bought Food!");
            setTimeout(() => setPetStatus('IDLE'), 2000);
        } 
        else if (mode === 'REFILL_STOCK') {
            setActionStock(prev => ({ ...prev, [type]: prev[type] + 3 })); // Buy gets +3
            showToast(`${type.toUpperCase()} Stock +3!`);
        }
        else if (mode === 'SKIP_CD') {
            showToast("Cooldown Skipped!");
            executeAction(type);
        }

        setConfirmData(null);
    };

    // --- UI HELPERS ---
    const handleSaveName = () => { 
        if (tempName.trim() !== "") { setPetName(tempName); localStorage.setItem('my_pet_name', tempName); } 
        else { setTempName(petName); }
        setIsEditingName(false);
    };

    const renderBuffBadge = (val, icon, text) => {
        if (val < 90) return null;
        return <span className="absolute -top-3 right-0 bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded border border-black animate-bounce z-10 whitespace-nowrap">{icon} {text}</span>;
    };

    // Button Visuals
    const getStockColor = (count, max) => {
        if (count === 0) return 'bg-gray-400';
        if (count === max) return 'bg-green-500';
        return 'bg-blue-400';
    };

    return (
        <div className="flex items-center justify-center p-4 font-mono select-none w-full h-full relative">
            
            {/* === DYNAMIC MODAL === */}
            {confirmData && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white border-[6px] border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-bounce-in">
                        <h3 className="text-xl font-black mb-2 uppercase text-center text-blue-600">
                            {confirmData.mode.includes('REFILL') ? '🛒 REFILL' : '⚡ SPEED UP'}
                        </h3>
                        <p className="text-gray-600 text-center mb-1 font-bold">{confirmData.msg}</p>
                        <p className="text-center mb-6 text-sm text-gray-500">
                            Pay <span className="text-red-500 font-black text-lg">{confirmData.cost} ETH</span>?
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={() => setConfirmData(null)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg border-b-4 border-gray-500 active:border-b-0 active:translate-y-1">CANCEL</button>
                            <button onClick={onConfirm} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1">CONFIRM</button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {notification && (
                <div className={`fixed top-12 z-50 px-6 py-2 rounded-xl shadow-xl border-2 border-black animate-bounce ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-400 text-black'}`}>
                    <span className="font-bold">{notification.msg}</span>
                </div>
            )}

            <div className="relative bg-[#Fdfbf7] p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-[8px] md:border-[12px] border-gray-800 shadow-2xl max-w-4xl w-full">
                
                {/* HEADER */}
                <div className="flex flex-col items-center mb-6 px-4 md:px-12">
                     <div className="mb-4 flex items-center gap-2">
                         {isEditingName ? (
                            <div className="flex items-center border-b-2 border-black pb-1">
                                <input ref={inputRef} type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} maxLength={12} className="text-2xl font-black text-gray-800 bg-transparent outline-none text-center w-40 uppercase" onKeyDown={(e) => e.key === 'Enter' && handleSaveName()} />
                                <button onClick={handleSaveName} className="text-green-600 ml-2">✅</button>
                            </div>
                        ) : (
                            <div className="flex items-center group cursor-pointer" onClick={() => { setTempName(petName); setIsEditingName(true); }}>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-widest uppercase relative">{petName}</h1>
                                <span className="ml-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">✏️</span>
                            </div>
                        )}
                    </div>
                    <div className="w-full max-w-lg h-6 md:h-8 bg-gray-800 rounded-full p-1 border-2 border-gray-900">
                        <div className={`h-full rounded-full transition-all duration-500 relative overflow-hidden border border-black ${getHealthColor(health)}`} style={{ width: `${health}%` }}>
                             <div className="absolute top-0 left-0 w-full h-2 bg-white opacity-30 rounded-full"></div>
                        </div>
                    </div>
                    <span className="text-xs font-bold mt-1">{health}% Health</span>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    
                    {/* LEFT BUTTONS */}
                    <div className="flex flex-row md:flex-col gap-4 justify-center w-full md:w-auto pt-4 order-2 md:order-1">
                        
                        {/* 🍔 FEED */}
                        <SideButton 
                            emoji={foodStock.count > 0 ? "🍖" : "🥣"} 
                            label={`FEED (${foodStock.count}/${MAX_FOOD})`} 
                            onClick={handleFeedClick} 
                            disabled={petStatus === 'DEAD'}
                            color={getStockColor(foodStock.count, MAX_FOOD)}
                        />

                        {/* ⚡ PLAY */}
                        <SideButton 
                            emoji="🎾" 
                            label={`PLAY (${actionStock.play}/${MAX_ACTION})`} 
                            onClick={() => handleActionClick('play')} 
                            disabled={petStatus === 'DEAD' || energy < 10}
                            color={getStockColor(actionStock.play, MAX_ACTION)}
                        />

                        {/* 💤 REST */}
                        <SideButton 
                            emoji="💤" 
                            label={`REST (${actionStock.rest}/${MAX_ACTION})`} 
                            onClick={() => handleActionClick('rest')} 
                            disabled={petStatus === 'DEAD'}
                            color={getStockColor(actionStock.rest, MAX_ACTION)}
                        />

                        <SideButton emoji="🚿" label="CLEAN" onClick={handleClean} disabled={petStatus === 'DEAD'} />        
                    </div>

                    {/* CENTER SCREEN */}
                    <div className="flex-1 w-full order-1 md:order-2">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4 px-2">
                            <div className="relative">{renderBuffBadge(hunger, '⚔️', '+DMG')}<PixelBar label="Hunger" value={hunger} max={100} color="bg-yellow-400" /></div>
                            <div className="relative">{renderBuffBadge(happiness, '💥', '+CRIT')}<PixelBar label="Happiness" value={happiness} max={100} color="bg-pink-400" /></div>
                            <div className="relative">{renderBuffBadge(energy, '⚡', 'READY')}<PixelBar label="Energy" value={energy} max={100} color="bg-blue-400" /></div>
                            <div className="relative">{cleanliness < 40 && <span className="absolute -top-3 right-0 bg-red-500 text-white text-[9px] font-bold px-1 rounded animate-pulse">DIRTY!</span>}<PixelBar label="Cleanliness" value={cleanliness} max={100} color="bg-cyan-400" /></div>
                        </div>

                        <div className="relative w-full h-[280px] bg-gray-800 rounded-2xl border-[6px] border-gray-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden group">
                            <div className="absolute inset-0" style={{ backgroundImage: `url('/assets/pets/${cleanliness <= 40 ? 'dustbg.png' : 'bg.png'}')`, backgroundSize: 'cover', backgroundPosition: 'center', imageRendering: 'pixelated', filter: petStatus === 'DEAD' ? 'grayscale(100%) brightness(50%)' : 'none' }} />
                            {cleanliness < 60 && <><div className="absolute bottom-4 left-8 text-2xl animate-bounce">💩</div><div className="absolute bottom-2 right-12 text-xl opacity-80">🥡</div></>}
                            {cleanliness < 30 && <><div className="absolute bottom-10 right-20 text-2xl rotate-12">🐟</div><div className="absolute bottom-6 left-24 text-2xl -rotate-12">🧦</div><div className="absolute top-10 right-10 text-xs animate-ping">🪰</div></>}

                            <div className="absolute inset-0 flex items-end justify-center pb-8">
                                <PetDisplay status={petStatus} size={200} />
                            </div>

                            {petStatus === 'DEAD' && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                                    <h3 className="text-red-500 text-2xl font-black mb-4 tracking-widest">GAME OVER</h3>
                                    <button onClick={() => { setHunger(100); setEnergy(100); setHealth(100); setPetStatus('IDLE'); }} className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 hover:bg-yellow-300">REVIVE (0.01 ETH)</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT EQUIPMENT */}
                    <div className="flex flex-row md:flex-col gap-4 justify-center w-full md:w-auto pt-4 order-3">
                        <div className="text-center text-xs font-bold mb-1 md:hidden">EQUIP</div>
                        {[1, 2, 3].map((slot) => (
                            <div key={slot} className="w-16 h-16 bg-gray-300 rounded-xl border-4 border-gray-400 flex items-center justify-center shadow-inner"><span className="text-[8px] text-gray-500 font-bold uppercase">Empty</span></div>
                        ))}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-center gap-8 mt-8 pt-4 border-t-2 border-gray-200">
                    <button onClick={() => navigate('/battle', { state: { playerHealth: health, hunger, happiness, energy } })} disabled={petStatus === 'DEAD'} className="flex flex-col items-center group transform hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="w-16 h-16 rounded-full bg-red-600 border-4 border-black flex items-center justify-center group-hover:bg-red-500 text-white text-2xl relative">
                            ⚔️
                            {(hunger >= 90 || happiness >= 90) && <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border border-black animate-ping"></div>}
                        </div>
                        <span className="text-xs font-bold mt-2">BATTLE</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyPet;