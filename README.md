# 🐾 Tamagotchain V2

Battle-focused Tamagotchi game on Ethereum.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation

# Install dependencies
npm install

# Start local blockchain
npm run chain

# (New terminal) Deploy contracts
npm run deploy

# (New terminal) Start frontend
npm run frontend


## 📁 Project Structure

tamagotchain/
├── blockchain/ # Smart contracts (Hardhat)
├── frontend/ # React frontend (Vite)
└── docs/ # Documentation


## 🎮 Game Mechanics

- **Create Pet**: Free (gas only)
- **Care Actions**: 0.001 ETH (Feed/Play)
- **Battle Entry**: 0.01 ETH
- **Win Reward**: 0.018 ETH

## 📚 Documentation

See `/docs` folder for detailed documentation.

## 🧪 Testing

# Test contracts
cd blockchain
npm test
