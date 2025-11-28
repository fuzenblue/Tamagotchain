import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { CONTRACTS, NETWORKS } from '../utils/contracts'

const Web3Context = createContext()

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider')
  }
  return context
}

export const Web3Provider = ({ children }) => {
  // ============ State ============
  const [account, setAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [balance, setBalance] = useState('0')
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  // ============ Connect Wallet ============
  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      setError(null)

      // ตรวจสอบ MetaMask
      if (!window.ethereum) {
        throw new Error('Please install MetaMask')
      }

      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Setup provider
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      const web3Signer = await web3Provider.getSigner()
      const network = await web3Provider.getNetwork()
      const userBalance = await web3Provider.getBalance(accounts[0])

      // Setup contract instance
      const contractInstance = new ethers.Contract(
        CONTRACTS.LEADERBOARD.address,
        CONTRACTS.LEADERBOARD.abi,
        web3Signer
      )

      // Update state
      setAccount(accounts[0])
      setChainId(network.chainId.toString())
      setBalance(ethers.formatEther(userBalance))
      setProvider(web3Provider)
      setSigner(web3Signer)
      setContract(contractInstance)
      setIsConnected(true)

      // Save to localStorage
      localStorage.setItem('walletConnected', 'true')

      console.log('✅ Wallet connected:', accounts[0])
      return accounts[0]

    } catch (err) {
      console.error('❌ Connect wallet error:', err)
      setError(err.message)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  // ============ Disconnect Wallet ============
  const disconnectWallet = () => {
    setAccount(null)
    setChainId(null)
    setBalance('0')
    setProvider(null)
    setSigner(null)
    setContract(null)
    setIsConnected(false)
    setError(null)
    
    localStorage.removeItem('walletConnected')
    console.log('👋 Wallet disconnected')
  }

  // ============ Switch Network ============
  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORKS.LOCALHOST.chainId }],
      })
    } catch (switchError) {
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORKS.LOCALHOST],
          })
        } catch (addError) {
          console.error('❌ Failed to add network:', addError)
          throw addError
        }
      } else {
        throw switchError
      }
    }
  }

  // ============ Update Balance ============
  const updateBalance = async () => {
    if (!provider || !account) return

    try {
      const userBalance = await provider.getBalance(account)
      setBalance(ethers.formatEther(userBalance))
    } catch (err) {
      console.error('❌ Update balance error:', err)
    }
  }

  // ============ Check Network ============
  const checkNetwork = async () => {
    if (!provider) return false

    const network = await provider.getNetwork()
    const currentChainId = network.chainId.toString()
    const expectedChainId = import.meta.env.VITE_CHAIN_ID

    return currentChainId === expectedChainId
  }

  // ============ Event Listeners ============
  useEffect(() => {
    if (!window.ethereum) return

    // Account changed
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== account) {
        console.log('🔄 Account changed:', accounts[0])
        connectWallet() // Reconnect with new account
      }
    }

    // Chain changed
    const handleChainChanged = () => {
      console.log('🔄 Network changed, reloading...')
      window.location.reload()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [account])

  // ============ Auto-connect ============
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected')
    
    if (wasConnected === 'true' && window.ethereum) {
      connectWallet().catch(err => {
        console.log('Auto-connect failed:', err.message)
        localStorage.removeItem('walletConnected')
      })
    }
  }, [])

  // ============ Context Value ============
  const value = {
    // State
    account,
    chainId,
    balance,
    provider,
    signer,
    contract,
    isConnecting,
    isConnected,
    error,

    // Methods
    connectWallet,
    disconnectWallet,
    switchNetwork,
    updateBalance,
    checkNetwork,
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

export default Web3Context