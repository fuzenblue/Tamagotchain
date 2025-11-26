const hre = require("hardhat");

async function main() {
    console.log("🔍 Debug Contract Functions...\n");

    // Get contract
    const fs = require('fs');
    const path = require('path');
    const deploymentsPath = path.join(__dirname, '../deployments');
    const files = fs.readdirSync(deploymentsPath);
    const latestDeployment = files
        .filter(f => f.startsWith('deployment-localhost'))
        .sort()
        .reverse()[0];
    
    const deploymentData = JSON.parse(
        fs.readFileSync(path.join(deploymentsPath, latestDeployment))
    );
    
    const contractAddress = deploymentData.contracts.Leaderboard;
    const [owner, alice] = await hre.ethers.getSigners();
    
    const Leaderboard = await hre.ethers.getContractFactory("Leaderboard");
    const contract = Leaderboard.attach(contractAddress);
    
    console.log("📍 Contract:", contractAddress);
    console.log("👤 Alice:", alice.address, "\n");
    
    // Test 1: Check if Alice has pet
    try {
        const hasPet = await contract.hasPet(alice.address);
        console.log("✅ Alice has pet:", hasPet);
    } catch (e) {
        console.log("❌ hasPet failed:", e.message.split('\n')[0]);
    }
    
    // Test 2: Get pet info
    try {
        const pet = await contract.getPet(alice.address);
        console.log("✅ Pet info:", pet[0], "H:", pet[1].toString(), "Hap:", pet[2].toString(), "E:", pet[3].toString());
    } catch (e) {
        console.log("❌ getPet failed:", e.message.split('\n')[0]);
    }
    
    // Test 3: Calculate CP
    try {
        const cp = await contract.calculateCP(alice.address);
        console.log("✅ CP:", cp.toString());
    } catch (e) {
        console.log("❌ calculateCP failed:", e.message.split('\n')[0]);
    }
    
    // Test 4: Get player stats
    try {
        const stats = await contract.getPlayerStats(alice.address);
        console.log("✅ Stats:", stats[0].toString(), "battles");
    } catch (e) {
        console.log("❌ getPlayerStats failed:", e.message.split('\n')[0]);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Debug failed:", error);
        process.exit(1);
    });