import React from 'react';

const Leaderboard = () => {
  // Mock Data
  const players = [
    { rank: 1, name: "DragonSlayer", wins: 999, eth: "10.5" },
    { rank: 2, name: "CryptoKing", wins: 850, eth: "8.2" },
    { rank: 3, name: "NFT_Master", wins: 720, eth: "5.4" },
    { rank: 4, name: "PlayerOne", wins: 500, eth: "2.1" },
    { rank: 5, name: "MoonBoy", wins: 420, eth: "1.0" },
  ];

  return (
    <div className="w-full max-w-2xl bg-gray-800 border-[8px] border-yellow-600 rounded-3xl p-8 shadow-2xl relative">
        
        {/* Header */}
        <div className="text-center mb-8 border-b-4 border-yellow-700 pb-4">
          <h1 className="text-4xl font-black text-yellow-500 tracking-widest uppercase drop-shadow-md">
            🏆 Hall of Fame
          </h1>
        </div>

        {/* List */}
        <div className="space-y-4">
          {players.map((p) => (
            <div key={p.rank} className={`
              flex items-center justify-between p-4 rounded-xl border-2 transition-transform hover:scale-105
              ${p.rank === 1 ? 'bg-yellow-900/50 border-yellow-500' : 'bg-gray-700/50 border-gray-600'}
            `}>
              <div className="flex items-center gap-4">
                <div className={`
                  w-10 h-10 flex items-center justify-center font-black text-lg rounded-lg
                  ${p.rank === 1 ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}
                `}>
                  {p.rank}
                </div>
                <div className="font-bold text-white text-lg">{p.name}</div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-mono font-bold">{p.eth} ETH</div>
                <div className="text-gray-400 text-xs">{p.wins} Wins</div>
              </div>
            </div>
          ))}
        </div>

        {/* Your Rank */}
        <div className="mt-8 pt-4 border-t-4 border-gray-700">
           <div className="flex items-center justify-between p-4 bg-blue-900/50 border-2 border-blue-500 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center font-black text-lg rounded-lg bg-blue-500 text-white">
                  42
                </div>
                <div className="font-bold text-white text-lg">YOU</div>
              </div>
              <div className="text-right">
                 <div className="text-green-400 font-mono font-bold">0.00 ETH</div>
                 <div className="text-gray-400 text-xs">0 Wins</div>
              </div>
           </div>
        </div>
    </div>
  );
};

export default Leaderboard;