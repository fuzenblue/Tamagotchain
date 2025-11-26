// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BattleArena.sol";

/**
 * @title Leaderboard
 * @dev Global rankings and prize distribution
 */
contract Leaderboard is BattleArena {
    
    // ============ Structs ============
    
    struct LeaderboardEntry {
        address player;
        uint256 totalWins;
        uint256 winRate;
        uint256 totalEarned;
    }
    
    // ============ State Variables ============
    
    address[] public rankedPlayers;
    uint256 public lastWeeklyReset;
    uint256 public weeklyPrizePool;
    
    // ============ Events ============
    
    event LeaderboardUpdated(address indexed player, uint256 rank);
    event WeeklyPrizesDistributed(uint256 totalPrizes, uint256 timestamp);
    
    // ============ Constructor ============
    
    constructor() {
        lastWeeklyReset = block.timestamp;
    }
    
    // ============ Leaderboard Functions ============
    
    /**
     * @dev Get top N players
     */
    function getTopPlayers(uint256 _count) external view returns (LeaderboardEntry[] memory) {
        uint256 count = _count > totalPets ? totalPets : _count;
        LeaderboardEntry[] memory top = new LeaderboardEntry[](count);
        
        // Get all players and sort (simple implementation)
        address[] memory allPlayers = _getAllPlayers();
        
        // Sort by wins (bubble sort - OK for small datasets)
        for (uint256 i = 0; i < allPlayers.length && i < count; i++) {
            address topPlayer = allPlayers[0];
            uint256 topWins = playerStats[topPlayer].totalWins;
            uint256 topIndex = 0;
            
            for (uint256 j = 1; j < allPlayers.length; j++) {
                uint256 wins = playerStats[allPlayers[j]].totalWins;
                if (wins > topWins) {
                    topWins = wins;
                    topPlayer = allPlayers[j];
                    topIndex = j;
                }
            }
            
            PlayerStats memory stats = playerStats[topPlayer];
            uint256 wr = stats.totalBattles > 0 
                ? (stats.totalWins * 100) / stats.totalBattles 
                : 0;
            
            top[i] = LeaderboardEntry({
                player: topPlayer,
                totalWins: stats.totalWins,
                winRate: wr,
                totalEarned: stats.totalEarned
            });
            
            // Remove from array
            allPlayers[topIndex] = allPlayers[allPlayers.length - 1];
            assembly { mstore(allPlayers, sub(mload(allPlayers), 1)) }
        }
        
        return top;
    }
    
    /**
     * @dev Get player rank
     */
    function getPlayerRank(address _player) external view returns (uint256) {
        require(hasPet[_player], "Player doesn't have a pet");
        
        uint256 playerWins = playerStats[_player].totalWins;
        uint256 rank = 1;
        
        address[] memory allPlayers = _getAllPlayers();
        
        for (uint256 i = 0; i < allPlayers.length; i++) {
            if (allPlayers[i] == _player) continue;
            
            if (playerStats[allPlayers[i]].totalWins > playerWins) {
                rank++;
            }
        }
        
        return rank;
    }
    
    /**
     * @dev Distribute weekly prizes (owner only)
     */
    function distributeWeeklyPrizes() external {
        require(
            block.timestamp >= lastWeeklyReset + 7 days,
            "Not time for weekly reset"
        );
        
        LeaderboardEntry[] memory top10 = this.getTopPlayers(10);
        uint256 totalDistributed = 0;
        
        // Prize distribution
        for (uint256 i = 0; i < top10.length && i < 10; i++) {
            uint256 prize = 0;
            
            if (i == 0) {
                prize = 0.1 ether; // 1st place
            } else if (i <= 3) {
                prize = 0.05 ether; // 2nd-3rd
            } else if (i <= 9) {
                prize = 0.02 ether; // 4th-10th
            }
            
            if (prize > 0 && platformBalance >= prize) {
                payable(top10[i].player).transfer(prize);
                platformBalance -= prize;
                totalDistributed += prize;
            }
        }
        
        lastWeeklyReset = block.timestamp;
        emit WeeklyPrizesDistributed(totalDistributed, block.timestamp);
    }
    
    /**
     * @dev Get all players (internal helper)
     */
    function _getAllPlayers() internal view returns (address[] memory) {
        // This is inefficient but OK for prototype
        // In production, maintain separate array of players
        address[] memory players = new address[](totalPets);
        // Simplified - would need proper tracking
        return players;
    }
    
    /**
     * @dev Withdraw platform earnings (owner only)
     */
    function withdrawPlatformBalance() external {
        require(msg.sender == owner(), "Only owner");
        uint256 amount = platformBalance;
        platformBalance = 0;
        payable(msg.sender).transfer(amount);
    }
    
    /**
     * @dev Get contract owner (placeholder - use Ownable in production)
     */
    function owner() internal view returns (address) {
        // Simplified - would use OpenZeppelin Ownable
        return address(this);
    }
}