// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TamagotChain.sol";

/**
 * @title CareSystem
 * @dev Handle pet care actions (Feed, Play, Rest)
 */
contract CareSystem is TamagotChain {
    
    // ============ Constants ============
    
    uint256 public constant FEED_COST = 0.001 ether;
    uint256 public constant PLAY_COST = 0.001 ether;
    uint256 public constant REST_COST = 0 ether; // Free
    
    uint256 public constant FEED_AMOUNT = 20;
    uint256 public constant PLAY_AMOUNT = 20;
    uint256 public constant REST_AMOUNT = 20;
    
    uint256 public constant FEED_COOLDOWN = 1 hours;
    uint256 public constant PLAY_COOLDOWN = 1 hours;
    uint256 public constant REST_COOLDOWN = 2 hours;
    
    // ============ State Variables ============
    
    mapping(address => uint256) public lastFeedTime;
    mapping(address => uint256) public lastPlayTime;
    mapping(address => uint256) public lastRestTime;
    
    // ============ Events ============
    
    event PetFed(address indexed owner, uint256 newHunger, uint256 timestamp);
    event PetPlayed(address indexed owner, uint256 newHappiness, uint256 timestamp);
    event PetRested(address indexed owner, uint256 newEnergy, uint256 timestamp);
    
    // ============ Care Functions ============
    
    /**
     * @dev Feed pet (+20 hunger)
     */
    function feed() external payable onlyPetOwner {
        require(msg.value == FEED_COST, "Incorrect payment");
        require(
            block.timestamp >= lastFeedTime[msg.sender] + FEED_COOLDOWN,
            "Feed cooldown active"
        );
        
        updateStats();
        
        _increaseStat(msg.sender, 0, FEED_AMOUNT); // 0 = Hunger
        lastFeedTime[msg.sender] = block.timestamp;
        
        emit PetFed(msg.sender, pets[msg.sender].hunger, block.timestamp);
    }
    
    /**
     * @dev Play with pet (+20 happiness)
     */
    function play() external payable onlyPetOwner {
        require(msg.value == PLAY_COST, "Incorrect payment");
        require(
            block.timestamp >= lastPlayTime[msg.sender] + PLAY_COOLDOWN,
            "Play cooldown active"
        );
        
        updateStats();
        
        _increaseStat(msg.sender, 1, PLAY_AMOUNT); // 1 = Happiness
        lastPlayTime[msg.sender] = block.timestamp;
        
        emit PetPlayed(msg.sender, pets[msg.sender].happiness, block.timestamp);
    }
    
    /**
     * @dev Rest pet (+20 energy)
     */
    function rest() external onlyPetOwner {
        require(
            block.timestamp >= lastRestTime[msg.sender] + REST_COOLDOWN,
            "Rest cooldown active"
        );
        
        updateStats();
        
        _increaseStat(msg.sender, 2, REST_AMOUNT); // 2 = Energy
        lastRestTime[msg.sender] = block.timestamp;
        
        emit PetRested(msg.sender, pets[msg.sender].energy, block.timestamp);
    }
    
    /**
     * @dev Check if care action is available
     */
    function canFeed(address _owner) external view returns (bool) {
        if (!hasPet[_owner] || !pets[_owner].alive) return false;
        return block.timestamp >= lastFeedTime[_owner] + FEED_COOLDOWN;
    }
    
    function canPlay(address _owner) external view returns (bool) {
        if (!hasPet[_owner] || !pets[_owner].alive) return false;
        return block.timestamp >= lastPlayTime[_owner] + PLAY_COOLDOWN;
    }
    
    function canRest(address _owner) external view returns (bool) {
        if (!hasPet[_owner] || !pets[_owner].alive) return false;
        return block.timestamp >= lastRestTime[_owner] + REST_COOLDOWN;
    }
    
    /**
     * @dev Get remaining cooldown time
     */
    function getFeedCooldown(address _owner) external view returns (uint256) {
        if (block.timestamp >= lastFeedTime[_owner] + FEED_COOLDOWN) {
            return 0;
        }
        return (lastFeedTime[_owner] + FEED_COOLDOWN) - block.timestamp;
    }
    
    function getPlayCooldown(address _owner) external view returns (uint256) {
        if (block.timestamp >= lastPlayTime[_owner] + PLAY_COOLDOWN) {
            return 0;
        }
        return (lastPlayTime[_owner] + PLAY_COOLDOWN) - block.timestamp;
    }
    
    function getRestCooldown(address _owner) external view returns (uint256) {
        if (block.timestamp >= lastRestTime[_owner] + REST_COOLDOWN) {
            return 0;
        }
        return (lastRestTime[_owner] + REST_COOLDOWN) - block.timestamp;
    }
}