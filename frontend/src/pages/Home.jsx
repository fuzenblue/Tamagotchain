import React from 'react'

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-500 to-pink-500 flex items-center justify-center">
            <div className="text-center text-white">
                <h1 className="text-6xl font-bold mb-4">🐾 Tamagotchain</h1>
                <p className="text-xl">Battle. Earn. Dominate.</p>
                <button className="mt-8 px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:scale-105 transition">
                    Connect Wallet
                </button>
            </div>
        </div>
    )
}

export default Home