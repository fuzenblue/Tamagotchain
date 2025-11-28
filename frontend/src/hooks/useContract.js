import { useState, useCallback } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { ethers } from 'ethers'

export const useContract = () => {
  const { contract, account, isConnected } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [isWaitingTx, setIsWaitingTx] = useState(false)
  const [error, setError] = useState(null)

  const readContract = useCallback(async (functionName, ...args) => {
    if (!contract) throw new Error('Contract not available')
    try {
      const result = await contract[functionName](...args)
      return result
    } catch (err) {
      console.error(`Read contract error (${functionName}):`, err)
      throw err
    }
  }, [contract])

  const writeContract = useCallback(async (functionName, args = [], options = {}) => {
    if (!contract) throw new Error('Contract not available')
    
    try {
      setIsLoading(true)
      setError(null)
      
      console.log(`Calling ${functionName} with args:`, args, 'options:', options)
      const tx = await contract[functionName](...args, options)
      console.log('Transaction sent:', tx.hash)
      
      setIsWaitingTx(true)
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)
      
      return receipt
    } catch (err) {
      const errorMessage = err.reason || err.message || 'Transaction failed'
      
      // Check for expected cooldown errors
      if (errorMessage.includes('cooldown active') || errorMessage.includes('Feed cooldown')) {
        console.warn(`[Expected Cooldown - ${functionName}]: ${errorMessage}`)
      } else {
        console.error(`Write contract error (${functionName}):`, err)
      }
      
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
      setIsWaitingTx(false)
    }
  }, [contract])

  const parseValue = useCallback((ethAmount) => {
    return ethers.parseEther(ethAmount.toString())
  }, [])

  return {
    contract,
    account,
    isConnected,
    readContract,
    writeContract,
    parseValue,
    isLoading,
    isWaitingTx,
    error,
  }
}

export default useContract