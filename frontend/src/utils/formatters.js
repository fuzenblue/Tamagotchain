// frontend/src/utils/formatters.js

/**
 * Format ETH amount
 */
export const formatEther = (wei) => {
  if (!wei) return '0.0000'
  const num = parseFloat(wei.toString()) / 1e18
  return num.toFixed(4)
}

/**
 * Format address (short version)
 */
export const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format timestamp to readable date
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleString()
}

/**
 * Format time remaining (cooldown)
 */
export const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return 'Ready'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * Format win rate percentage
 */
export const formatWinRate = (wins, total) => {
  if (total === 0) return '0%'
  return `${Math.round((wins / total) * 100)}%`
}

/**
 * Parse ETH to Wei
 */
export const parseEther = (eth) => {
  return (parseFloat(eth) * 1e18).toString()
}