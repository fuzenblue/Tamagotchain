import { useState, useEffect, useCallback } from 'react'
import { useContract } from './useContract'
import { GAME_CONFIG } from '../utils/contracts'

/**
 * Hook for battle-related operations
 */
export const useBattle = () => {
  const {
    contract,
    account,
    isConnected,
    readContract,
    writeContract,
    parseValue,
    isLoading,
    isWaitingTx,
    error,
  } = useContract()

  const [playerStats, setPlayerStats] = useState(null)
  const [battleHistory, setBattleHistory] = useState([])
  const [topPlayers, setTopPlayers] = useState([])
  const [totalBattles, setTotalBattles] = useState(0)
  const [waitingPlayers, setWaitingPlayers] = useState(0)
  const [lastBattleTime, setLastBattleTime] = useState(0)
  const [battleCooldown, setBattleCooldown] = useState(0)
  const [isFetching, setIsFetching] = useState(false)

  /**
   * Fetch player battle statistics
   */
  const fetchPlayerStats = useCallback(async () => {
    if (!contract || !account) return

    try {
      setIsFetching(true)

      const stats = await readContract('getPlayerStats', account)
      
      setPlayerStats({
        totalBattles: Number(stats.totalBattles),
        totalWins: Number(stats.totalWins),
        totalLosses: Number(stats.totalLosses),
        winRate: Number(stats.winRate),
        currentStreak: Number(stats.currentStreak),
        bestStreak: Number(stats.bestStreak),
        totalEarned: stats.totalEarned.toString(),
      })

    } catch (err) {
      console.error('❌ Fetch player stats error:', err)
    } finally {
      setIsFetching(false)
    }
  }, [contract, account, readContract])

  /**
   * Fetch battle history (last N battles for player)
   */
  const fetchBattleHistory = useCallback(async (limit = 10) => {
    if (!contract || !account) return

    try {
      setIsFetching(true)

      // Get total battles count
      const total = await readContract('getTotalBattles')
      const totalCount = Number(total)
      setTotalBattles(totalCount)

      if (totalCount === 0) {
        setBattleHistory([])
        return
      }

      // Fetch recent battles (reverse order)
      const battles = []
      const startIndex = Math.max(0, totalCount - limit)

      for (let i = totalCount - 1; i >= startIndex; i--) {
        try {
          const battle = await readContract('getBattle', i)
          
          // Only include battles where player participated
          if (
            battle.player1.toLowerCase() === account.toLowerCase() ||
            battle.player2.toLowerCase() === account.toLowerCase()
          ) {
            battles.push({
              id: i,
              player1: battle.player1,
              player2: battle.player2,
              cp1: Number(battle.cp1),
              cp2: Number(battle.cp2),
              winner: battle.winner,
              timestamp: Number(battle.timestamp),
            })
          }
        } catch (err) {
          console.error(`Failed to fetch battle ${i}:`, err)
        }
      }

      setBattleHistory(battles)

    } catch (err) {
      console.error('❌ Fetch battle history error:', err)
    } finally {
      setIsFetching(false)
    }
  }, [contract, account, readContract])

  /**
   * Check battle cooldown
   */
  const fetchBattleCooldown = useCallback(async () => {
    if (!contract || !account) return

    try {
      const lastTime = await readContract('lastBattleTime', account)
      const lastBattleTimestamp = Number(lastTime)
      setLastBattleTime(lastBattleTimestamp)

      // Calculate cooldown remaining
      const now = Math.floor(Date.now() / 1000)
      const elapsed = now - lastBattleTimestamp
      const remaining = Math.max(0, GAME_CONFIG.BATTLE_COOLDOWN - elapsed)
      setBattleCooldown(remaining)

    } catch (err) {
      console.error('❌ Fetch battle cooldown error:', err)
    }
  }, [contract, account, readContract])

  /**
   * Get waiting players count
   */
  const fetchWaitingPlayersCount = useCallback(async () => {
    if (!contract) return

    try {
      // Note: Contract doesn't have public getter for waiting pool length
      // This is a placeholder - would need to add to contract or use events
      setWaitingPlayers(0)
    } catch (err) {
      console.error('❌ Fetch waiting players error:', err)
    }
  }, [contract])

  /**
   * Fetch top players from leaderboard
   */
  const fetchTopPlayers = useCallback(async (count = 10) => {
    if (!contract) return

    try {
      const players = await readContract('getTopPlayers', count)
      setTopPlayers(players || [])
    } catch (err) {
      console.error('❌ Fetch top players error:', err)
      setTopPlayers([])
    }
  }, [contract, readContract])

  /**
   * Enter battle arena
   */
  const enterBattle = async () => {
    try {
      const value = parseValue(GAME_CONFIG.BATTLE_ENTRY)
      const receipt = await writeContract('enterBattle', [], { value })
      
      // Refresh data after battle
      await Promise.all([
        fetchPlayerStats(),
        fetchBattleHistory(),
        fetchBattleCooldown(),
      ])
      
      return receipt
    } catch (err) {
      throw err
    }
  }

  /**
   * Cancel waiting in queue (get refund)
   */
  const cancelWaiting = async () => {
    try {
      const receipt = await writeContract('cancelWaiting', [])
      
      await fetchWaitingPlayersCount()
      
      return receipt
    } catch (err) {
      throw err
    }
  }

  /**
   * Check if player can battle
   */
  const canBattle = useCallback(() => {
    return battleCooldown === 0
  }, [battleCooldown])

  /**
   * Get battle result for player
   */
  const getBattleResult = useCallback((battle) => {
    if (!battle || !account) return null

    const isPlayer1 = battle.player1.toLowerCase() === account.toLowerCase()
    const won = battle.winner.toLowerCase() === account.toLowerCase()

    return {
      opponent: isPlayer1 ? battle.player2 : battle.player1,
      playerCP: isPlayer1 ? battle.cp1 : battle.cp2,
      opponentCP: isPlayer1 ? battle.cp2 : battle.cp1,
      won,
      reward: won ? GAME_CONFIG.BATTLE_REWARD : '0',
      timestamp: battle.timestamp,
    }
  }, [account])

  /**
   * Listen to battle events
   */
  const listenToBattleEvents = useCallback(() => {
    if (!contract || !account) return

    // Listen to BattleEnded events
    const filter = contract.filters.BattleEnded()
    
    const handleBattleEnded = async (battleId, winner, loser, reward, event) => {
      console.log('⚔️ Battle ended:', {
        battleId: battleId.toString(),
        winner,
        loser,
        reward: reward.toString(),
      })

      // If current user was in battle, refresh data
      if (
        winner.toLowerCase() === account.toLowerCase() ||
        loser.toLowerCase() === account.toLowerCase()
      ) {
        await Promise.all([
          fetchPlayerStats(),
          fetchBattleHistory(),
          fetchBattleCooldown(),
        ])
      }
    }

    contract.on(filter, handleBattleEnded)

    // Cleanup
    return () => {
      contract.off(filter, handleBattleEnded)
    }
  }, [contract, account, fetchPlayerStats, fetchBattleHistory, fetchBattleCooldown])

  /**
   * Auto-fetch data on mount and account change
   */
  useEffect(() => {
    if (isConnected && account) {
      fetchPlayerStats()
      fetchBattleHistory()
      fetchBattleCooldown()
      fetchWaitingPlayersCount()
      fetchTopPlayers()
    }
  }, [isConnected, account, fetchPlayerStats, fetchBattleHistory, fetchBattleCooldown, fetchWaitingPlayersCount, fetchTopPlayers])

  /**
   * Setup event listeners
   */
  useEffect(() => {
    const cleanup = listenToBattleEvents()
    return cleanup
  }, [listenToBattleEvents])

  /**
   * Auto-update cooldown every second
   */
  useEffect(() => {
    if (battleCooldown === 0) return

    const interval = setInterval(() => {
      setBattleCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [battleCooldown])

  return {
    // Player data
    playerStats,
    battleHistory,
    topPlayers,
    totalBattles,
    waitingPlayers,
    battleCooldown,
    
    // Computed
    canBattle: canBattle(),
    
    // Actions
    enterBattle,
    cancelWaiting,
    refreshStats: fetchPlayerStats,
    refreshHistory: fetchBattleHistory,
    getBattleResult,
    
    // States
    isLoading,
    isWaitingTx,
    isFetching,
    error,
  }
}

export default useBattle