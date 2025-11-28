// frontend/src/utils/contracts.js
import LeaderboardJSON from './LeaderboardABI.json'

// Contract configuration
export const CONTRACTS = {
  LEADERBOARD: {
    address: import.meta.env.VITE_CONTRACT_ADDRESS || '',
    abi: LeaderboardJSON.abi
  }
}

// Network configuration
export const NETWORKS = {
  LOCALHOST: {
    chainId: '0x539', // 1337 in hex
    chainName: 'Localhost 8545',
    rpcUrls: ['http://127.0.0.1:8545'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  }
}

// Game constants (จาก smart contract)
export const GAME_CONFIG = {
  // Care costs
  FEED_COST: '0.8',
  PLAY_COST: '0.5',
  REST_COST: '0',
  CLEAN_COST: '0.4',
  
  // Battle costs
  BATTLE_ENTRY: '0.01',
  BATTLE_REWARD: '0.018',
  PLATFORM_FEE: '0.002',
  
  // Stat limits
  MAX_STAT: 100,
  MIN_STAT: 0,
  
  // Decay rates (per hour)
  HUNGER_DECAY: 1,
  HAPPINESS_DECAY: 0.5,
  ENERGY_DECAY: 1,
  
  // Cooldowns (seconds)
  FEED_COOLDOWN: 3600,    // 1 hour
  PLAY_COOLDOWN: 3600,    // 1 hour
  REST_COOLDOWN: 7200,    // 2 hours
  BATTLE_COOLDOWN: 120,   // 2 minutes
  
  // Combat
  CP_WEIGHTS: {
    HUNGER: 0.3,    // 30% weight, ≥90: +5% damage
    HAPPINESS: 0.2, // 20% weight, ≥90: +5% crit
    ENERGY: 0.5     // 50% weight, ≥90: +10% evasion
  }
}

export default CONTRACTS