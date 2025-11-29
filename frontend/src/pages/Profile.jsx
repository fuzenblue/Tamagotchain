import { useNavigate } from 'react-router-dom'
import { usePet } from '../hooks/usePet'
import { useBattle } from '../hooks/useBattle'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useWallet } from '../hooks/useWallet'
import { ethers } from 'ethers'

function Profile() {
  const navigate = useNavigate()
  const { isConnected, connectWallet, account, balance } = useWallet()
  const { pet, hasPet, currentStats, combatPower } = usePet()
  const { playerStats } = useBattle()
  const { myRank, myTier, totalPlayers } = useLeaderboard()

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatTimestamp = (ts) => {
    if (!ts) return ''
    return new Date(ts * 1000).toLocaleDateString()
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen p-4 relative bg-black overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: "url('/assets/pets/btbg.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(60%)" }} />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center bg-black/60 p-8 rounded-xl border-4 border-purple-600">
            <h1 className="text-4xl mb-4 text-purple-400 font-black">👤 PROFILE</h1>
            <p className="mb-6 text-white">Connect wallet to view profile</p>
            <button onClick={connectWallet} className="px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-400 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 relative bg-black overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: "url('/assets/pets/btbg.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(60%)" }} />
      <div className="relative z-10 max-w-6xl mx-auto pt-12">
        <h1 className="text-center text-5xl font-black text-purple-400 mb-10 drop-shadow-[0_5px_5px_rgba(0,0,0,0.9)]">👤 PLAYER PROFILE</h1>

        {/* Wallet Info */}
        <div className="bg-black/60 rounded-xl p-6 mb-6 border-4 border-purple-600">
          <h2 className="text-2xl font-black mb-4 text-purple-300">💳 WALLET</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="Address" value={formatAddress(account)} />
            <InfoRow label="Balance" value={`${parseFloat(balance).toFixed(4)} ETH`} />
          </div>
        </div>

        {/* Pet Info */}
        {hasPet && pet ? (
          <div className="bg-black/60 rounded-xl p-6 mb-6 border-4 border-green-600">
            <h2 className="text-2xl font-black mb-4 text-green-300">🐾 PET</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <InfoRow label="Name" value={pet.name} />
                <InfoRow label="Status" value={pet.alive ? '✅ Alive' : '💀 Dead'} />
                <InfoRow 
                  label="Age" 
                  value={`${Math.floor((Date.now() / 1000 - pet.birthTime) / 86400)} days`} 
                />
                <InfoRow 
                  label="Born" 
                  value={formatTimestamp(pet.birthTime)} 
                />
              </div>
              <div>
                <InfoRow label="Hunger" value={`${currentStats?.hunger || 0}/100`} />
                <InfoRow label="Happiness" value={`${currentStats?.happiness || 0}/100`} />
                <InfoRow label="Energy" value={`${currentStats?.energy || 0}/100`} />
                <InfoRow label="Combat Power" value={combatPower} color="text-purple-400" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-black/60 rounded-xl p-6 mb-6 text-center border-4 border-gray-600">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-bold mb-2 text-white">No Pet Yet</h3>
            <p className="opacity-60 mb-4 text-white">Create a pet to start playing</p>
            <button onClick={() => navigate('/my-pet')} className="px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-400 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1">
              Create Pet
            </button>
          </div>
        )}

        {/* Battle Stats */}
        {playerStats && (
          <div className="bg-black/60 rounded-xl p-6 mb-6 border-4 border-red-600">
            <h2 className="text-2xl font-black mb-4 text-red-300">⚔️ BATTLE STATISTICS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Total Battles" value={playerStats.totalBattles} />
              <StatBox label="Wins" value={playerStats.totalWins} color="text-green-400" />
              <StatBox label="Losses" value={playerStats.totalLosses} color="text-red-400" />
              <StatBox label="Win Rate" value={`${playerStats.winRate}%`} color="text-purple-400" />
              <StatBox label="Current Streak" value={playerStats.currentStreak} />
              <StatBox label="Best Streak" value={playerStats.bestStreak} color="text-yellow-400" />
              <StatBox 
                label="Total Earned" 
                value={`${ethers.formatEther(playerStats.totalEarned)} ETH`} 
                color="text-green-400" 
              />
              <StatBox 
                label="Avg per Battle" 
                value={
                  playerStats.totalBattles > 0
                    ? `${(parseFloat(ethers.formatEther(playerStats.totalEarned)) / playerStats.totalBattles).toFixed(4)} ETH`
                    : '0 ETH'
                }
              />
            </div>
          </div>
        )}

        {/* Ranking */}
        {myRank && myTier && (
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-6 border-4 border-yellow-600">
            <h2 className="text-2xl font-black mb-4 text-yellow-300">🏆 RANKING</h2>
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="text-sm opacity-80 mb-2">Global Rank</div>
                <div className="text-5xl font-bold">#{myRank}</div>
                <div className="text-sm opacity-60 mt-2">out of {totalPlayers}</div>
              </div>
              <div className="text-center">
                <div className="text-sm opacity-80 mb-2">Tier</div>
                <div className="text-6xl mb-2">{myTier.icon}</div>
                <div className={`text-2xl font-bold ${myTier.color}`}>
                  {myTier.name}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm opacity-80 mb-2">Top</div>
                <div className="text-5xl font-bold">
                  {Math.round((myRank / totalPlayers) * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-purple-500 text-white font-bold rounded-xl shadow-xl hover:bg-purple-400 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1">
            ⬅ Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function InfoRow({ label, value, color = 'text-white' }) {
  return (
    <div className="py-2">
      <div className="text-sm opacity-60 mb-1">{label}</div>
      <div className={`font-bold ${color}`}>{value}</div>
    </div>
  )
}

function StatBox({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-black/40 rounded-lg p-4 text-center border-2 border-gray-700">
      <div className="text-sm opacity-60 mb-2 text-white">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

export default Profile