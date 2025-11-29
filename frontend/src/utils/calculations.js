import { GAME_CONFIG } from './contracts'

export const calculateCurrentStats = (pet) => {
  if (!pet) return { hunger: 0, happiness: 0, energy: 0, cleanliness: 0, health: 0, alive: false }

  const now = Math.floor(Date.now() / 1000)
  const timeDiff = now - (pet.lastUpdate || now)
  const hoursPassed = Math.max(0, timeDiff / 3600)

  // Calculate decay (use defaults if GAME_CONFIG not available)
  const hungerDecay = hoursPassed * (GAME_CONFIG?.HUNGER_DECAY || 10)
  const happinessDecay = hoursPassed * (GAME_CONFIG?.HAPPINESS_DECAY || 5)  
  const energyDecay = hoursPassed * (GAME_CONFIG?.ENERGY_DECAY || 10)

  // Apply decay
  const currentHunger = Math.max(0, (pet.hunger || 100) - hungerDecay)
  const currentHappiness = Math.max(0, (pet.happiness || 100) - happinessDecay)
  const currentEnergy = Math.max(0, (pet.energy || 100) - energyDecay)
  const currentCleanliness = pet.cleanliness || 100
  const currentHealth = pet.health || 100

  return {
    hunger: Math.round(currentHunger),
    happiness: Math.round(currentHappiness),
    energy: Math.round(currentEnergy),
    cleanliness: Math.round(currentCleanliness),
    health: Math.round(currentHealth),
    alive: pet.alive !== false && currentHunger > 0 && currentEnergy > 0
  }
}