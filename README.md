# 🐾 Tamagotchain

A battle-focused Tamagotchi game built on Ethereum where players create, care for, and battle their virtual pets.

## ✨ Features

- 🎯 **Pet Creation** - Create unique virtual pets with stats
- 🍖 **Care System** - Feed, play, and rest to maintain pet health
- ⚔️ **Battle Arena** - Enter battles and earn ETH rewards
- 🏆 **Leaderboard** - Compete for top rankings
- 💰 **Play-to-Earn** - Win battles to earn cryptocurrency

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Tamagotchain

# Install dependencies
npm install

# Install blockchain dependencies
cd blockchain
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Development Setup

```bash
# 1. Start local blockchain (Terminal 1)
cd blockchain
npm run node

# 2. Deploy contracts (Terminal 2)
cd blockchain
npm run deploy

# 3. Seed test data
npm run seed

# 4. Start frontend (Terminal 3)
cd frontend
npm run dev
```

## 📁 Project Structure

```
Tamagotchain/
├── blockchain/          # Smart contracts (Hardhat)
│   ├── contracts/       # Solidity contracts
│   ├── scripts/         # Deployment & seed scripts
│   ├── test/           # Contract tests
│   └── deployments/    # Deployment artifacts
├── frontend/           # React frontend (Vite)
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom hooks
│   │   └── services/   # Web3 services
│   └── public/         # Static assets
├── docs/              # Documentation
└── asset/             # Game assets
```

## 🎮 Game Mechanics

### Pet Management
- **Create Pet**: Free (gas only)
- **Feed Pet**: 0.001 ETH (+20 Hunger)
- **Play with Pet**: 0.001 ETH (+20 Happiness)
- **Rest Pet**: Free (+20 Energy)

### Battle System
- **Entry Fee**: 0.01 ETH
- **Winner Reward**: 0.018 ETH (90%)
- **Platform Fee**: 0.002 ETH (10%)
- **Matchmaking**: Automatic based on Combat Power (CP)

### Stats System
- **Hunger**: Affects pet health (decays over time)
- **Happiness**: Affects battle performance
- **Energy**: Required for battles (minimum 20)
- **Combat Power (CP)**: Calculated from all stats

## 🔧 Smart Contracts

### Contract Architecture
- **TamagotChain.sol** - Core pet management
- **CareSystem.sol** - Pet care actions (feed/play/rest)
- **BattleArena.sol** - Battle system and matchmaking
- **Leaderboard.sol** - Rankings and prize distribution

### Key Functions
```solidity
// Pet Management
function createPet(string memory _name) external
function getPet(address _owner) external view returns (...)

// Care System
function feed() external payable
function play() external payable
function rest() external

// Battle System
function enterBattle() external payable
function getPlayerStats(address _player) external view returns (...)
```

## 🌐 Frontend

### Technology Stack
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Ethers.js** - Web3 integration
- **Zustand** - State management
- **React Router** - Navigation

### Key Features
- Responsive design
- Real-time pet stats
- Battle history
- Leaderboard display
- Wallet integration

## 🧪 Testing

### Contract Testing
```bash
cd blockchain
npm test
```

### Manual Testing
```bash
# Deploy and seed test data
npm run deploy
npm run seed

# Check deployment
node scripts/debug.js
```

## 📚 Documentation

- [Error Report](./docs/error-report.md) - Common issues and solutions
- [API Documentation](./docs/) - Contract interfaces
- [Game Guide](./docs/) - How to play

## 🚨 Troubleshooting

### Common Issues

1. **Tailwind CSS not loading**
   - Solution: Using CDN in index.html

2. **Contract function errors**
   - Check if contracts are deployed
   - Verify network connection

3. **Battle not occurring**
   - Ensure pets have enough energy (≥20)
   - Check battle cooldown (10 seconds)

See [Error Report](./docs/error-report.md) for detailed solutions.

## 🛠 Development Commands

### Blockchain
```bash
cd blockchain
npm run node        # Start local network
npm run compile     # Compile contracts
npm run deploy      # Deploy to localhost
npm run seed        # Seed test data
npm test           # Run tests
```

### Frontend
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview build
```

## 🔗 Links

- [Demo](https://tamagotchain-demo.com) (Coming soon)
- [Documentation](./docs/)
- [Bug Reports](./docs/error-report.md)
- [Setup Guide](./asset/setup-guide.txt)

---

**Built with ❤️ for the Web3 gaming community**