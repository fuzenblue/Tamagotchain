import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBattle } from '../hooks/useBattle'
import { usePet } from '../hooks/usePet'
import { useWallet } from '../hooks/useWallet'
import PetDisplay from '../components/PetDisplay'

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
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

const Battle = () => {
  const navigate = useNavigate()
  const { isConnected, connectWallet } = useWallet()
  const { pet, hasPet, currentStats, combatPower } = usePet()
  const {
    playerStats,
    battleHistory,
    battleCooldown,
    canBattle,
    enterBattle,
    isLoading,
    isWaitingTx,
    error,
    getBattleResult,
  } = useBattle()

  const [battleState, setBattleState] = useState('IDLE')
  const [showHistory, setShowHistory] = useState(false)

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/assets/pets/btbg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(40%)'
          }}
        />
        <div className="relative z-10 text-center bg-black/60 p-8 rounded-xl border-4 border-yellow-600">
          <h1 className="text-4xl mb-4 text-yellow-400 font-bold">⚔️ Battle Arena</h1>
          <p className="mb-6 text-white">Connect your wallet to enter battles</p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (!hasPet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/assets/pets/btbg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(40%)'
          }}
        />
        <div className="relative z-10 text-center bg-black/60 p-8 rounded-xl border-4 border-yellow-600">
          <h1 className="text-4xl mb-4 text-yellow-400 font-bold">⚔️ Battle Arena</h1>
          <p className="mb-6 text-white">You need a pet to battle!</p>
          <button
            onClick={() => navigate('/my-pet')}
            className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
          >
            Create Pet
          </button>
        </div>
      </div>
    )
  }

  if (!pet?.alive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/assets/pets/btbg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(40%)'
          }}
        />
        <div className="relative z-10 text-center bg-black/60 p-8 rounded-xl border-4 border-yellow-600">
          <div className="text-6xl mb-4">💀</div>
          <h1 className="text-4xl mb-4 text-red-400 font-bold">Your Pet is Dead</h1>
          <p className="mb-6 text-white">Revive your pet to continue battling</p>
          <button
            onClick={() => navigate('/my-pet')}
            className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
          >
            Go to My Pet
          </button>
        </div>
      </div>
    )
  }

  const handleEnterBattle = async () => {
    try {
      setBattleState('FIGHTING')
      await enterBattle()
      setBattleState('FINISHED')
    } catch (err) {
      console.error('Battle error:', err)
      setBattleState('IDLE')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black font-mono select-none">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/pets/btbg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(40%)'
        }}
      />

      <div className="w-full max-w-5xl relative z-10">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tracking-widest drop-shadow-sm uppercase">
            BATTLE ARENA
          </h1>

          {/* Buff Indicators */}
          <div className="flex gap-4 justify-center mt-4 flex-wrap">
            <div className={`px-3 py-1 rounded text-xs font-bold border ${currentStats?.hunger >= 90 ? 'bg-green-900/50 border-green-400 text-green-400' : 'bg-gray-800/50 border-gray-600 text-gray-500'}`}>
              🍖 Hunger {currentStats?.hunger >= 90 ? '≥90 (+5% DMG)' : '<90'}
            </div>
            <div className={`px-3 py-1 rounded text-xs font-bold border ${currentStats?.happiness >= 90 ? 'bg-pink-900/50 border-pink-400 text-pink-400' : 'bg-gray-800/50 border-gray-600 text-gray-500'}`}>
              💖 Happy {currentStats?.happiness >= 90 ? '≥90 (+5% CRIT)' : '<90'}
            </div>
            <div className={`px-3 py-1 rounded text-xs font-bold border ${currentStats?.energy >= 90 ? 'bg-blue-900/50 border-blue-400 text-blue-400' : currentStats?.energy < 20 ? 'bg-red-900/50 border-red-400 text-red-400' : 'bg-gray-800/50 border-gray-600 text-gray-500'}`}>
              ⚡ Energy {currentStats?.energy >= 90 ? '≥90 (+10% EVA)' : currentStats?.energy < 20 ? '<20 (Cannot Battle)' : 'Normal'}
            </div>
          </div>

          {/* Stats Display */}
          {playerStats && (
            <div className="flex gap-4 justify-center mt-4 text-sm">
              <span className="text-white">Battles: {playerStats.totalBattles}</span>
              <span className="text-green-400">Wins: {playerStats.totalWins}</span>
              <span className="text-purple-400">Win Rate: {playerStats.winRate}%</span>
              <span className="text-yellow-400">Earned: {formatEther(playerStats.totalEarned)} ETH</span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-center text-white">
            ❌ {error}
          </div>
        )}

        {/* BATTLE FIELD */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end min-h-[350px] px-4 md:px-12 pb-8 relative gap-8">
          {/* PLAYER SIDE */}
          <div className={`flex flex-col items-center transition-all duration-500 order-2 md:order-1 relative ${battleState === 'FIGHTING' ? 'translate-x-0 md:translate-x-[100px] scale-110' : ''}`}>
            <div className="mb-4 text-center bg-gray-900/80 p-4 rounded-2xl border-2 border-blue-500/50 backdrop-blur-md shadow-xl w-48">
              <div className="text-blue-300 font-bold mb-2 text-lg uppercase truncate">{pet?.name || 'MY PET'}</div>
              <div className="text-white text-3xl font-black">
                {combatPower}
                <span className="text-[10px] font-normal text-gray-400 block tracking-widest uppercase mt-1">Combat Power</span>
              </div>
            </div>
            <div className="relative">
              <PetDisplay status={battleState === 'FIGHTING' ? 'WALK' : 'IDLE'} size={180} />
              {battleState === 'IDLE' && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-blue-500/30 blur-xl rounded-full animate-pulse"></div>}
            </div>
          </div>

          {/* VS CENTER */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full text-center pointer-events-none">
            {battleState === 'FIGHTING' ? (
              <div className="text-8xl animate-ping opacity-90 drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]">⚔️</div>
            ) : (
              <div className="text-7xl font-black text-white/10 italic">VS</div>
            )}
          </div>

          {/* ENEMY SIDE */}
          <div className={`flex flex-col items-center transition-all duration-500 order-1 md:order-3 relative ${battleState === 'FIGHTING' ? 'translate-x-0 md:-translate-x-[100px] scale-110' : ''}`}>
            <div className="mb-4 text-center bg-gray-900/80 p-4 rounded-2xl border-2 border-red-500/50 backdrop-blur-md shadow-xl w-48">
              <div className="text-red-300 font-bold mb-2 text-lg uppercase truncate">OPPONENT</div>
              <div className="text-white text-3xl font-black">
                ???
                <span className="text-[10px] font-normal text-gray-400 block tracking-widest uppercase mt-1">Power</span>
              </div>
            </div>
            <div className="relative transform scale-x-[-1] filter hue-rotate-[280deg] saturate-50">
              <PetDisplay status={battleState === 'FIGHTING' ? 'WALK' : 'IDLE'} size={180} />
              {battleState === 'IDLE' && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-red-500/30 blur-xl rounded-full animate-pulse"></div>}
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col items-center justify-center mt-6 min-h-[120px]">
          {isWaitingTx && (
            <div className="mb-6 text-center bg-black/40 p-4 rounded-xl border border-white/10 w-full max-w-md backdrop-blur-sm">
              <div className="text-yellow-300 font-bold animate-pulse">⏳ Waiting for battle result...</div>
            </div>
          )}

          {battleState === 'IDLE' && (
            <div className="text-center">
              {!canBattle ? (
                <div className="mb-6">
                  <div className="text-lg mb-2 text-white">⏳ Cooldown Active</div>
                  <div className="text-3xl font-bold text-yellow-400">
                    {formatTimeRemaining(battleCooldown)}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="text-sm text-white mb-2">Entry Fee: 0.01 ETH | Winner Gets: 0.018 ETH</div>
                </div>
              )}

              <button
                onClick={handleEnterBattle}
                disabled={!canBattle || isLoading || isWaitingTx || currentStats?.energy < 20}
                className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-2xl rounded-2xl border-b-8 border-red-900 active:border-b-0 active:translate-y-2 transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-105 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entering...' : isWaitingTx ? 'Battling...' : '🔥 FIGHT NOW!'}
              </button>

              {currentStats?.energy < 20 && (
                <div className="mt-4 text-sm text-red-400">
                  ⚠️ Not enough energy (minimum 20 required)
                </div>
              )}
            </div>
          )}

          {battleState === 'FINISHED' && (
            <div className="flex gap-4">
              <button onClick={() => setBattleState('IDLE')} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 shadow-lg">
                🔄 Battle Again
              </button>
              <button onClick={() => navigate('/my-pet')} className="px-6 py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-500 border-b-4 border-gray-800 active:border-b-0 active:translate-y-1 shadow-lg">
                🏠 Home
              </button>
              <button onClick={() => navigate('/battle-history')} className="px-6 py-3 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-500 border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1 shadow-lg">
                📜 History
              </button>
            </div>
          )}
        </div>

        {/* History Toggle */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700 border border-gray-600"
          >
            {showHistory ? 'Hide Recent Battles' : 'Show Recent Battles'}
          </button>
        </div>

        {/* Battle History */}
        {showHistory && battleHistory.length > 0 && (
          <div className="mt-6 bg-black/60 rounded-xl p-6 border-2 border-yellow-600">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">Recent Battles</h2>
            <div className="space-y-3">
              {battleHistory.slice(0, 5).map((battle, index) => {
                const result = getBattleResult(battle)
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${result.won ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'}`}
                  >
                    <div className="flex justify-between items-center text-white">
                      <div>
                        <span className="font-mono text-sm">{formatAddress(result.opponent)}</span>
                        <span className="text-xs opacity-60 ml-2">CP: {result.opponentCP}</span>
                      </div>
                      <div className={`font-bold ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                        {result.won ? '🏆 WIN' : '💀 LOSE'}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">Your CP: {result.playerCP}</div>
                        {result.won && <div className="text-xs text-green-400">+{result.reward} ETH</div>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Battle
