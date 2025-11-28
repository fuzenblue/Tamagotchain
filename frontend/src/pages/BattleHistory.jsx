import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BattleHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  // โหลดประวัติจาก localStorage และคำนวณ Running Balance
  useEffect(() => {
    const historyData = JSON.parse(localStorage.getItem("battle_history")) || [];
    
    let runningBalance = 0;
    
    // 1. สร้างสำเนาและกลับด้าน array เพื่อเริ่มคำนวณจากรายการที่เก่าที่สุด
    const reversedHistory = [...historyData].reverse(); 

    // 2. คำนวณยอดคงเหลือสะสม (Running Balance)
    const historyWithRunningBalance = reversedHistory.map(h => {
        const change = parseFloat(h.netEthChange || 0) || 0;
        
        runningBalance += change;
        
        return {
            ...h,
            netEthChange: change,
            runningBalance: runningBalance.toFixed(4) 
        }
    }).reverse(); // 3. กลับด้านกลับมาให้รายการล่าสุดอยู่ด้านบนสุด

    setHistory(historyWithRunningBalance);
  }, []);

  return (
    <div className="min-h-screen p-4 relative bg-black overflow-hidden">

      {/* Background แบบ Battle Page */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/pets/btbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(60%)"
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto pt-12">
        
        {/* Title */}
        <h1 className="text-center text-5xl font-black text-yellow-400 mb-10 drop-shadow-[0_5px_5px_rgba(0,0,0,0.9)]">
          📜 Battle History
        </h1>

        {/* ถ้าไม่มีประวัติ */}
        {history.length === 0 && (
          <p className="text-white text-center text-xl bg-black/50 py-4 rounded-xl">
            ยังไม่มีประวัติการต่อสู้ ⚔️
          </p>
        )}

        {/* ตารางประวัติ */}
        <div className="bg-black/60 rounded-xl p-6 border-4 border-yellow-600 shadow-2xl">
          <table className="w-full text-white font-mono table-fixed"> 
            <thead>
              <tr className="text-yellow-300 text-lg border-b border-yellow-500">
                <th className="py-2 w-1/6">Result</th>
                <th className="py-2 w-1/6">Net Change (ETH)</th>
                <th className="py-2 w-1/6">Balance (ETH)</th>
                <th className="py-2 w-1/6">Your Power</th>
                <th className="py-2 w-1/6">Enemy Power</th>
                <th className="py-2 w-1/6">Time</th>
              </tr>
            </thead>

            <tbody>
              {history.map((h, i) => (
                <tr
                  key={i}
                  className="text-center border-b border-gray-700 hover:bg-white/10 transition"
                >
                  <td
                    className={`py-3 font-bold ${
                      h.result === "WIN"
                        ? "text-green-400"
                        : h.result === "LOSE"
                        ? "text-red-400"
                        : "text-gray-300"
                    }`}
                  >
                    {h.result}
                  </td>

                    <td className={`py-3 font-bold ${h.netEthChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {h.netEthChange > 0 ? `+${h.netEthChange.toFixed(4)}` : h.netEthChange.toFixed(4)}
                    </td>

                    <td className="py-3 text-yellow-300 font-bold">
                        {h.runningBalance}
                    </td>

                  <td className="py-3">{h.myPower}</td>
                  <td className="py-3">{h.enemyPower}</td>

                  <td className="py-3 text-sm">
                    {new Date(h.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-xl shadow-xl hover:bg-yellow-400 border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1"
          >
            ⬅ Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default BattleHistory;