import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePet } from '../hooks/usePet';
import { useWallet } from '../hooks/useWallet';
import { useBattle } from '../hooks/useBattle';
import { ethers } from 'ethers';

import PixelBar from '../components/common/PixelBar';
import SideButton from '../components/common/SideButton';
import PetDisplay from '../components/PetDisplay';

// --- CONFIGURATION ---
const BASE_COOLDOWN_MS = {
    feed: 20 * 1000,      // 20 วินาที
    play: 30 * 1000,      // 30 วินาที  
    rest: 5 * 60 * 1000,  // 5 นาที
    clean: 60 * 1000      // 1 นาที
};

const REGEN_MS = 60 * 60 * 1000;  // รีเจน 1 stock ทุก 1 ชั่วโมง

const MAX_STOCK = {
    feed: 5,  // ฟรี 5 ครั้งต่อวัน
    play: 5,  // ฟรี 5 ครั้งต่อวัน
    rest: 3   // ฟรี 3 ครั้งต่อวัน
};

// Costs
const ITEM_COST = 0.001;  // ราคาต่อชิ้น

const MyPet = () => {
    const navigate = useNavigate();
    const { isConnected, balance } = useWallet();
    const {
        pet,
        hasPet,
        currentStats,
        cooldowns,
        combatPower,
        createPet,
        feed,
        play,
        rest,
        clean: cleanPet,
        isLoading,
        isWaitingTx,
        isFetching,
        error,
    } = usePet();
    const { battleResult, clearBattleResult } = useBattle();

    // --- 0. BASIC SETUP ---
    const DEFAULT_NAMES = ["Draco", "Pyro", "Spike", "Falkor", "Smaug"];
    const [petName, setPetName] = useState(() => localStorage.getItem('my_pet_name') || DEFAULT_NAMES[0]);
    
    // Load initial stats from localStorage or use defaults
    const loadInitialStats = () => {
        const saved = localStorage.getItem('pet_stats');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed;
        }
        return { health: 50, hunger: 50, happiness: 50, energy: 50, cleanliness: 50 };
    };
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(petName);
    const inputRef = useRef(null);
    const [notification, setNotification] = useState(null);

    // --- CONFIRM MODAL ---
    const [confirmData, setConfirmData] = useState(null); // { mode, type, cost, msg }

    // --- 1. STATS STATE ---
    const initialStats = loadInitialStats();
    const [health, setHealth] = useState(initialStats.health);
    const [hunger, setHunger] = useState(initialStats.hunger);
    const [happiness, setHappiness] = useState(initialStats.happiness);
    const [energy, setEnergy] = useState(initialStats.energy);
    const [cleanliness, setCleanliness] = useState(initialStats.cleanliness);
    const [petStatus, setPetStatus] = useState('IDLE');

    // --- 2. INVENTORY & TIMERS STATE ---

    // 📦 Stocks System
    const [stocks, setStocks] = useState(() => {
        const saved = localStorage.getItem('pet_stocks');
        return saved ? JSON.parse(saved) : {
            feed: { count: MAX_STOCK.feed, lastRegen: Date.now() },
            play: { count: MAX_STOCK.play, lastRegen: Date.now() },
            rest: { count: MAX_STOCK.rest, lastRegen: Date.now() }
        };
    });

    // 🛒 Purchase Modal
    const [purchaseModal, setPurchaseModal] = useState(null); // { type, quantity, totalCost }
    
    // 📊 Stats Modal
    const [showStatsModal, setShowStatsModal] = useState(false);

    // ⏱️ Cooldown timestamps (when action will be available)
    const [cooldownEndTime, setCooldownEndTime] = useState({ feed: 0, play: 0, rest: 0, clean: 0 });
    const [cooldownDisplay, setCooldownDisplay] = useState({ feed: 0, play: 0, rest: 0, clean: 0 });

    // Save stocks and stats
    useEffect(() => {
        localStorage.setItem('pet_stocks', JSON.stringify(stocks));
    }, [stocks]);
    
    useEffect(() => {
        if (hasPet) {
            localStorage.setItem('pet_stats', JSON.stringify({ health, hunger, happiness, energy, cleanliness }));
        }
    }, [health, hunger, happiness, energy, cleanliness, hasPet]);

    // Update end timestamps from contract (contract sends timestamps, not seconds)
    useEffect(() => {
        if (!cooldowns) return;
        
        setCooldownEndTime({
            feed: Number(cooldowns.feed),
            play: Number(cooldowns.play),
            rest: Number(cooldowns.rest),
            clean: cooldownEndTime.clean
        });
    }, [cooldowns]);

    // Countdown every second based on end timestamps
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            
            setCooldownDisplay({
                feed: Math.max(0, cooldownEndTime.feed - now),
                play: Math.max(0, cooldownEndTime.play - now),
                rest: Math.max(0, cooldownEndTime.rest - now),
                clean: Math.max(0, cooldownEndTime.clean - now)
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, [cooldownEndTime]);

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



    // --- 4. GAME LOOP & REGEN SYSTEM ---
    useEffect(() => {
        if (!hasPet) return;

        const timer = setInterval(() => {
            const now = Date.now();

            // Stock Regeneration (Every 1 hour)
            ['feed', 'play', 'rest'].forEach(type => {
                if (stocks[type].count < MAX_STOCK[type]) {
                    if (now - stocks[type].lastRegen >= REGEN_MS) {
                        setStocks(prev => ({
                            ...prev,
                            [type]: {
                                count: Math.min(MAX_STOCK[type], prev[type].count + 1),
                                lastRegen: now
                            }
                        }));
                        showToast(`${type.toUpperCase()} +1 (Auto Regen)`);
                    }
                }
            });

            // 4. STAT DECAY - Use blockchain stats if available
            if (currentStats) {
                const newStats = {
                    hunger: currentStats.hunger,
                    happiness: currentStats.happiness,
                    energy: currentStats.energy,
                    health: currentStats.health || 100,
                    cleanliness: currentStats.cleanliness !== undefined ? currentStats.cleanliness : cleanliness
                };
                setHunger(newStats.hunger);
                setHappiness(newStats.happiness);
                setEnergy(newStats.energy);
                setHealth(newStats.health);
                setCleanliness(newStats.cleanliness);
            } else {
                // Local decay - per 5 seconds (scaled from per hour)
                setHunger(prev => Math.max(0, prev - 0.00139));
                setEnergy(prev => Math.max(0, prev - 0.00139));
                setCleanliness(prev => Math.max(0, prev - 0.00278));

                let happyDecay = 0.000694;
                if (cleanliness < 40) happyDecay = 0.00208;
                setHappiness(prev => Math.max(0, prev - happyDecay));
                
                // Health logic: all stats > 80% = +5% per 20s, else -9% per 15s
                if (hunger > 80 && happiness > 80 && energy > 80 && cleanliness > 80) {
                    // +5% every 20 seconds = +0.025% per 5 seconds
                    setHealth(prev => Math.min(100, prev + 0.025));
                } else if (hunger <= 79 || happiness <= 79 || energy <= 79 || cleanliness <= 79) {
                    // -9% every 15 seconds = -0.3% per 5 seconds
                    setHealth(prev => Math.max(0, prev - 0.3));
                }
            }

        }, 5000);

        return () => clearInterval(timer);
    }, [hunger, energy, happiness, cleanliness, stocks, hasPet, currentStats]);

    // Status Logic
    useEffect(() => {
        const isInCooldown = (
            cooldownDisplay.feed > 0 ||
            cooldownDisplay.play > 0 ||
            cooldownDisplay.rest > 0 ||
            cooldownDisplay.clean > 0
        );

        if (isInCooldown && ['EAT', 'WALK', 'SLEEP'].includes(petStatus)) {
            return;
        }

        if (currentStats) {
            if (!currentStats.alive) {
                setPetStatus('DEAD');
            } else if (currentStats.hunger <= 30 || currentStats.energy <= 20) {
                setPetStatus('TIRED');
            } else {
                setPetStatus('IDLE');
            }
        } else {
            if (hunger <= 0 || health <= 0) {
                setPetStatus('DEAD');
            } else if (hunger <= 30 || energy <= 20 || cleanliness <= 40) {
                setPetStatus('TIRED');
            } else {
                setPetStatus('IDLE');
            }
        }
    }, [hunger, energy, cleanliness, health, petStatus, currentStats, cooldownDisplay]);

    // --- 5. ACTION LOGIC ---

    // 🍔 FEED Handler
    const handleFeedClick = async () => {
        if (petStatus === 'DEAD') return;
        if (cooldownDisplay.feed > 0) return;

        if (stocks.feed.count > 0) {
            setStocks(prev => ({
                ...prev,
                feed: { ...prev.feed, count: prev.feed.count - 1 }
            }));
            setPetStatus('EAT');
            
            try {
                await feed();
                setHunger(prev => Math.min(100, prev + 30));
                showToast(`Yummy! (+30 Hunger)`);
            } catch (err) {
                showToast(err.message || 'Feed failed', 'error');
                setStocks(prev => ({
                    ...prev,
                    feed: { ...prev.feed, count: prev.feed.count + 1 }
                }));
            }
            
            setTimeout(() => setPetStatus('IDLE'), 10000);
        } else {
            setPurchaseModal({ type: 'feed', quantity: 1, totalCost: ITEM_COST });
        }
    };

    // ⚡ PLAY / REST Handler
    const handleActionClick = (type) => {
        if (petStatus === 'DEAD') return;
        if (type === 'play' && energy < 10) return showToast("Too tired!", "error");
        if (cooldownDisplay[type] > 0) return;

        if (stocks[type].count > 0) {
            executeAction(type);
        } else {
            setPurchaseModal({ type, quantity: 1, totalCost: ITEM_COST });
        }
    };

    const executeAction = async (type) => {
        setStocks(prev => ({
            ...prev,
            [type]: { ...prev[type], count: prev[type].count - 1 }
        }));

        if (type === 'play') {
            setPetStatus('WALK');
            try {
                await play();
                setHappiness(prev => Math.min(100, prev + 20));
                setEnergy(prev => Math.max(0, prev - 10));
                showToast("Playing! (Stock -1)");
            } catch (err) {
                showToast(err.message || 'Play failed', 'error');
                setStocks(prev => ({
                    ...prev,
                    [type]: { ...prev[type], count: prev[type].count + 1 }
                }));
            }
            setTimeout(() => setPetStatus('IDLE'), 10000);
        } else if (type === 'rest') {
            setPetStatus('SLEEP');
            try {
                await rest();
                setEnergy(prev => Math.min(100, prev + 30));
                showToast("Resting... (Stock -1)");
            } catch (err) {
                showToast(err.message || 'Rest failed', 'error');
                setStocks(prev => ({
                    ...prev,
                    [type]: { ...prev[type], count: prev[type].count + 1 }
                }));
            }
            setTimeout(() => setPetStatus('IDLE'), 10000);
        }
    };

    const handleClean = async () => {
        if (petStatus === 'DEAD') return;
        if (cooldownDisplay.clean > 0) return;

        setPetStatus('WALK');
        
        try {
            await cleanPet();
            setCleanliness(100);
            showToast("Sparkling Clean! (-10% Energy)");
        } catch (err) {
            showToast(err.message || 'Clean failed', 'error');
        }
        
        setTimeout(() => setPetStatus('IDLE'), 3000);
    };

    // Purchase Handler - Just add to stock (no blockchain purchase)
    const handlePurchase = async (quantity) => {
        if (!purchaseModal) return;
        
        const { type } = purchaseModal;
        
        // Simply add stock (free for testing)
        setStocks(prev => ({
            ...prev,
            [type]: { ...prev[type], count: prev[type].count + quantity }
        }));
        
        showToast(`Added ${quantity} ${type.toUpperCase()} stock!`);
        setPurchaseModal(null);
    };

    // --- UI HELPERS ---
    const handleSaveName = () => {
        if (tempName.trim() !== "") { setPetName(tempName); localStorage.setItem('my_pet_name', tempName); }
        else { setTempName(petName); }
        setIsEditingName(false);
    };

    const renderBuffBadge = (val, icon, text, tooltip) => {
        if (val < 90) return null;
        return <span className="absolute -top-3 right-0 bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded border border-black animate-bounce z-10 whitespace-nowrap" title={tooltip}>{icon} {text}</span>;
    };

    // Button Visuals
    const getStockColor = (count, max) => {
        if (count === 0) return 'bg-gray-400';
        if (count === max) return 'bg-green-500';
        return 'bg-blue-400';
    };

    // Get button label with cooldown
    const getButtonLabel = (type) => {
        const cooldown = cooldownDisplay[type];
        if (cooldown > 0) {
            const mins = Math.floor(cooldown / 60);
            const secs = cooldown % 60;
            return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
        }
        if (type === 'clean') return 'CLEAN';
        const stock = stocks[type]?.count || 0;
        const maxStock = MAX_STOCK[type] || 0;
        return `${type.toUpperCase()} (${stock}/${maxStock})`;
    };

    // Check if button should be disabled
    const isButtonDisabled = (type) => {
        if (petStatus === 'DEAD') return true;
        if (type === 'play' && energy < 10) return true;
        if (cooldownDisplay[type] > 0) return true;
        return false;
    };

    // Get button status message
    const getButtonStatus = (type) => {
        if (petStatus === 'DEAD') return 'Pet is dead';
        if (type === 'play' && energy < 10) return 'Not enough energy';
        
        if (cooldownDisplay[type] > 0) {
            const cooldown = cooldownDisplay[type];
            const mins = Math.floor(cooldown / 60);
            const secs = cooldown % 60;
            return `Cooldown: ${mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}`;
        }
        
        if (type !== 'clean') {
            const stock = stocks[type]?.count || 0;
            if (stock === 0) return 'Out of stock - Buy more';
        }
        
        return 'Ready to use';
    };

    const handleCreatePet = async () => {
        if (!petName.trim()) {
            showToast('Please enter a pet name', 'error');
            return;
        }

        try {
            await createPet(petName);
            
            // Reset stocks to max
            const newStocks = {
                feed: { count: MAX_STOCK.feed, lastRegen: Date.now() },
                play: { count: MAX_STOCK.play, lastRegen: Date.now() },
                rest: { count: MAX_STOCK.rest, lastRegen: Date.now() }
            };
            setStocks(newStocks);
            localStorage.setItem('pet_stocks', JSON.stringify(newStocks));
            
            // Reset stats to 50%
            const newStats = { health: 50, hunger: 50, happiness: 50, energy: 50, cleanliness: 50 };
            setHealth(50);
            setHunger(50);
            setHappiness(50);
            setEnergy(50);
            setCleanliness(50);
            localStorage.setItem('pet_stats', JSON.stringify(newStats));
            localStorage.setItem('my_pet_name', petName);
            
            showToast('Pet created successfully!');
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    // Calculate combat stats
    const getCombatStats = () => {
        const baseCP = (hunger * 0.3) + (happiness * 0.2) + (energy * 0.5);
        const damageBonus = hunger >= 90 ? 5 : 0;
        const critBonus = happiness >= 90 ? 5 : 0;
        const evasionBonus = energy >= 90 ? 10 : 0;
        
        return {
            cp: Math.round(baseCP),
            attack: Math.round(hunger * 0.3 * (1 + damageBonus/100)),
            defense: Math.round(energy * 0.5 * (1 + evasionBonus/100)),
            crit: Math.round(happiness * 0.2 * (1 + critBonus/100)),
            damageBonus,
            critBonus,
            evasionBonus
        };
    };

    // Show wallet connection prompt
    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
                    <p className="mb-4">Please connect your wallet to play</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-blue-500 text-white rounded"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    // Show create pet form
    if (!hasPet) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-6 text-center">Create Your Pet</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">Pet Name</label>
                        <input
                            type="text"
                            value={petName}
                            onChange={(e) => setPetName(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                            placeholder="Enter pet name"
                            maxLength={20}
                        />
                    </div>

                    <button
                        onClick={handleCreatePet}
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                        {isLoading ? 'Creating...' : 'Create Pet'}
                    </button>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-4 font-mono select-none w-full h-full relative">

            {/* === BATTLE RESULT MODAL === */}
            {battleResult && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white border-[8px] border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                        {/* Animated Background */}
                        <div className={`absolute inset-0 opacity-10 ${
                            battleResult.isWinner ? 'bg-gradient-to-br from-green-400 to-yellow-400' : 'bg-gradient-to-br from-red-400 to-gray-600'
                        }`}></div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-6 uppercase text-center">
                                🥊 Battle Finished! 🥊
                            </h2>
                            
                            {battleResult.isWinner ? (
                                <div className="text-center mb-6">
                                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                                    <h3 className="text-4xl font-black text-green-600 mb-2">YOU WON!</h3>
                                    <p className="text-gray-600 mb-4">Congratulations! You defeated your opponent!</p>
                                    <div className="bg-green-100 border-4 border-green-500 rounded-xl p-4">
                                        <div className="text-sm font-bold text-gray-600 mb-1">Reward Earned</div>
                                        <div className="text-3xl font-black text-green-600">
                                            {ethers.formatEther(battleResult.reward)} ETH
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center mb-6">
                                    <div className="text-6xl mb-4">💀</div>
                                    <h3 className="text-4xl font-black text-red-600 mb-2">YOU LOST...</h3>
                                    <p className="text-gray-600 mb-4">Better luck next time! Train harder!</p>
                                    <div className="bg-red-100 border-4 border-red-500 rounded-xl p-4">
                                        <div className="text-sm font-bold text-gray-600 mb-1">Entry Fee Lost</div>
                                        <div className="text-2xl font-black text-red-600">0.01 ETH</div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-4 mb-6">
                                <div className="text-xs font-bold text-gray-600 mb-2">Battle Details</div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span>Winner:</span>
                                        <span className="font-bold">{battleResult.winner.slice(0, 6)}...{battleResult.winner.slice(-4)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Loser:</span>
                                        <span className="font-bold">{battleResult.loser.slice(0, 6)}...{battleResult.loser.slice(-4)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={clearBattleResult}
                                className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white font-black text-lg rounded-xl border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 uppercase"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === PURCHASE MODAL === */}
            {purchaseModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white border-[6px] border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-black mb-4 uppercase text-center text-blue-600">
                            🛒 BUY {purchaseModal.type.toUpperCase()}
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Quantity:</label>
                            <div className="flex gap-2">
                                {[1, 3, 5, 10].map(qty => (
                                    <button
                                        key={qty}
                                        onClick={() => setPurchaseModal(prev => ({ ...prev, quantity: qty, totalCost: qty * ITEM_COST }))}
                                        className={`px-3 py-2 rounded font-bold ${
                                            purchaseModal.quantity === qty 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                    >
                                        {qty}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="text-center mb-6">
                            <p className="text-gray-600 mb-2">
                                {purchaseModal.quantity} x {ITEM_COST} ETH
                            </p>
                            <p className="text-lg font-black">
                                Total: <span className="text-red-500">{purchaseModal.totalCost.toFixed(3)} ETH</span>
                            </p>
                        </div>
                        
                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={() => setPurchaseModal(null)} 
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg border-b-4 border-gray-500 active:border-b-0 active:translate-y-1"
                            >
                                CANCEL
                            </button>
                            <button 
                                onClick={() => handlePurchase(purchaseModal.quantity)} 
                                className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1"
                            >
                                BUY NOW
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STATS MODAL */}
            {showStatsModal && (() => {
                const stats = getCombatStats();
                return (
                    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4" onClick={() => setShowStatsModal(false)}>
                        <div className="bg-white border-[6px] border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-2xl font-black mb-4 uppercase text-center text-purple-600">
                                ⚔️ Combat Stats
                            </h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="bg-purple-100 p-3 rounded-lg border-2 border-purple-300">
                                    <div className="text-sm font-bold text-gray-600">Combat Power (CP)</div>
                                    <div className="text-3xl font-black text-purple-600">{stats.cp}</div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-red-100 p-2 rounded border-2 border-red-300 text-center">
                                        <div className="text-xs font-bold text-gray-600">ATK</div>
                                        <div className="text-xl font-black text-red-600">{stats.attack}</div>
                                        {stats.damageBonus > 0 && <div className="text-[10px] text-green-600 font-bold">+{stats.damageBonus}%</div>}
                                    </div>
                                    <div className="bg-blue-100 p-2 rounded border-2 border-blue-300 text-center">
                                        <div className="text-xs font-bold text-gray-600">DEF</div>
                                        <div className="text-xl font-black text-blue-600">{stats.defense}</div>
                                        {stats.evasionBonus > 0 && <div className="text-[10px] text-green-600 font-bold">+{stats.evasionBonus}%</div>}
                                    </div>
                                    <div className="bg-yellow-100 p-2 rounded border-2 border-yellow-300 text-center">
                                        <div className="text-xs font-bold text-gray-600">CRIT</div>
                                        <div className="text-xl font-black text-yellow-600">{stats.crit}</div>
                                        {stats.critBonus > 0 && <div className="text-[10px] text-green-600 font-bold">+{stats.critBonus}%</div>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-100 p-3 rounded-lg border-2 border-gray-300 mb-4">
                                <div className="text-xs font-bold mb-2 text-gray-700">📊 Stat Breakdown:</div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span>Hunger ({hunger}):</span>
                                        <span className="font-bold">30% weight → {Math.round(hunger * 0.3)} CP</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Happiness ({happiness}):</span>
                                        <span className="font-bold">20% weight → {Math.round(happiness * 0.2)} CP</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Energy ({energy}):</span>
                                        <span className="font-bold">50% weight → {Math.round(energy * 0.5)} CP</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setShowStatsModal(false)} 
                                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg border-b-4 border-purple-700 active:border-b-0 active:translate-y-1"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                );
            })()}

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
                            <div className="flex items-center group cursor-pointer" onClick={() => { setTempName(pet?.name || petName); setIsEditingName(true); }}>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-widest uppercase relative">{pet?.name || petName}</h1>
                                <span className="ml-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">✏️</span>
                            </div>
                        )}
                    </div>
                    <div className="w-full max-w-lg h-6 md:h-8 bg-gray-800 rounded-full p-1 border-2 border-gray-900">
                        <div className={`h-full rounded-full transition-all duration-500 relative overflow-hidden border border-black ${getHealthColor(health)}`} style={{ width: `${health}%` }}>
                            <div className="absolute top-0 left-0 w-full h-2 bg-white opacity-30 rounded-full"></div>
                        </div>
                    </div>
                    <span className="text-xs font-bold mt-1">{health.toFixed(2)}% Health</span>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">

                    {/* LEFT BUTTONS */}
                    <div className="flex flex-row md:flex-col gap-4 justify-center w-full md:w-auto pt-4 order-2 md:order-1">

                        {/* 🍔 FEED */}
                        <div className="relative group">
                            <SideButton
                                emoji={cooldownDisplay.feed > 0 ? "⏱️" : (stocks.feed.count > 0 ? "🍖" : "🥣")}
                                label={getButtonLabel('feed')}
                                onClick={handleFeedClick}
                                disabled={isButtonDisabled('feed')}
                                color={cooldownDisplay.feed > 0 ? 'bg-gray-400' : getStockColor(stocks.feed.count, MAX_STOCK.feed)}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {getButtonStatus('feed')}
                            </div>
                        </div>

                        {/* ⚡ PLAY */}
                        <div className="relative group">
                            <SideButton
                                emoji={cooldownDisplay.play > 0 ? "⏱️" : "🎾"}
                                label={getButtonLabel('play')}
                                onClick={() => handleActionClick('play')}
                                disabled={isButtonDisabled('play')}
                                color={cooldownDisplay.play > 0 ? 'bg-gray-400' : getStockColor(stocks.play.count, MAX_STOCK.play)}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {getButtonStatus('play')}
                            </div>
                        </div>

                        {/* 💤 REST */}
                        <div className="relative group">
                            <SideButton
                                emoji={cooldownDisplay.rest > 0 ? "⏱️" : "💤"}
                                label={getButtonLabel('rest')}
                                onClick={() => handleActionClick('rest')}
                                disabled={isButtonDisabled('rest')}
                                color={cooldownDisplay.rest > 0 ? 'bg-gray-400' : getStockColor(stocks.rest.count, MAX_STOCK.rest)}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {getButtonStatus('rest')}
                            </div>
                        </div>

                        <div className="relative group">
                            <SideButton 
                                emoji={cooldownDisplay.clean > 0 ? "⏱️" : "🚿"} 
                                label={getButtonLabel('clean')} 
                                onClick={handleClean} 
                                disabled={isButtonDisabled('clean')} 
                                color={cooldownDisplay.clean > 0 ? 'bg-gray-400' : 'bg-cyan-400'}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {getButtonStatus('clean')}
                            </div>
                        </div>
                    </div>

                    {/* CENTER SCREEN */}
                    <div className="flex-1 w-full order-1 md:order-2">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4 px-2">
                            <div className="relative">{renderBuffBadge(hunger, '⚔️', '+5% DMG', '30% Combat Weight | ≥90: +5% Damage Bonus')}<PixelBar label="Hunger" value={hunger} max={100} color="bg-yellow-400" /></div>
                            <div className="relative">{renderBuffBadge(happiness, '💥', '+5% CRIT', '20% Combat Weight | ≥90: +5% Crit Chance')}<PixelBar label="Happiness" value={happiness} max={100} color="bg-pink-400" /></div>
                            <div className="relative">{renderBuffBadge(energy, '⚡', '+10% EVA', '50% Combat Weight | ≥90: +10% Evasion')}<PixelBar label="Energy" value={energy} max={100} color="bg-blue-400" /></div>
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
                    <button onClick={() => setShowStatsModal(true)} className="flex flex-col items-center group transform hover:scale-110 transition-transform">
                        <div className="w-16 h-16 rounded-full bg-purple-600 border-4 border-black flex items-center justify-center group-hover:bg-purple-500 text-white text-2xl relative">
                            📊
                        </div>
                        <span className="text-xs font-bold mt-2">STATS</span>
                    </button>
                    <button onClick={() => navigate('/battle', { state: { playerHealth: health, hunger, happiness, energy } })} disabled={petStatus === 'DEAD'} className="flex flex-col items-center group transform hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="w-16 h-16 rounded-full bg-red-600 border-4 border-black flex items-center justify-center group-hover:bg-red-500 text-white text-2xl relative">
                            ⚔️
                            {(hunger >= 90 || happiness >= 90 || energy >= 90) && <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border border-black animate-ping"></div>}
                        </div>
                        <span className="text-xs font-bold mt-2">BATTLE</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyPet;