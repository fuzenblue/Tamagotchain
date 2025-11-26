const hre = require("hardhat");

async function main() {
  console.log("Starting Tamagotchain V2 Deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy Leaderboard (which inherits all other contracts)
  console.log("Deploying Leaderboard contract...");
  const Leaderboard = await hre.ethers.getContractFactory("Leaderboard");
  const leaderboard = await Leaderboard.deploy();
  await leaderboard.waitForDeployment();

  const leaderboardAddress = await leaderboard.getAddress();
  console.log("Leaderboard deployed to:", leaderboardAddress);

  // Contract addresses summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Leaderboard (Main Contract):", leaderboardAddress);
  console.log("  ↳ Inherits: BattleArena");
  console.log("  ↳ Inherits: CareSystem");
  console.log("  ↳ Inherits: TamagotChain");
  console.log("=".repeat(60));

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      Leaderboard: leaderboardAddress
    }
  };

  // Write to file
  const fs = require('fs');
  const path = require('path');
  
  const deploymentPath = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath);
  }

  const fileName = `deployment-${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentPath, fileName),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment info saved to:", fileName);

  // Display contract info
  console.log("\nCONTRACT CONFIGURATION:");
  console.log("─".repeat(60));
  console.log("Care Costs:");
  console.log("  Feed:  0.001 ETH");
  console.log("  Play:  0.001 ETH");
  console.log("  Rest:  FREE");
  console.log("\nBattle Settings:");
  console.log("  Entry Fee:     0.01 ETH");
  console.log("  Winner Reward: 0.018 ETH");
  console.log("  Platform Fee:  0.002 ETH (10%)");
  console.log("\nStat Decay (per hour):");
  console.log("  Hunger:    -10");
  console.log("  Happiness: -5");
  console.log("  Energy:    -10");
  console.log("─".repeat(60));

  // Generate frontend config
  console.log("\n🔧 FRONTEND CONFIGURATION:");
  console.log("─".repeat(60));
  console.log("Copy this to frontend/.env:\n");
  console.log(`VITE_CHAIN_ID=${deploymentInfo.chainId}`);
  console.log(`VITE_RPC_URL=http://127.0.0.1:8545`);
  console.log(`VITE_CONTRACT_ADDRESS=${leaderboardAddress}`);
  console.log("─".repeat(60));

  console.log("\nDeployment Complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });