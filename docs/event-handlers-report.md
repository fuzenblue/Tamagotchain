# Event Handlers Report - Tamagotchain Frontend

## Smart Contract Integration Points

### 1. Pet Management Actions

#### Create Pet Button
- **Location**: Home page (ยังไม่ได้ implement)
- **Function**: `createPet()`
- **Parameters**: `petName: string`
- **Smart Contract**: TamagotChain.sol
- **Current Status**: ❌ ยังไม่ได้เชื่อม
- **Expected Implementation**:
  ```javascript
  const handleCreatePet = async (name) => {
    const contract = await getContract();
    await contract.createPet(name);
  }
  ```

#### Feed Button
- **Location**: MyPet page - `handleFeedClick()`
- **Function**: `feed()`
- **Cost**: 0.001 ETH (ถ้าไม่มี stock)
- **Smart Contract**: CareSystem.sol
- **Current Status**: ❌ ใช้ localStorage simulation
- **Expected Implementation**:
  ```javascript
  const handleFeed = async () => {
    const contract = await getCareSystemContract();
    await contract.feed({ value: ethers.utils.parseEther("0.001") });
  }
  ```

#### Play Button
- **Location**: MyPet page - `handleActionClick('play')`
- **Function**: `play()`
- **Cost**: 0.001 ETH (ถ้าไม่มี stock)
- **Smart Contract**: CareSystem.sol
- **Current Status**: ❌ ใช้ localStorage simulation
- **Expected Implementation**:
  ```javascript
  const handlePlay = async () => {
    const contract = await getCareSystemContract();
    await contract.play({ value: ethers.utils.parseEther("0.001") });
  }
  ```

#### Rest Button
- **Location**: MyPet page - `handleActionClick('rest')`
- **Function**: `rest()`
- **Cost**: Free
- **Smart Contract**: CareSystem.sol
- **Current Status**: ❌ ใช้ localStorage simulation
- **Expected Implementation**:
  ```javascript
  const handleRest = async () => {
    const contract = await getCareSystemContract();
    await contract.rest();
  }
  ```

### 2. Battle System Actions

#### Enter Battle Button
- **Location**: Battle page - `startBattle()`
- **Function**: `enterBattle()`
- **Cost**: 0.01 ETH entry fee
- **Smart Contract**: BattleArena.sol
- **Current Status**: ❌ ใช้ localStorage simulation
- **Expected Implementation**:
  ```javascript
  const handleEnterBattle = async () => {
    const contract = await getBattleArenaContract();
    await contract.enterBattle({ value: ethers.utils.parseEther("0.01") });
  }
  ```

### 3. Wallet Connection

#### Connect Wallet Button
- **Location**: Home page, Sidebar
- **Function**: `connectWallet()`
- **Current Status**: ❌ ยังไม่ได้ implement
- **Expected Implementation**:
  ```javascript
  const handleConnectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setWallet(await signer.getAddress());
    }
  }
  ```

## Current Event Handlers (Local State Only)

### MyPet Page Handlers

#### 1. handleFeedClick()
- **Current Logic**: ใช้ foodStock จาก localStorage
- **Actions**: 
  - ลด foodStock
  - เพิ่ม hunger +30
  - แสดง animation 'EAT'
  - แสดง toast notification

#### 2. handleActionClick(type)
- **Parameters**: `type: 'play' | 'rest'`
- **Current Logic**: 
  - ตรวจสอบ cooldown และ stock
  - แสดง confirmation modal ถ้าต้องจ่ายเงิน
  - เรียก executeAction() ถ้าฟรี

#### 3. executeAction(type)
- **Current Logic**:
  - ลด actionStock
  - ตั้ง cooldown timer
  - อัปเดตสถิติ (happiness/energy)
  - แสดง animation

#### 4. handleClean()
- **Current Logic**:
  - ตั้ง cleanliness = 100
  - เพิ่ม happiness +10
  - แสดง animation 'WALK'

#### 5. onConfirm() - Modal Confirmation
- **Current Logic**:
  - ตรวจสอบ ETH balance
  - ดำเนินการตาม mode (REFILL_FOOD, REFILL_STOCK, SKIP_CD)
  - อัปเดต localStorage stats

### Battle Page Handlers

#### 1. startBattle()
- **Current Logic**:
  - คำนวณ Combat Power จากสถิติ
  - สุ่มพลังศัตรู
  - แสดง animation 2.5 วินาที
  - เรียก determineWinner()

#### 2. determineWinner()
- **Current Logic**:
  - เปรียบเทียบพลัง
  - บันทึกผลใน localStorage
  - อัปเดต leaderboard stats ถ้าชนะ

### Navigation Handlers

#### 1. navigate() - React Router
- **Usage**: `navigate('/battle')`, `navigate('/leaderboard')`
- **Locations**: ทุกหน้าที่มีปุ่มนำทาง

#### 2. Sidebar Navigation
- **Component**: NavLink จาก React Router
- **Auto-close**: ปิดเมนูอัตโนมัติในมือถือ

## Missing Integrations ที่ต้องเพิ่ม

### 1. Web3 Provider Setup
```javascript
// ใน Web3Context.jsx (ยังว่าง)
const Web3Provider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [contracts, setContracts] = useState({});
  
  // Setup provider, contracts, etc.
}
```

### 2. Contract Hooks
```javascript
// ใน useContract.js (ยังว่าง)
const useContract = (contractName) => {
  // Return contract instance
}
```

### 3. Pet State Sync
```javascript
// ใน usePet.js (ยังว่าง)  
const usePet = () => {
  // Sync pet stats from blockchain
  // Handle real-time updates
}
```

### 4. Event Listeners
```javascript
// Listen to blockchain events
contract.on('PetFed', (owner, newHunger) => {
  updatePetStats({ hunger: newHunger });
});

contract.on('BattleResult', (winner, loser, reward) => {
  updateBattleHistory({ winner, loser, reward });
});
```

## Error Handling Patterns ที่ต้องเพิ่ม

### Transaction Error Handling
```javascript
try {
  const tx = await contract.feed({ value: cost });
  await tx.wait();
  showToast("Fed successfully!", "success");
} catch (error) {
  if (error.code === 4001) {
    showToast("Transaction cancelled", "error");
  } else {
    showToast("Transaction failed", "error");
  }
}
```

### Network Error Handling
```javascript
const checkNetwork = async () => {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId !== '0x7A69') { // Hardhat local network
    showToast("Please switch to Hardhat network", "error");
  }
}
```