import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useWallet } from '../hooks/useWallet'

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatEther = (wei) => {
  if (!wei) return '0'
  return (Number(wei) / 1e18).toFixed(4)
}

const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return '0s'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

const Leaderboard = () => {
  const navigate = useNavigate()
  const { isConnected, connectWallet, account } = useWallet()
  const {
    filteredPlayers,
    myRank,
    totalPlayers,
    platformBalance,
    selectedTab,
    setSelectedTab,
    myTier,
    timeUntilReset,
    getTier,
    getWeeklyPrize,
    isFetching,
    refreshLeaderboard,
  } = useLeaderboard()

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
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tracking-widest uppercase drop-shadow-sm">
              LEADERBOARD
            </h1>
            <button
              onClick={refreshLeaderboard}
              disabled={isFetching}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-sm"
            >
              {isFetching ? '⏳' : '🔄'}
            </button>
          </div>
          <div className="text-gray-400 text-xs mt-1">
            Weekly Rewards • Resets in {formatTimeRemaining(timeUntilReset)}
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <StatCard label="Players" value={totalPlayers} icon="👥" />
          <StatCard label="Prize Pool" value={`${formatEther(platformBalance)} ETH`} icon="💰" />
          <StatCard label="Reset" value={formatTimeRemaining(timeUntilReset)} icon="⏰" />
        </div>

        {/* My Rank Banner */}
        {isConnected && myRank && myTier && (
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs opacity-80 mb-1">Your Rank</div>
                <div className="text-3xl font-bold">#{myRank}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-1">{myTier.icon}</div>
                <div className={`text-sm font-bold ${myTier.color}`}>
                  {myTier.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-80 mb-1">Prize</div>
                <div className="text-lg font-bold text-yellow-400">
                  {getWeeklyPrize(myRank)} ETH
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABS */}
        <div className="flex justify-center gap-2 md:gap-4 mb-6">
          {['global', 'daily', 'streak'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 border-b-4 active:border-b-0 active:translate-y-1 ${
                selectedTab === tab 
                  ? 'bg-blue-600 text-white border-blue-800 shadow-lg shadow-blue-500/30' 
                  : 'bg-gray-700 text-gray-400 border-gray-900 hover:bg-gray-600'
              }`}
            >
              {tab === 'global' && '🌍 GLOBAL'}
              {tab === 'daily' && '📅 DAILY'}
              {tab === 'streak' && '🔥 STREAK'}
            </button>
          ))}
        </div>

        {/* List Container */}
        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar pb-4">
          {isFetching ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <div className="text-white">Loading...</div>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-12 opacity-60 text-white">
              No players yet. Be the first!
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const tier = getTier(player.rank)
              const prize = getWeeklyPrize(player.rank)
              const isCurrentUser = account?.toLowerCase() === player.address.toLowerCase()

              return (
                <div
                  key={player.address}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-xl border-l-4 transition-transform hover:scale-[1.01] relative ${
                    isCurrentUser 
                      ? 'bg-blue-900/40 border-l-blue-500 border-y border-r border-blue-500/30' 
                      : `bg-gray-700/40 border-l-${tier.color.split('-')[1]}-500 border-y border-r border-gray-700/50`
                  }`}
                >
                  {/* Rank & Info */}
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-black text-sm md:text-lg rounded-lg shadow-inner ${
                      player.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black' : 
                      player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : 
                      player.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-600 text-black' : 
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {player.rank}
                    </div>
                    <div>
                      <div className={`font-bold text-sm md:text-base flex items-center gap-2 ${isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                        {formatAddress(player.address)}
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 bg-blue-600 rounded text-xs">You</span>
                        )}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                        <span className={`px-1 rounded text-[9px] border ${tier.color}`}>
                          {tier.icon} {tier.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-green-400 font-mono font-bold text-sm md:text-base">
                      {formatEther(player.totalEarned)} ETH
                    </div>
                    {parseFloat(prize) > 0 && (
                      <div className="text-yellow-500 text-[10px] font-bold">
                        + {prize} ETH Prize
                      </div>
                    )}
                    <div className="text-gray-500 text-[10px] uppercase">
                      {player.totalWins} Wins • {player.winRate}%
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Prize Structure */}
        <div className="mt-6 bg-gray-900/50 rounded-lg p-4">
          <h2 className="text-sm font-bold mb-3 text-yellow-400">💰 Weekly Prizes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <PrizeCard rank="#1" prize="0.1 ETH" icon="💎" />
            <PrizeCard rank="#2-3" prize="0.05 ETH" icon="🏅" />
            <PrizeCard rank="#4-10" prize="0.02 ETH" icon="🥈" />
            <PrizeCard rank="#11-20" prize="0.01 ETH" icon="🥉" />
          </div>
        </div>

        {/* Connect CTA */}
        {!isConnected && (
          <div className="mt-6 text-center bg-gray-900/50 rounded-lg p-6">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="text-lg font-bold mb-2 text-white">Connect to Compete</h3>
            <p className="opacity-80 mb-4 text-sm text-gray-400">
              Connect your wallet to see your rank
            </p>
            <button
              onClick={connectWallet}
              className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper Components
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-[10px] opacity-60 mb-1">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  )
}

function PrizeCard({ rank, prize, icon }) {
  return (
    <div className="bg-gray-800 rounded-lg p-2 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-[10px] font-bold text-white mb-1">Rank {rank}</div>
      <div className="text-xs font-bold text-yellow-400">{prize}</div>
    </div>
  )
}

export default Leaderboard
