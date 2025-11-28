import { useState, useEffect, useCallback } from 'react'
import { useContract } from './useContract'
import { GAME_CONFIG } from '../utils/contracts'
import { calculateCurrentStats } from '../utils/calculations'

/**
 * Hook for pet-related operations
 */
export const usePet = () => {
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

  const [pet, setPet] = useState(null)
  const [hasPet, setHasPet] = useState(false)
  const [currentStats, setCurrentStats] = useState(null)
  const [cooldowns, setCooldowns] = useState({
    feed: 0,
    play: 0,
    rest: 0,
    clean: 0,
  })
  const [isFetching, setIsFetching] = useState(false)

  /**
   * Fetch pet data from contract
   */
  const fetchPet = useCallback(async () => {
    if (!contract || !account) return

    try {
      setIsFetching(true)

      // Try to get pet data directly first
      try {
        console.log(`--- [PET DATA FETCH] ${new Date().toLocaleTimeString()} ---`)
        
        const petData = await readContract('getPet', account)
        
        console.log('Contract Data (Raw):', petData)
        
        // petData is a tuple: [name, hunger, happiness, energy, cleanliness, lastUpdate, birthTime, alive]
        if (petData && petData[0] && petData[0] !== '') {
          const petObject = {
            name: petData[0],
            hunger: Number(petData[1]),
            happiness: Number(petData[2]),
            energy: Number(petData[3]),
            cleanliness: Number(petData[4]),
            lastUpdate: Number(petData[5]),
            birthTime: Number(petData[6]),
            alive: petData[7],
          }

          console.log('Current Stats from Contract:', {
            hunger: petObject.hunger,
            happiness: petObject.happiness,
            energy: petObject.energy,
            lastUpdate: new Date(petObject.lastUpdate * 1000).toLocaleTimeString()
          })

          setPet(petObject)
          setHasPet(true)

          // Calculate current stats with decay
          const stats = calculateCurrentStats(petObject)
          console.log('Calculated Stats (with decay):', stats)
          setCurrentStats(stats)

          // Fetch cooldowns
          await fetchCooldowns()
          return
        }
      } catch (petErr) {
        console.log('No pet data found, checking hasPetCheck...')
      }

      // Fallback: check hasPetCheck function
      try {
        const hasUserPet = await readContract('hasPetCheck', account)
        setHasPet(hasUserPet)
        
        if (!hasUserPet) {
          setPet(null)
          setCurrentStats(null)
        }
      } catch (hasPetErr) {
        console.log('hasPetCheck function failed, assuming no pet')
        setHasPet(false)
        setPet(null)
        setCurrentStats(null)
      }

    } catch (err) {
      console.error('❌ Fetch pet error:', err)
      // Set defaults on error
      setHasPet(false)
      setPet(null)
      setCurrentStats(null)
    } finally {
      setIsFetching(false)
    }
  }, [contract, account, readContract])

  /**
   * Fetch cooldown times
   */
  const fetchCooldowns = useCallback(async () => {
    if (!contract || !account) return

    try {
      const [feedCd, playCd, restCd, cleanCd] = await Promise.all([
        readContract('getFeedCooldown', account),
        readContract('getPlayCooldown', account),
        readContract('getRestCooldown', account),
        readContract('getCleanCooldown', account),
      ])

      setCooldowns({
        feed: Number(feedCd),
        play: Number(playCd),
        rest: Number(restCd),
        clean: Number(cleanCd),
      })
    } catch (err) {
      console.error('❌ Fetch cooldowns error:', err)
      // Set default cooldowns
      setCooldowns({ feed: 0, play: 0, rest: 0, clean: 0 })
    }
  }, [contract, account, readContract])

  /**
   * Create pet
   */
  const createPet = async (name) => {
    try {
      if (!name || name.trim().length === 0) {
        throw new Error('Pet name is required')
      }

      if (name.length > 20) {
        throw new Error('Name too long (max 20 characters)')
      }

      const receipt = await writeContract('createPet', [name])
      
      // Refresh pet data
      await fetchPet()
      
      return receipt
    } catch (err) {
      throw err
    }
  }

  /**
   * Feed pet
   */
  const feed = async () => {
    try {
      const value = parseValue(GAME_CONFIG.FEED_COST)
      const receipt = await writeContract('feed', [], { value })
      
      // Refresh pet data
      await fetchPet()
      
      return receipt
    } catch (err) {
      throw err
    }
  }

  /**
   * Play with pet
   */
  const play = async () => {
    try {
      const value = parseValue(GAME_CONFIG.PLAY_COST)
      const receipt = await writeContract('play', [], { value })
      
      // Refresh pet data
      await fetchPet()
      
      return receipt
    } catch (err) {
      throw err
    }
  }

  /**
   * Rest pet
   */
  const rest = async () => {
    try {
      const receipt = await writeContract('rest', [])
      
      // Refresh pet data
      await fetchPet()
      
      return receipt
    } catch (err) {
      throw err
    }
  }

  /**
   * Clean pet
   */
  const clean = async () => {
    try {
      const value = parseValue(GAME_CONFIG.CLEAN_COST)
      const receipt = await writeContract('clean', [], { value })
      
      // Refresh pet data
      await fetchPet()
      
      return receipt
    } catch (err) {
      throw err
    }
  }

  /**
   * Update stats (force sync with blockchain)
   */
  const updateStats = async () => {
    try {
      const receipt = await writeContract('updateStats', [])
      
      // Refresh pet data
      await fetchPet()
      
      return receipt
    } catch (err) {
      throw err
    }
  }

  /**
   * Revive dead pet
   */
  const revivePet = async () => {
    try {
      const value = parseValue('0.01')
      const receipt = await writeContract('revivePet', [], { value })
      
      // Refresh pet data
      await fetchPet()
      
      return receipt
    } catch (err) {
      throw err
    }
  }

  /**
   * Calculate Combat Power
   */
  const calculateCP = useCallback(() => {
    if (!currentStats) return 0
    
    const cp = 
      (currentStats.hunger * GAME_CONFIG.CP_WEIGHTS.HUNGER) +
      (currentStats.happiness * GAME_CONFIG.CP_WEIGHTS.HAPPINESS) +
      (currentStats.energy * GAME_CONFIG.CP_WEIGHTS.ENERGY)
    
    return Math.round(cp)
  }, [currentStats])

  /**
   * Auto-fetch pet on mount and account change
   */
  useEffect(() => {
    if (isConnected && account) {
      fetchPet()
    }
  }, [isConnected, account, fetchPet])

  /**
   * Auto-refresh from contract every 30 seconds
   */
  useEffect(() => {
    if (!hasPet) return

    const interval = setInterval(() => {
      fetchPet()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [hasPet, fetchPet])

  /**
   * Auto-update current stats with decay every 1 second
   */
  useEffect(() => {
    if (!hasPet || !pet) return

    const interval = setInterval(() => {
      const stats = calculateCurrentStats(pet)
      setCurrentStats(stats)
    }, 1000) // 1 second

    return () => clearInterval(interval)
  }, [hasPet, pet])

  return {
    // Pet data
    pet,
    hasPet,
    currentStats,
    cooldowns,
    
    // Computed
    combatPower: calculateCP(),
    
    // Actions
    createPet,
    feed,
    play,
    rest,
    clean,
    updateStats,
    revivePet,
    refreshPet: fetchPet,
    
    // States
    isLoading,
    isWaitingTx,
    isFetching,
    error,
  }
}

export default usePet