import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [myRankInfo, setMyRankInfo] = useState(null);

  // ฟังก์ชันโหลดข้อมูล (แยกออกมาเพื่อให้เรียกใช้ซ้ำได้)
  const loadLeaderboard = () => {
    // 1. ดึงข้อมูลล่าสุดจาก LocalStorage
    const savedStats = JSON.parse(localStorage.getItem('tamagotchain_stats')) || { wins: 0, eth: 0 };
    
    // 2. ข้อมูลผู้เล่น "เรา"
    const myUser = { 
        id: 'me',
        name: "YOU (Player)", 
        wins: savedStats.wins, 
        eth: parseFloat(savedStats.eth).toFixed(2),
        isMe: true 
    };

    // 3. ข้อมูลบอท (Mock Data)
    const bots = [
      { id: 'b1', name: "DragonSlayer", wins: 50, eth: "10.50" },
      { id: 'b2', name: "CryptoKing", wins: 30, eth: "8.20" },
      { id: 'b3', name: "NFT_Master", wins: 15, eth: "5.40" },
      { id: 'b4', name: "PlayerOne", wins: 5, eth: "2.10" },
      { id: 'b5', name: "MoonBoy", wins: 2, eth: "1.00" },
    ];

    // 4. รวมและเรียงลำดับ (wins มากสุดขึ้นก่อน)
    const allPlayers = [...bots, myUser].sort((a, b) => b.wins - a.wins);

    // 5. ใส่ลำดับ (Rank)
    const rankedPlayers = allPlayers.map((player, index) => ({
        ...player,
        rank: index + 1
    }));

    setLeaderboardData(rankedPlayers);

    // หาอันดับของเรา
    const myInfo = rankedPlayers.find(p => p.isMe);
    setMyRankInfo(myInfo);
  };

  useEffect(() => {
    // โหลดข้อมูลครั้งแรกทันทีที่เข้าหน้านี้
    loadLeaderboard();

    // (เผื่อไว้) ถ้ามีการเปลี่ยนแปลง LocalStorage ใน Tab อื่น ให้โหลดใหม่ด้วย
    window.addEventListener('storage', loadLeaderboard);
    return () => window.removeEventListener('storage', loadLeaderboard);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-gray-800 border-[8px] border-yellow-600 rounded-3xl p-8 shadow-2xl relative">
            
            {/* Header */}
            <div className="text-center mb-8 border-b-4 border-yellow-700 pb-4 relative">
              <button 
                onClick={() => navigate('/my-pet')} // กลับไปหน้า My Pet
                className="absolute left-0 top-1 text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 text-white font-bold border border-gray-500"
              >
                ⬅ BACK
              </button>
              <h1 className="text-4xl font-black text-yellow-500 tracking-widest uppercase drop-shadow-md">
                🏆 Hall of Fame
              </h1>
            </div>

            {/* List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {leaderboardData.map((p) => (
                <div key={p.id} className={`
                  flex items-center justify-between p-4 rounded-xl border-2 transition-transform hover:scale-[1.02]
                  ${p.isMe ? 'bg-blue-900/40 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''} 
                  ${!p.isMe && p.rank === 1 ? 'bg-yellow-900/50 border-yellow-500' : ''}
                  ${!p.isMe && p.rank > 1 ? 'bg-gray-700/50 border-gray-600' : ''}
                `}>
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 flex items-center justify-center font-black text-lg rounded-lg
                      ${p.rank === 1 ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}
                      ${p.isMe ? '!bg-blue-500 !text-white' : ''}
                    `}>
                      {p.rank}
                    </div>
                    <div className={`font-bold text-lg ${p.isMe ? 'text-blue-300' : 'text-white'}`}>
                        {p.name} {p.isMe && '(YOU)'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-mono font-bold">{p.eth} ETH</div>
                    <div className="text-gray-400 text-xs">{p.wins} Wins</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Your Rank (Sticky Bottom) */}
            {myRankInfo && (
                <div className="mt-6 pt-4 border-t-4 border-gray-700">
                    <div className="text-gray-400 text-xs text-center mb-2">YOUR CURRENT RANKING</div>
                    <div className="flex items-center justify-between p-4 bg-blue-900/80 border-2 border-blue-500 rounded-xl shadow-lg transform scale-105">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center font-black text-lg rounded-lg bg-blue-500 text-white">
                            {myRankInfo.rank}
                            </div>
                            <div className="font-bold text-white text-lg">YOU</div>
                        </div>
                        <div className="text-right">
                            <div className="text-green-400 font-mono font-bold">{myRankInfo.eth} ETH</div>
                            <div className="text-gray-400 text-xs">{myRankInfo.wins} Wins</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Leaderboard;