import { useWeb3 } from '../context/Web3Context'
import { formatAddress } from '../utils/formatters'

/**
 * Custom hook for wallet operations
 */
export const useWallet = () => {
  const {
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    updateBalance,
    checkNetwork,
  } = useWeb3()

  // Helper: Format current address
  const formattedAddress = account ? formatAddress(account) : null

  // Helper: Check if on correct network
  const isCorrectNetwork = async () => {
    return await checkNetwork()
  }

  // Helper: Get balance as number
  const balanceNumber = parseFloat(balance)

  // Helper: Has enough balance
  const hasBalance = (amount) => {
    return balanceNumber >= parseFloat(amount)
  }

  return {
    // Wallet info
    account,
    formattedAddress,
    balance,
    balanceNumber,
    chainId,

    // Status
    isConnected,
    isConnecting,
    error,

    // Methods
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchNetwork,
    updateBalance,
    checkNetwork: isCorrectNetwork,
    hasBalance,
  }
}

export default useWallet