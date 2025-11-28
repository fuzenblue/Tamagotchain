import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('GLOBAL'); // GLOBAL, DAILY, STREAK
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [myRankInfo, setMyRankInfo] = useState(null);

    // --- HELPER: คำนวณ Tier และ Reward ตาม Spec ---
    const getRankDetails = (rank, type) => {
        if (type !== 'GLOBAL') return { tier: 'N/A', reward: '0', color: 'border-gray-600', icon: '👤' };

        if (rank <= 10) return { 
            tier: 'DIAMOND 💎', 
            reward: rank === 1 ? '0.5' : (rank <= 5 ? '0.2' : '0.1'),
            color: 'border-cyan-400 bg-cyan-900/30',
            icon: '💎'
        };
        if (rank <= 50) return { 
            tier: 'GOLD 🏅', 
            reward: '0.05',
            color: 'border-yellow-500 bg-yellow-900/30',
            icon: '🥇'
        };
        if (rank <= 100) return { 
            tier: 'SILVER 🥈', 
            reward: '0.01',
            color: 'border-gray-400 bg-gray-700/30',
            icon: '🥈'
        };
        if (rank <= 500) return { 
            tier: 'BRONZE 🥉', 
            reward: '0',
            color: 'border-orange-700 bg-orange-900/30',
            icon: '🥉'
        };
        return { tier: 'ROOKIE', reward: '0', color: 'border-gray-800', icon: '👤' };
    };

    // --- MOCK DATA GENERATOR ---
    const generateMockData = (tab) => {
        const savedStats = JSON.parse(localStorage.getItem('tamagotchain_stats')) || { wins: 0, eth: 0, streak: 0 };
        
        // ข้อมูลเรา
        const myUser = { 
            id: 'me',
            name: "YOU", 
            wins: savedStats.wins, 
            eth: parseFloat(savedStats.eth).toFixed(2),
            streak: savedStats.wins > 0 ? Math.floor(Math.random() * 5) : 0, // Mock streak for demo
            isMe: true 
        };

        let bots = [];

        if (tab === 'GLOBAL') {
            bots = [
                { id: 'b1', name: "DragonGod", wins: 120, eth: "25.50" },
                { id: 'b2', name: "WhaleSlayer", wins: 98, eth: "18.20" },
                { id: 'b3', name: "NFT_King", wins: 85, eth: "15.40" },
                { id: 'b4', name: "AlphaWolf", wins: 70, eth: "12.10" },
                { id: 'b5', name: "ToTheMoon", wins: 65, eth: "10.00" },
                // Generate filler bots to show Silver/Bronze tiers
                ...Array.from({ length: 15 }, (_, i) => ({
                    id: `f${i}`, name: `Player_${i+100}`, wins: 60 - i, eth: (5 - i*0.1).toFixed(2)
                }))
            ];
        } else if (tab === 'DAILY') {
            bots = [
                { id: 'd1', name: "SpeedRunner", wins: 12, eth: "0.12" }, // Daily resets, low numbers
                { id: 'd2', name: "LuckyDay", wins: 10, eth: "0.10" },
                { id: 'd3', name: "Grinder99", wins: 8, eth: "0.08" },
            ];
            // Mock Daily wins for user (just for UI consistency)
            myUser.wins = Math.floor(myUser.wins / 10); 
            myUser.eth = (parseFloat(myUser.eth) / 10).toFixed(2);
        } else if (tab === 'STREAK') {
            bots = [
                { id: 's1', name: "Unstoppable", streak: 25, wins: 500, eth: "50.0" },
                { id: 's2', name: "IronDefense", streak: 18, wins: 300, eth: "30.0" },
                { id: 's3', name: "OneHitKO", streak: 12, wins: 150, eth: "15.0" },
            ];
            // Use streak for sorting instead of wins
        }

        // Combine & Sort
        const allPlayers = [...bots, myUser].sort((a, b) => {
            if (tab === 'STREAK') return b.streak - a.streak;
            return b.wins - a.wins;
        });

        // Add Rank & Details
        return allPlayers.map((player, index) => {
            const rank = index + 1;
            const details = getRankDetails(rank, tab);
            return { ...player, rank, ...details };
        });
    };

    const loadLeaderboard = () => {
        const data = generateMockData(activeTab);
        setLeaderboardData(data);
        setMyRankInfo(data.find(p => p.isMe));
    };

    useEffect(() => {
        loadLeaderboard();
    }, [activeTab]); // Reload when tab changes

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-2 md:p-4 font-mono select-none">
            <div className="w-full max-w-3xl bg-gray-800 border-[4px] md:border-[8px] border-gray-700 rounded-3xl p-4 md:p-8 shadow-2xl relative overflow-hidden">
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header & Back Button */}
                <div className="flex flex-col items-center mb-6 relative z-10">
                    <button 
                        onClick={() => navigate('/my-pet')}
                        className="absolute left-0 top-2 text-[10px] md:text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 transition-colors"
                    >
                        ⬅ BACK
                    </button>
                    <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tracking-widest uppercase drop-shadow-sm">
                        LEADERBOARD
                    </h1>
                    <div className="text-gray-400 text-xs mt-1">
                        {activeTab === 'GLOBAL' ? 'Weekly Rewards • Resets in 2d 5h' : activeTab === 'DAILY' ? 'Daily Bonus • Resets in 12h' : 'Hall of Fame'}
                    </div>
                </div>

                {/* TABS */}
                <div className="flex justify-center gap-2 md:gap-4 mb-6">
                    {['GLOBAL', 'DAILY', 'STREAK'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 border-b-4 active:border-b-0 active:translate-y-1
                                ${activeTab === tab 
                                    ? 'bg-blue-600 text-white border-blue-800 shadow-lg shadow-blue-500/30' 
                                    : 'bg-gray-700 text-gray-400 border-gray-900 hover:bg-gray-600'
                                }`}
                        >
                            {tab === 'GLOBAL' && '🌍 GLOBAL'}
                            {activeTab === 'GLOBAL' && tab === 'GLOBAL' && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>}
                            {tab === 'DAILY' && '📅 DAILY'}
                            {tab === 'STREAK' && '🔥 STREAK'}
                        </button>
                    ))}
                </div>

                {/* List Container */}
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar pb-24">
                    
                    {/* INFO BANNER for Global */}
                    {activeTab === 'GLOBAL' && (
                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 mb-4 flex justify-between items-center text-xs text-yellow-500">
                            <span>🏆 Rank #1 Reward: <span className="font-bold text-white">0.5 ETH</span></span>
                            <span>💎 Top 10: <span className="font-bold text-white">Diamond Tier</span></span>
                        </div>
                    )}

                    {leaderboardData.map((p) => (
                        <div key={p.id} className={`
                            flex items-center justify-between p-3 md:p-4 rounded-xl border-l-4 transition-transform hover:scale-[1.01] relative
                            ${p.isMe ? 'bg-blue-900/40 border-l-blue-500 border-y border-r border-blue-500/30' : `bg-gray-700/40 ${p.color} border-y border-r border-gray-700/50`}
                        `}>
                            {/* Rank & Info */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className={`
                                    w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-black text-sm md:text-lg rounded-lg shadow-inner
                                    ${p.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black' : 
                                      p.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : 
                                      p.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-600 text-black' : 'bg-gray-800 text-gray-400'}
                                `}>
                                    {p.rank}
                                </div>
                                <div>
                                    <div className={`font-bold text-sm md:text-base ${p.isMe ? 'text-blue-300' : 'text-white'}`}>
                                        {p.name}
                                    </div>
                                    <div className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                                        {activeTab === 'GLOBAL' && <span className={`px-1 rounded text-[9px] border ${p.color.replace('bg-', 'text-').split(' ')[0]}`}>{p.tier.split(' ')[0]}</span>}
                                        {activeTab === 'STREAK' && p.streak >= 5 && <span className="text-orange-400 font-bold">🔥 1.2x Payout Active</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="text-right">
                                {activeTab === 'STREAK' ? (
                                    <div className="text-orange-500 font-black text-lg md:text-xl drop-shadow-sm">{p.streak} 🔥</div>
                                ) : (
                                    <>
                                        <div className="text-green-400 font-mono font-bold text-sm md:text-base">{p.eth} ETH</div>
                                        {activeTab === 'GLOBAL' && parseFloat(p.reward) > 0 && (
                                            <div className="text-yellow-500 text-[10px] font-bold">+ {p.reward} ETH Reward</div>
                                        )}
                                    </>
                                )}
                                <div className="text-gray-500 text-[10px] uppercase">{activeTab === 'STREAK' ? 'Current Streak' : 'Total Wins'} {p.wins}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MY RANK STICKY BOTTOM */}
                {myRankInfo && (
                    <div className="absolute bottom-0 left-0 w-full bg-gray-800/95 backdrop-blur-md border-t-2 border-blue-500 p-4 shadow-2xl z-20">
                        <div className="flex items-center justify-between max-w-3xl mx-auto">
                            <div className="flex items-center gap-3">
                                <div className="text-blue-400 font-bold text-sm">YOU</div>
                                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">
                                    #{myRankInfo.rank}
                                </div>
                                {activeTab === 'GLOBAL' && <div className="text-xs text-gray-400 hidden md:block">Tier: <span className="text-white">{myRankInfo.tier}</span></div>}
                            </div>
                            
                            <div className="text-right">
                                {activeTab === 'STREAK' ? (
                                    <div className="text-orange-400 font-bold">{myRankInfo.streak} Streak</div>
                                ) : (
                                    <div className="flex flex-col items-end">
                                        <span className="text-green-400 font-bold font-mono">{myRankInfo.eth} ETH</span>
                                        {parseFloat(myRankInfo.reward) > 0 && <span className="text-yellow-400 text-[10px] animate-pulse">Pending Reward: {myRankInfo.reward} ETH</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;