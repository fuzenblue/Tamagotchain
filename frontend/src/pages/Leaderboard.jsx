import React from 'react';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
  const navigate = useNavigate();

  // Mock Data (รายชื่อคนเก่ง)
  const players = [
    { rank: 1, name: "DragonMaster", eth: "5.2 ETH", wins: 120 },
    { rank: 2, name: "CryptoKitty", eth: "3.8 ETH", wins: 95 },
    { rank: 3, name: "PixelSlayer", eth: "2.1 ETH", wins: 88 },
    { rank: 4, name: "NoobKiller", eth: "1.5 ETH", wins: 60 },
    { rank: 5, name: "TamagotchiGod", eth: "0.9 ETH", wins: 42 },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 border-8 border-yellow-500 shadow-2xl relative">
        
        {/* Title */}
        <h1 className="text-3xl font-black text-center mb-6 text-gray-800 uppercase tracking-widest">
           🏆 Leaderboard
        </h1>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border-2 border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Player</th>
                <th className="p-4">Wins</th>
                <th className="p-4 text-right">Earned (ETH)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {players.map((player) => (
                <tr key={player.rank} className="hover:bg-yellow-50 transition-colors">
                  <td className="p-4 font-bold">
                    {player.rank === 1 && "🥇"}
                    {player.rank === 2 && "🥈"}
                    {player.rank === 3 && "🥉"}
                    {player.rank > 3 && `#${player.rank}`}
                  </td>
                  <td className="p-4 font-bold text-gray-700">{player.name}</td>
                  <td className="p-4 text-gray-500">{player.wins} ⚔️</td>
                  <td className="p-4 text-right font-bold text-green-600">{player.eth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/battle')} // กลับไปหน้า Battle
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg"
          >
            ⬅ Back to Arena
          </button>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;