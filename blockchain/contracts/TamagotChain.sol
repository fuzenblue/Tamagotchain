// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TamagotChain
 * @dev Core pet management contract
 */
contract TamagotChain {
    
    // ============ Structs ============
    
    struct Pet {
        string name;
        uint256 hunger;        // 0-100
        uint256 happiness;     // 0-100
        uint256 energy;        // 0-100
        uint256 cleanliness;   // 0-100
        uint256 lastUpdate;    // timestamp
        uint256 lastClean;     // timestamp
        uint256 birthTime;     // timestamp
        bool alive;
    }
    
    // ============ State Variables ============
    
    mapping(address => Pet) public pets;
    mapping(address => bool) public hasPet;
    
    uint256 public constant MAX_STAT = 100;
    uint256 public constant HUNGER_DECAY_RATE = 1;     // per hour
    uint256 public constant HAPPINESS_DECAY_RATE = 1;  // per 2 hours (0.5/hour)
    uint256 public constant ENERGY_DECAY_RATE = 1;     // per hour
    
    uint256 public totalPets;
    
    // ============ Events ============
    
    event PetCreated(address indexed owner, string name, uint256 timestamp);
    event StatsUpdated(address indexed owner, uint256 hunger, uint256 happiness, uint256 energy);
    event PetDied(address indexed owner, uint256 timestamp);
    event PetRevived(address indexed owner, uint256 timestamp);
    
    // ============ Modifiers ============
    
    modifier onlyPetOwner() {
        require(hasPet[msg.sender], "You don't have a pet");
        require(pets[msg.sender].alive, "Pet is dead");
        _;
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Create a new pet
     * @param _name Pet name
     */
    function createPet(string memory _name) external {
        require(!hasPet[msg.sender], "You already have a pet");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_name).length <= 20, "Name too long");
        
        pets[msg.sender] = Pet({
            name: _name,
            hunger: 50,
            happiness: 50,
            energy: 50,
            cleanliness: 100,
            lastUpdate: block.timestamp,
            lastClean: block.timestamp,
            birthTime: block.timestamp,
            alive: true
        });
        
        hasPet[msg.sender] = true;
        totalPets++;
        
        emit PetCreated(msg.sender, _name, block.timestamp);
    }
    
    /**
     * @dev Update pet stats based on time decay
     */
    function updateStats() public {
        require(hasPet[msg.sender], "You don't have a pet");
        
        Pet storage pet = pets[msg.sender];
        
        if (!pet.alive) return;
        
        uint256 timeElapsed = block.timestamp - pet.lastUpdate;
        uint256 hoursElapsed = timeElapsed / 1 hours;
        
        if (hoursElapsed > 0) {
            // Calculate decay
            uint256 hungerDecay = hoursElapsed * HUNGER_DECAY_RATE;
            uint256 happinessDecay = hoursElapsed * HAPPINESS_DECAY_RATE;
            uint256 energyDecay = hoursElapsed * ENERGY_DECAY_RATE;
            
            // Apply decay (prevent underflow)
            pet.hunger = pet.hunger > hungerDecay ? pet.hunger - hungerDecay : 0;
            pet.happiness = pet.happiness > happinessDecay ? pet.happiness - happinessDecay : 0;
            pet.energy = pet.energy > energyDecay ? pet.energy - energyDecay : 0;
            
            pet.lastUpdate = block.timestamp;
            
            // Check if pet dies (all stats = 0)
            if (pet.hunger == 0 && pet.happiness == 0 && pet.energy == 0) {
                pet.alive = false;
                emit PetDied(msg.sender, block.timestamp);
            }
            
            emit StatsUpdated(msg.sender, pet.hunger, pet.happiness, pet.energy);
        }
    }
    
    /**
     * @dev Check if address has a pet
     */
    function hasPetCheck(address _owner) external view returns (bool) {
        return hasPet[_owner];
    }
    
    /**
     * @dev Check if address has a pet (alternative name for compatibility)
     */
    function hasPetFunction(address _owner) external view returns (bool) {
        return hasPet[_owner];
    }
    
    /**
     * @dev Get pet info with real-time decay calculation
     */
    function getPet(address _owner) external view returns (
        string memory name,
        uint256 hunger,
        uint256 happiness,
        uint256 energy,
        uint256 cleanliness,
        uint256 lastUpdate,
        uint256 birthTime,
        bool alive
    ) {
        if (!hasPet[_owner]) {
            return ("", 0, 0, 0, 0, 0, 0, false);
        }
        
        Pet memory pet = pets[_owner];
        
        // Calculate decay in real-time
        if (pet.alive) {
            uint256 timeElapsed = block.timestamp - pet.lastUpdate;
            uint256 hoursElapsed = timeElapsed / 1 hours;
            
            if (hoursElapsed > 0) {
                // Calculate decay
                uint256 hungerDecay = hoursElapsed * HUNGER_DECAY_RATE;
                uint256 happinessDecay = hoursElapsed * HAPPINESS_DECAY_RATE;
                uint256 energyDecay = hoursElapsed * ENERGY_DECAY_RATE;
                
                // Apply decay (prevent underflow)
                pet.hunger = pet.hunger > hungerDecay ? pet.hunger - hungerDecay : 0;
                pet.happiness = pet.happiness > happinessDecay ? pet.happiness - happinessDecay : 0;
                pet.energy = pet.energy > energyDecay ? pet.energy - energyDecay : 0;
            }
        }
        
        // Calculate cleanliness decay
        uint256 currentCleanliness = pet.cleanliness;
        uint256 timeSinceClean = block.timestamp - pet.lastClean;
        uint256 totalStats = pet.hunger + pet.happiness;
        
        if (totalStats > 160) {
            // Decay 13.8% per hour
            uint256 hoursElapsed = timeSinceClean / 1 hours;
            uint256 decay = (138 * hoursElapsed) / 10;
            currentCleanliness = currentCleanliness > decay ? currentCleanliness - decay : 0;
        } else if (totalStats >= 140) {
            // Decay 13.8% per 10 minutes
            uint256 periodsElapsed = timeSinceClean / 10 minutes;
            uint256 decay = (138 * periodsElapsed) / 10;
            currentCleanliness = currentCleanliness > decay ? currentCleanliness - decay : 0;
        } else {
            // Decay 21.46% per 45 minutes
            uint256 periodsElapsed = timeSinceClean / 45 minutes;
            uint256 decay = (2146 * periodsElapsed) / 100;
            currentCleanliness = currentCleanliness > decay ? currentCleanliness - decay : 0;
        }
        
        return (
            pet.name,
            pet.hunger,
            pet.happiness,
            pet.energy,
            currentCleanliness,
            pet.lastUpdate,
            pet.birthTime,
            pet.alive
        );
    }
    
    /**
     * @dev Get current stats - simplified, no decay calculation
     */
    function getCurrentStats(address _owner) external view returns (
        uint256 hunger,
        uint256 happiness,
        uint256 energy,
        uint256 cleanliness
    ) {
        if (!hasPet[_owner]) {
            return (0, 0, 0, 0);
        }
        
        Pet storage pet = pets[_owner];
        return (pet.hunger, pet.happiness, pet.energy, pet.cleanliness);
    }
    
    /**
     * @dev Calculate combat power - simplified
     */
    function calculateCP(address) public pure returns (uint256) {
        return 50; // Fixed CP for testing
    }
    
    /**
     * @dev Revive dead pet (costs 0.01 ETH)
     */
    function revivePet() external payable {
        require(hasPet[msg.sender], "You don't have a pet");
        require(!pets[msg.sender].alive, "Pet is already alive");
        require(msg.value == 0.01 ether, "Revival costs 0.01 ETH");
        
        Pet storage pet = pets[msg.sender];
        pet.alive = true;
        pet.hunger = 50;
        pet.happiness = 50;
        pet.energy = 50;
        pet.cleanliness = 100;
        pet.lastUpdate = block.timestamp;
        pet.lastClean = block.timestamp;
        
        emit PetRevived(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Internal function to increase stat (used by CareSystem)
     */
    function _increaseStat(address _owner, uint8 _statType, uint256 _amount) internal {
        require(hasPet[_owner], "Owner doesn't have a pet");
        
        Pet storage pet = pets[_owner];
        require(pet.alive, "Pet is dead");
        
        if (_statType == 0) { // Hunger
            pet.hunger = pet.hunger + _amount > MAX_STAT ? MAX_STAT : pet.hunger + _amount;
        } else if (_statType == 1) { // Happiness
            pet.happiness = pet.happiness + _amount > MAX_STAT ? MAX_STAT : pet.happiness + _amount;
        } else if (_statType == 2) { // Energy
            pet.energy = pet.energy + _amount > MAX_STAT ? MAX_STAT : pet.energy + _amount;
        }
        
        // Update lastUpdate to current timestamp to reset decay calculation
        pet.lastUpdate = block.timestamp;
        
        emit StatsUpdated(_owner, pet.hunger, pet.happiness, pet.energy);
    }
    
    /**
     * @dev Internal function to decrease stat (used by BattleArena)
     */
    function _decreaseStat(address _owner, uint8 _statType, uint256 _amount) internal {
        require(hasPet[_owner], "Owner doesn't have a pet");
        
        Pet storage pet = pets[_owner];
        
        if (_statType == 2) { // Energy (used in battles)
            pet.energy = pet.energy > _amount ? pet.energy - _amount : 0;
        }
        
        emit StatsUpdated(_owner, pet.hunger, pet.happiness, pet.energy);
    }
}