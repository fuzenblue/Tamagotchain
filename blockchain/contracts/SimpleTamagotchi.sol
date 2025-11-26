// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleTamagotchi {
    struct Pet {
        string name;
        uint256 hunger;
        uint256 happiness;
        uint256 energy;
        bool alive;
    }
    
    mapping(address => Pet) public pets;
    mapping(address => bool) public hasPet;
    
    event PetCreated(address indexed owner, string name);
    event PetFed(address indexed owner);
    
    function createPet(string memory _name) external {
        require(!hasPet[msg.sender], "Already have a pet");
        
        pets[msg.sender] = Pet({
            name: _name,
            hunger: 70,
            happiness: 70,
            energy: 70,
            alive: true
        });
        
        hasPet[msg.sender] = true;
        emit PetCreated(msg.sender, _name);
    }
    
    function feed() external payable {
        require(msg.value == 0.001 ether, "Wrong payment");
        require(hasPet[msg.sender], "No pet");
        
        pets[msg.sender].hunger = 100;
        emit PetFed(msg.sender);
    }
    
    function play() external payable {
        require(msg.value == 0.001 ether, "Wrong payment");
        require(hasPet[msg.sender], "No pet");
        
        pets[msg.sender].happiness = 100;
    }
    
    function rest() external {
        require(hasPet[msg.sender], "No pet");
        pets[msg.sender].energy = 100;
    }
    
    function getPet(address _owner) external view returns (
        string memory name,
        uint256 hunger,
        uint256 happiness,
        uint256 energy,
        bool alive
    ) {
        if (!hasPet[_owner]) {
            return ("", 0, 0, 0, false);
        }
        
        Pet memory pet = pets[_owner];
        return (pet.name, pet.hunger, pet.happiness, pet.energy, pet.alive);
    }
    
    function calculateCP(address _owner) external view returns (uint256) {
        if (!hasPet[_owner]) return 0;
        
        Pet memory pet = pets[_owner];
        return (pet.hunger + pet.happiness + pet.energy) / 3;
    }
}