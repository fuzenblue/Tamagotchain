// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CareSystem.sol";

/**
 * @title BattleArena
 * @dev Battle system with matchmaking and rewards
 */
contract BattleArena is CareSystem {
    
    // ============ Constants ============
    
    uint256 public constant ENTRY_FEE = 0.01 ether;
    uint256 public constant WINNER_REWARD = 0.018 ether; // 90%
    uint256 public constant PLATFORM_FEE = 0.002 ether;  // 10%
    
    uint256 public constant MIN_ENERGY_TO_BATTLE = 20;
    uint256 public constant ENERGY_COST_PER_BATTLE = 10;
    uint256 public constant BATTLE_COOLDOWN = 10 seconds;
    
    // ============ Structs ============
    
    struct Battle {
        address player1;
        address player2;
        uint256 cp1;
        uint256 cp2;
        address winner;
        uint256 timestamp;
    }
    
    struct PlayerStats {
        uint256 totalBattles;
        uint256 totalWins;
        uint256 totalLosses;
        uint256 currentStreak;
        uint256 bestStreak;
        uint256 totalEarned;
    }
    
    // ============ State Variables ============
    
    Battle[] public battles;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => uint256) public lastBattleTime;
    
    address[] public waitingPlayers;
    uint256 public platformBalance;
    
    // ============ Events ============
    
    event BattleEntered(address indexed player, uint256 cp, uint256 timestamp);
    event BattleStarted(address indexed player1, address indexed player2, uint256 battleId);
    event BattleEnded(
        uint256 indexed battleId,
        address indexed winner,
        address indexed loser,
        uint256 reward
    );
    
    // ============ Battle Functions ============
    
    /**
     * @dev Enter battle arena (pay entry fee + matchmaking)
     */
    function enterBattle() external payable {
        require(hasPet[msg.sender], "No pet found");
        require(pets[msg.sender].alive, "Pet is dead");
        require(msg.value == ENTRY_FEE, "Wrong entry fee");
        require(
            block.timestamp >= lastBattleTime[msg.sender] + BATTLE_COOLDOWN,
            "Pet is resting"
        );
        require(pets[msg.sender].energy >= MIN_ENERGY_TO_BATTLE, "Pet too tired");
        
        uint256 yourCP = calculateCP(msg.sender);
        
        // Try to find opponent
        address opponent = _findOpponent(msg.sender, yourCP);
        
        if (opponent != address(0)) {
            // Battle found!
            _executeBattle(msg.sender, opponent);
        } else {
            // Add to waiting pool
            waitingPlayers.push(msg.sender);
            emit BattleEntered(msg.sender, yourCP, block.timestamp);
        }
        
        lastBattleTime[msg.sender] = block.timestamp;
    }
    
    /**
     * @dev Find suitable opponent from waiting pool
     */
    function _findOpponent(address _player, uint256) internal returns (address) {
        for (uint256 i = 0; i < waitingPlayers.length; i++) {
            address candidate = waitingPlayers[i];
            
            if (candidate == _player) continue;
            
            // Always match for testing - remove CP restriction
            _removeFromWaitingPool(i);
            return candidate;
        }
        
        return address(0); // No match found
    }
    
    /**
     * @dev Execute battle between two players
     */
    function _executeBattle(address _player1, address _player2) internal {
        uint256 cp1 = calculateCP(_player1);
        uint256 cp2 = calculateCP(_player2);
        
        // Determine winner using pseudo-random + CP weighting
        address winner = _determineWinner(_player1, _player2, cp1, cp2);
        address loser = winner == _player1 ? _player2 : _player1;
        
        // Create battle record
        battles.push(Battle({
            player1: _player1,
            player2: _player2,
            cp1: cp1,
            cp2: cp2,
            winner: winner,
            timestamp: block.timestamp
        }));
        
        uint256 battleId = battles.length - 1;
        
        // Deduct energy from both
        _decreaseStat(_player1, 2, ENERGY_COST_PER_BATTLE);
        _decreaseStat(_player2, 2, ENERGY_COST_PER_BATTLE);
        
        // Update stats
        _updatePlayerStats(winner, true);
        _updatePlayerStats(loser, false);
        
        // Pay winner
        payable(winner).transfer(WINNER_REWARD);
        platformBalance += PLATFORM_FEE;
        
        emit BattleStarted(_player1, _player2, battleId);
        emit BattleEnded(battleId, winner, loser, WINNER_REWARD);
    }
    
    /**
     * @dev Determine winner based on CP + randomness
     */
    function _determineWinner(
        address _player1,
        address _player2,
        uint256 _cp1,
        uint256 _cp2
    ) internal view returns (address) {
        int256 cpDiff = int256(_cp1) - int256(_cp2);
        
        // Calculate win probability for player1
        uint256 baseChance = 50; // 50% base
        
        if (cpDiff >= 30) {
            baseChance = 90; // Crushing advantage
        } else if (cpDiff >= 20) {
            baseChance = 75; // Strong advantage
        } else if (cpDiff >= 10) {
            baseChance = 60; // Moderate advantage
        } else if (cpDiff >= 5) {
            baseChance = 55; // Slight advantage
        } else if (cpDiff <= -30) {
            baseChance = 10;
        } else if (cpDiff <= -20) {
            baseChance = 25;
        } else if (cpDiff <= -10) {
            baseChance = 40;
        } else if (cpDiff <= -5) {
            baseChance = 45;
        }
        
        // Generate pseudo-random number (0-99)
        uint256 random = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, _player1, _player2))
        ) % 100;
        
        return random < baseChance ? _player1 : _player2;
    }
    
    /**
     * @dev Update player battle statistics
     */
    function _updatePlayerStats(address _player, bool _won) internal {
        // Initialize if first battle
        if (playerStats[_player].totalBattles == 0 && playerStats[_player].totalWins == 0) {
            playerStats[_player] = PlayerStats(0, 0, 0, 0, 0, 0);
        }
        
        PlayerStats storage stats = playerStats[_player];
        
        stats.totalBattles++;
        
        if (_won) {
            stats.totalWins++;
            stats.currentStreak++;
            stats.totalEarned += WINNER_REWARD;
            
            if (stats.currentStreak > stats.bestStreak) {
                stats.bestStreak = stats.currentStreak;
            }
        } else {
            stats.totalLosses++;
            stats.currentStreak = 0;
        }
    }
    
    /**
     * @dev Remove player from waiting pool
     */
    function _removeFromWaitingPool(uint256 _index) internal {
        waitingPlayers[_index] = waitingPlayers[waitingPlayers.length - 1];
        waitingPlayers.pop();
    }
    
    /**
     * @dev Cancel waiting (get refund)
     */
    function cancelWaiting() external {
        for (uint256 i = 0; i < waitingPlayers.length; i++) {
            if (waitingPlayers[i] == msg.sender) {
                _removeFromWaitingPool(i);
                payable(msg.sender).transfer(ENTRY_FEE);
                return;
            }
        }
        revert("Not in waiting pool");
    }
    
    /**
     * @dev Get player stats - reads from mapping
     */
    function getPlayerStats(address _player) external view returns (
        uint256 totalBattles,
        uint256 totalWins,
        uint256 totalLosses,
        uint256 winRate,
        uint256 currentStreak,
        uint256 bestStreak,
        uint256 totalEarned
    ) {
        PlayerStats storage stats = playerStats[_player];
        
        uint256 wr = stats.totalBattles > 0 
            ? (stats.totalWins * 100) / stats.totalBattles 
            : 0;
        
        return (
            stats.totalBattles,
            stats.totalWins,
            stats.totalLosses,
            wr,
            stats.currentStreak,
            stats.bestStreak,
            stats.totalEarned
        );
    }
    
    /**
     * @dev Get battle history
     */
    function getBattle(uint256 _battleId) external view returns (
        address player1,
        address player2,
        uint256 cp1,
        uint256 cp2,
        address winner,
        uint256 timestamp
    ) {
        require(_battleId < battles.length, "Invalid battle ID");
        
        Battle memory b = battles[_battleId];
        return (b.player1, b.player2, b.cp1, b.cp2, b.winner, b.timestamp);
    }
    
    /**
     * @dev Get total battles count
     */
    function getTotalBattles() external view returns (uint256) {
        return battles.length;
    }
    
    /**
     * @dev Get waiting players count (for debugging)
     */
    function getWaitingPlayersCount() external pure returns (uint256) {
        return 0;
    }
    
    /**
     * @dev Simple test function
     */
    function testFunction() external pure returns (uint256) {
        return 42;
    }
    
    /**
     * @dev Absolute value helper
     */
    function _abs(int256 x) internal pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }
}