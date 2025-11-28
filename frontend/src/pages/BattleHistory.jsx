import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useBattle } from '../hooks/useBattle'
import { useWallet } from '../hooks/useWallet'

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatEther = (wei) => {
  if (!wei) return '0'
  return (Number(wei) / 1e18).toFixed(4)
}

function BattleHistory() {
  const navigate = useNavigate()
  const { isConnected, connectWallet } = useWallet()
  const {
    battleHistory,
    playerStats,
    isFetching,
    getBattleResult,
  } = useBattle()

  if (!isConnected) {
    return (
      <div className="min-h-screen p-4 relative bg-black overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/assets/pets/btbg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(60%)"
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center bg-black/60 p-8 rounded-xl border-4 border-yellow-600">
            <h1 className="text-3xl mb-4 text-yellow-400 font-bold">📜 Battle History</h1>
            <p className="mb-6 text-white">Connect wallet to view history</p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isFetching) {
    return (
      <div className="min-h-screen p-4 relative bg-black overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/assets/pets/btbg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(60%)"
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">⏳</div>
            <div>Loading battle history...</div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate running balance
  let runningBalance = 0
  const historyWithBalance = battleHistory.map((battle) => {
    const result = getBattleResult(battle)
    const change = result.won ? parseFloat(result.reward) : -0.01
    runningBalance += change
    return {
      ...battle,
      result,
      balanceChange: change,
      runningBalance,
    }
  }).reverse()

  return (
    <div className="min-h-screen p-4 relative bg-black overflow-hidden">
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
        <h1 className="text-center text-5xl font-black text-yellow-400 mb-10 drop-shadow-[0_5px_5px_rgba(0,0,0,0.9)]">
          📜 Battle History
        </h1>

        {/* Summary */}
        {playerStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              label="Total Battles"
              value={playerStats.totalBattles}
              icon="⚔️"
            />
            <SummaryCard
              label="Wins"
              value={playerStats.totalWins}
              icon="🏆"
              color="text-green-400"
            />
            <SummaryCard
              label="Win Rate"
              value={`${playerStats.winRate}%`}
              icon="📊"
              color="text-purple-400"
            />
            <SummaryCard
              label="Total Earned"
              value={`${formatEther(playerStats.totalEarned)} ETH`}
              icon="💰"
              color="text-yellow-400"
            />
          </div>
        )}

        {/* Battle Table */}
        <div className="bg-black/60 rounded-xl p-6 border-4 border-yellow-600 shadow-2xl">
          <table className="w-full text-white font-mono table-fixed">
            <thead>
              <tr className="text-yellow-300 text-lg border-b border-yellow-500">
                <th className="py-2 text-left">Time</th>
                <th className="py-2 text-left">Opponent</th>
                <th className="py-2 text-center">Your CP</th>
                <th className="py-2 text-center">Enemy CP</th>
                <th className="py-2 text-center">Result</th>
                <th className="py-2 text-right">Change</th>
                <th className="py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {historyWithBalance.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center opacity-60">
                    No battles yet. Enter the arena to start!
                  </td>
                </tr>
              ) : (
                historyWithBalance.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-700 hover:bg-white/10 transition"
                  >
                    <td className="py-3 text-sm">
                      {new Date(item.result.timestamp * 1000).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className="text-sm">
                        {formatAddress(item.result.opponent)}
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold">
                      {item.result.playerCP}
                    </td>
                    <td className="py-3 text-center font-bold">
                      {item.result.opponentCP}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          item.result.won
                            ? 'bg-green-900/50 text-green-400'
                            : 'bg-red-900/50 text-red-400'
                        }`}
                      >
                        {item.result.won ? '🏆 WIN' : '💀 LOSE'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`font-bold ${
                          item.balanceChange > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {item.balanceChange > 0 ? '+' : ''}
                        {item.balanceChange.toFixed(4)} ETH
                      </span>
                    </td>
                    <td className="py-3 text-right text-yellow-300 font-bold">
                      {item.runningBalance.toFixed(4)} ETH
                    </td>
                  </tr>
                ))
              )}
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
  )
}

function SummaryCard({ label, value, icon, color = 'text-white' }) {
  return (
    <div className="bg-black/60 rounded-lg p-6 border-2 border-yellow-600">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm opacity-60 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

export default BattleHistory
