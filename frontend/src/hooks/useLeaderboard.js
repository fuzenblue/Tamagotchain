import { useState, useEffect, useCallback } from 'react'
import { useContract } from './useContract'

/**
 * Hook for leaderboard operations
 */
export const useLeaderboard = () => {
  const {
    contract,
    account,
    isConnected,
    readContract,
    isLoading,
    error,
  } = useContract()

  const [topPlayers, setTopPlayers] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [platformBalance, setPlatformBalance] = useState('0')
  const [weeklyPrizePool, setWeeklyPrizePool] = useState('0')
  const [lastWeeklyReset, setLastWeeklyReset] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [selectedTab, setSelectedTab] = useState('global') // 'global', 'daily', 'streak'

  /**
   * Fetch top players from leaderboard
   */
  const fetchTopPlayers = useCallback(async (count = 20) => {
    if (!contract) return

    try {
      setIsFetching(true)

      const players = await readContract('getTopPlayers', count)
      
      const formattedPlayers = players.map((player, index) => ({
        rank: index + 1,
        address: player.player,
        totalWins: Number(player.totalWins),
        winRate: Number(player.winRate),
        totalEarned: player.totalEarned.toString(),
      }))

      setTopPlayers(formattedPlayers)

    } catch (err) {
      console.error('❌ Fetch top players error:', err)
      // If contract method fails, set empty array
      setTopPlayers([])
    } finally {
      setIsFetching(false)
    }
  }, [contract, readContract])

  /**
   * Fetch player's rank
   */
  const fetchMyRank = useCallback(async () => {
    if (!contract || !account) return

    try {
      // Check if player has pet first
      const hasPet = await readContract('hasPet', account)
      
      if (!hasPet) {
        setMyRank(null)
        return
      }

      const rank = await readContract('getPlayerRank', account)
      setMyRank(Number(rank))

    } catch (err) {
      console.error('❌ Fetch my rank error:', err)
      setMyRank(null)
    }
  }, [contract, account, readContract])

  /**
   * Fetch total pets (as total players)
   */
  const fetchTotalPlayers = useCallback(async () => {
    if (!contract) return

    try {
      const total = await readContract('totalPets')
      setTotalPlayers(Number(total))
    } catch (err) {
      console.error('❌ Fetch total players error:', err)
    }
  }, [contract, readContract])

  /**
   * Fetch platform stats
   */
  const fetchPlatformStats = useCallback(async () => {
    if (!contract) return

    try {
      const [balance, prizePool, lastReset] = await Promise.all([
        readContract('platformBalance'),
        readContract('weeklyPrizePool'),
        readContract('lastWeeklyReset'),
      ])

      setPlatformBalance(balance.toString())
      setWeeklyPrizePool(prizePool.toString())
      setLastWeeklyReset(Number(lastReset))

    } catch (err) {
      console.error('❌ Fetch platform stats error:', err)
    }
  }, [contract, readContract])

  /**
   * Get tier based on rank
   */
  const getTier = useCallback((rank) => {
    if (rank === 1) return { name: 'Diamond', icon: '💎', color: 'text-cyan-400' }
    if (rank >= 2 && rank <= 10) return { name: 'Gold', icon: '🏅', color: 'text-yellow-400' }
    if (rank >= 11 && rank <= 50) return { name: 'Silver', icon: '🥈', color: 'text-gray-400' }
    if (rank >= 51 && rank <= 100) return { name: 'Bronze', icon: '🥉', color: 'text-orange-400' }
    return { name: 'Unranked', icon: '⚪', color: 'text-gray-500' }
  }, [])

  /**
   * Get weekly prize for rank
   */
  const getWeeklyPrize = useCallback((rank) => {
    if (rank === 1) return '0.1'
    if (rank >= 2 && rank <= 3) return '0.05'
    if (rank >= 4 && rank <= 10) return '0.02'
    if (rank >= 11 && rank <= 20) return '0.01'
    return '0'
  }, [])

  /**
   * Calculate time until next weekly reset
   */
  const getTimeUntilReset = useCallback(() => {
    if (lastWeeklyReset === 0) return 0

    const weekInSeconds = 7 * 24 * 60 * 60
    const nextReset = lastWeeklyReset + weekInSeconds
    const now = Math.floor(Date.now() / 1000)
    
    return Math.max(0, nextReset - now)
  }, [lastWeeklyReset])

  /**
   * Sort players by different criteria
   */
  const sortPlayers = useCallback((players, sortBy) => {
    const sorted = [...players]
    
    switch (sortBy) {
      case 'wins':
        return sorted.sort((a, b) => b.totalWins - a.totalWins)
      case 'winRate':
        return sorted.sort((a, b) => b.winRate - a.winRate)
      case 'earned':
        return sorted.sort((a, b) => 
          BigInt(b.totalEarned) - BigInt(a.totalEarned)
        )
      default:
        return sorted
    }
  }, [])

  /**
   * Filter players for different tabs
   */
  const getFilteredPlayers = useCallback(() => {
    switch (selectedTab) {
      case 'global':
        return sortPlayers(topPlayers, 'wins')
      case 'daily':
        // For now, same as global (would need daily tracking in contract)
        return sortPlayers(topPlayers, 'wins')
      case 'streak':
        // Would need streak data from contract
        return sortPlayers(topPlayers, 'wins')
      default:
        return topPlayers
    }
  }, [topPlayers, selectedTab, sortPlayers])

  /**
   * Auto-fetch data on mount and account change
   */
  useEffect(() => {
    if (isConnected) {
      fetchTopPlayers()
      fetchTotalPlayers()
      fetchPlatformStats()
      
      if (account) {
        fetchMyRank()
      }
    }
  }, [isConnected, account, fetchTopPlayers, fetchTotalPlayers, fetchPlatformStats, fetchMyRank])

  /**
   * Auto-refresh every minute
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        fetchTopPlayers()
        if (account) {
          fetchMyRank()
        }
      }
    }, 60000) // 1 minute

    return () => clearInterval(interval)
  }, [isConnected, account, fetchTopPlayers, fetchMyRank])

  return {
    // Leaderboard data
    topPlayers,
    filteredPlayers: getFilteredPlayers(),
    myRank,
    totalPlayers,
    platformBalance,
    weeklyPrizePool,
    
    // Tab state
    selectedTab,
    setSelectedTab,
    
    // Computed
    myTier: myRank ? getTier(myRank) : null,
    timeUntilReset: getTimeUntilReset(),
    
    // Helpers
    getTier,
    getWeeklyPrize,
    sortPlayers,
    
    // Actions
    refreshLeaderboard: fetchTopPlayers,
    refreshMyRank: fetchMyRank,
    
    // States
    isLoading,
    isFetching,
    error,
  }
}

export default useLeaderboard