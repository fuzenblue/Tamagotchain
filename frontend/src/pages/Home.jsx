import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useWallet } from '../hooks/useWallet'
import { useWeb3 } from '../context/Web3Context'

const Home = () => {
    const {
        account,
        formattedAddress,
        balance,
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
    } = useWallet()
    
    const { contract } = useWeb3()

    console.log('Account:', account)
    console.log('Balance:', balance)
    console.log('Contract:', contract)

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-500 to-pink-500 flex items-center justify-center">
            <div className="text-center text-white">
                <h1 className="text-6xl font-bold mb-4">🐾 Tamagotchain V2</h1>
                <p className="text-xl mb-8">Battle. Earn. Dominate.</p>

                {/* Wallet Status */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 max-w-md mx-auto">
                    {isConnected ? (
                        <div className="space-y-3">
                            <div className="text-sm opacity-80">Connected Wallet</div>
                            <div className="font-mono text-lg">{formattedAddress}</div>
                            <div className="text-2xl font-bold">{parseFloat(balance).toFixed(4)} ETH</div>
                            <div className="text-xs opacity-60">Full: {account}</div>
                        </div>
                    ) : (
                        <div className="text-lg opacity-80">No wallet connected</div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 max-w-md mx-auto">
                        <div className="text-sm">❌ {error}</div>
                    </div>
                )}

                {/* Connect/Disconnect Button */}
                {isConnected ? (
                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.href = '/my-pet'}
                            className="px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:scale-105 transition"
                        >
                            Enter Game →
                        </button>
                        <div>
                            <button
                                onClick={disconnect}
                                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition"
                            >
                                Disconnect Wallet
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={connect}
                        disabled={isConnecting}
                        className="px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                )}

                {/* Debug Info */}
                <div className="mt-8 text-xs opacity-50">
                    <div>Network: {import.meta.env.VITE_CHAIN_ID}</div>
                    <div>Contract: {import.meta.env.VITE_CONTRACT_ADDRESS?.slice(0, 10)}...</div>
                </div>
            </div>
        </div>
    )
}

export default Home