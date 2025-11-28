# State Management Report - Tamagotchain Frontend

## Current State Management (localStorage Based)

### 1. Pet Stats State

#### MyPet Page State
```javascript
// Core pet statistics
const [health, setHealth] = useState(80);
const [hunger, setHunger] = useState(86);
const [happiness, setHappiness] = useState(88);
const [energy, setEnergy] = useState(98);
const [cleanliness, setCleanliness] = useState(100);
const [petStatus, setPetStatus] = useState('IDLE');

// Pet name management
const [petName, setPetName] = useState(() => 
  localStorage.getItem('my_pet_name') || DEFAULT_NAMES[0]
);
```

#### Stock & Cooldown System
```javascript
// Food stock (regenerates every 30 minutes)
const [foodStock, setFoodStock] = useState(() => {
  const saved = localStorage.getItem('pet_food_stock');
  return saved ? JSON.parse(saved) : { count: 3, lastRegen: Date.now() };
});

// Action stocks (Play/Rest regenerate every 60 minutes)
const [actionStock, setActionStock] = useState(() => {
  const saved = localStorage.getItem('pet_action_stock');
  return saved ? JSON.parse(saved) : { 
    play: 5, lastRegenPlay: Date.now(),
    rest: 5, lastRegenRest: Date.now() 
  };
});

// Cooldown timers (1 minute between actions)
const [lastActionTime, setLastActionTime] = useState(() => {
  const saved = localStorage.getItem('pet_cooldowns');
  return saved ? JSON.parse(saved) : { play: 0, rest: 0 };
});
```

### 2. Battle System State

#### Battle Page State
```javascript
const [battleState, setBattleState] = useState('IDLE'); // IDLE, FIGHTING, FINISHED
const [myPower, setMyPower] = useState(playerHealth);
const [enemyPower, setEnemyPower] = useState(0);
const [winner, setWinner] = useState(null);
const [logs, setLogs] = useState([]);
```

#### Battle History (localStorage)
```javascript
// Structure: battle_history
[
  {
    id: timestamp,
    date: string,
    result: 'WIN' | 'LOSE' | 'DRAW',
    enemyName: string,
    myPower: number,
    enemyPower: number,
    reward: string,
    netEthChange: number,
    runningBalance: string
  }
]
```

### 3. Global Player Stats

#### Leaderboard Stats (localStorage)
```javascript
// Structure: tamagotchain_stats
{
  wins: number,
  eth: number,
  streak: number
}
```

### 4. UI State Management

#### Notification System
```javascript
const [notification, setNotification] = useState(null);
// Structure: { msg: string, type: 'success' | 'error' }
```

#### Modal State
```javascript
const [confirmData, setConfirmData] = useState(null);
// Structure: { mode: string, type: string, cost: number, msg: string }
```

#### Sidebar State
```javascript
const [isOpen, setIsOpen] = useState(true); // Mobile menu toggle
```

## Required Blockchain State Integration

### 1. Pet Contract State

#### Pet Data Structure (from TamagotChain.sol)
```javascript
// Expected from smart contract
const petData = {
  name: string,
  hunger: uint256,
  happiness: uint256, 
  energy: uint256,
  health: uint256,
  lastFed: uint256,
  lastPlayed: uint256,
  lastRested: uint256,
  alive: boolean,
  owner: address
}
```

#### Required State Sync
```javascript
// ใน PetContext.jsx (ยังว่าง)
const PetProvider = ({ children }) => {
  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Sync with blockchain
  const syncPetData = async () => {
    const contract = await getContract();
    const data = await contract.getPet(userAddress);
    setPetData(data);
  };
  
  // Real-time updates
  useEffect(() => {
    const interval = setInterval(syncPetData, 5000);
    return () => clearInterval(interval);
  }, []);
}
```

### 2. Battle Arena State

#### Battle Queue & Matchmaking
```javascript
// Expected from BattleArena.sol
const battleState = {
  inQueue: boolean,
  currentBattle: {
    player1: address,
    player2: address,
    player1Power: uint256,
    player2Power: uint256,
    winner: address,
    reward: uint256,
    timestamp: uint256
  }
}
```

#### Battle History (Blockchain Events)
```javascript
// Listen to BattleResult events
const useBattleHistory = () => {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    const contract = getBattleArenaContract();
    const filter = contract.filters.BattleResult(userAddress);
    
    contract.on(filter, (player1, player2, winner, reward, event) => {
      const newBattle = {
        opponent: player1 === userAddress ? player2 : player1,
        result: winner === userAddress ? 'WIN' : 'LOSE',
        reward: ethers.utils.formatEther(reward),
        timestamp: event.blockNumber
      };
      setHistory(prev => [newBattle, ...prev]);
    });
  }, []);
}
```

### 3. Leaderboard State

#### Global Rankings (from Leaderboard.sol)
```javascript
const leaderboardData = {
  players: [
    {
      address: string,
      wins: uint256,
      totalEarnings: uint256,
      currentStreak: uint256,
      rank: uint256
    }
  ],
  myRank: uint256,
  totalPlayers: uint256
}
```

### 4. Wallet & Web3 State

#### Web3 Context (ต้องสร้างใน Web3Context.jsx)
```javascript
const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contracts, setContracts] = useState({});
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  
  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
}
```

## State Update Patterns ที่ต้องใช้

### 1. Optimistic Updates
```javascript
// Update UI immediately, sync with blockchain later
const handleFeed = async () => {
  // Optimistic update
  setHunger(prev => Math.min(prev + 20, 100));
  setPetStatus('EAT');
  
  try {
    const tx = await contract.feed({ value: cost });
    await tx.wait();
    // Sync real data
    await syncPetData();
  } catch (error) {
    // Revert optimistic update
    await syncPetData();
    showError("Transaction failed");
  }
}
```

### 2. Event-Driven Updates
```javascript
// Listen to contract events for real-time updates
useEffect(() => {
  const contract = getContract();
  
  contract.on('PetFed', (owner, newHunger) => {
    if (owner === userAddress) {
      setHunger(newHunger.toNumber());
    }
  });
  
  contract.on('BattleResult', (winner, loser, reward) => {
    if (winner === userAddress || loser === userAddress) {
      updateBattleHistory();
      updateLeaderboard();
    }
  });
}, [userAddress]);
```

### 3. Cooldown Management
```javascript
// Sync cooldowns with blockchain timestamps
const useCooldowns = () => {
  const [cooldowns, setCooldowns] = useState({});
  
  const checkCooldown = async (action) => {
    const contract = getContract();
    const lastAction = await contract.getLastActionTime(userAddress, action);
    const cooldownPeriod = await contract.getCooldownPeriod(action);
    const now = Math.floor(Date.now() / 1000);
    
    return {
      canAct: now >= lastAction.add(cooldownPeriod).toNumber(),
      timeLeft: Math.max(0, lastAction.add(cooldownPeriod).toNumber() - now)
    };
  };
}
```

## Data Flow Architecture

### 1. Current Flow (localStorage)
```
User Action → Local State Update → localStorage → UI Update
```

### 2. Required Flow (Blockchain)
```
User Action → Optimistic UI Update → Smart Contract Call → 
Event Listener → State Sync → Final UI Update
```

### 3. Error Handling Flow
```
Transaction Fail → Revert Optimistic Update → 
Show Error Message → Sync Real State
```

## Performance Considerations

### 1. State Caching
```javascript
// Cache frequently accessed data
const useContractCache = () => {
  const [cache, setCache] = useState({});
  const [lastUpdate, setLastUpdate] = useState(0);
  
  const getCachedData = async (key, fetcher, ttl = 30000) => {
    const now = Date.now();
    if (cache[key] && (now - lastUpdate) < ttl) {
      return cache[key];
    }
    
    const data = await fetcher();
    setCache(prev => ({ ...prev, [key]: data }));
    setLastUpdate(now);
    return data;
  };
}
```

### 2. Batch Updates
```javascript
// Batch multiple state updates
const batchUpdatePetStats = (updates) => {
  startTransition(() => {
    Object.entries(updates).forEach(([key, value]) => {
      switch(key) {
        case 'hunger': setHunger(value); break;
        case 'energy': setEnergy(value); break;
        case 'happiness': setHappiness(value); break;
      }
    });
  });
}
```

### 3. Debounced Sync
```javascript
// Debounce frequent updates
const debouncedSync = useCallback(
  debounce(async () => {
    await syncPetData();
  }, 1000),
  []
);
```