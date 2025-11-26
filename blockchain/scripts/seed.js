const hre = require("hardhat");

async function main() {
    console.log("🌱 Seeding test data...\n");

    // Get contract address from latest deployment
    const fs = require('fs');
    const path = require('path');

    const deploymentsPath = path.join(__dirname, '../deployments');

    if (!fs.existsSync(deploymentsPath)) {
        console.error("❌ No deployments folder found.");
        process.exit(1);
    }

    const files = fs.readdirSync(deploymentsPath);
    const latestDeployment = files
        .filter(f => f.startsWith('deployment-localhost'))
        .sort()
        .reverse();

    if (latestDeployment.length === 0) {
        console.error("❌ No deployment found. Run 'npm run deploy:local' first.");
        process.exit(1);
    }

    const deploymentData = JSON.parse(
        fs.readFileSync(path.join(deploymentsPath, latestDeployment[0]))
    );

    const contractAddress = deploymentData.contracts.Leaderboard;
    console.log("📍 Using contract at:", contractAddress, "\n");

    // Get signers (test accounts)
    const [owner, alice, bob, charlie, diana] = await hre.ethers.getSigners();

    // Get contract instance
    const Leaderboard = await hre.ethers.getContractFactory("Leaderboard");
    const contract = Leaderboard.attach(contractAddress);

    console.log("👥 Creating pets for test accounts...\n");

    // Create pets
    const pets = [
        { signer: alice, name: "Pikachu" },
        { signer: bob, name: "Charizard" },
        { signer: charlie, name: "Bulbasaur" },
        { signer: diana, name: "Squirtle" }
    ];

    for (const pet of pets) {
        try {
            const tx = await contract.connect(pet.signer).createPet(pet.name);
            await tx.wait();
            console.log(`✅ ${pet.name} created for ${pet.signer.address.slice(0, 6)}...`);
        } catch (error) {
            if (error.message.includes("already have a pet")) {
                console.log(`⚠️  ${pet.name} already exists`);
            } else {
                console.log(`⚠️  ${pet.name} error:`, error.message.split('\n')[0]);
            }
        }
    }

    console.log("\n🍖 Feeding and caring for pets...\n");

    // Feed, Play, Rest for each pet
    for (const pet of pets) {
        try {
            // Feed
            let tx = await contract.connect(pet.signer).feed({
                value: hre.ethers.parseEther("0.001")
            });
            await tx.wait();
            console.log(`🍖 ${pet.name} fed`);

            // Play
            tx = await contract.connect(pet.signer).play({
                value: hre.ethers.parseEther("0.001")
            });
            await tx.wait();
            console.log(`🎮 ${pet.name} played`);

            // Rest
            tx = await contract.connect(pet.signer).rest();
            await tx.wait();
            console.log(`😴 ${pet.name} rested\n`);
        } catch (error) {
            console.log(`⚠️  Care failed for ${pet.name}:`, error.message.split('\n'));
        }
    }

    console.log("⚔️  Simulating battles...\n");

    // Simulate battles - simplified approach
    const battlers = [alice, bob];
    let battleCount = 0;

    try {
        console.log(`Battle Attempt: ${alice.address.slice(0, 6)}... vs ${bob.address.slice(0, 6)}...`);

        // Both players enter battle simultaneously
        const tx1 = await contract.connect(alice).enterBattle({
            value: hre.ethers.parseEther("0.01")
        });
        await tx1.wait();
        console.log("  → Alice entered");

        const tx2 = await contract.connect(bob).enterBattle({
            value: hre.ethers.parseEther("0.01")
        });
        const receipt = await tx2.wait();
        console.log("  → Bob entered");

        // Check for battle event
        let battleOccurred = false;
        for (const log of receipt.logs) {
            try {
                const parsed = contract.interface.parseLog(log);
                if (parsed && parsed.name === 'BattleEnded') {
                    battleCount++;
                    const winner = parsed.args.winner;
                    console.log(`  ✅ Battle occurred! Winner = ${winner.slice(0, 6)}...`);
                    battleOccurred = true;
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }

        if (!battleOccurred) {
            console.log("  ⚠️  No battle occurred - checking waiting pool");
            
            // Debug: Check waiting pool
            try {
                const waitingCount = await contract.getWaitingPlayersCount();
                console.log(`  📊 Waiting players: ${waitingCount}`);
            } catch (e) {
                console.log(`  📊 Could not check waiting pool`);
            }
        }

    } catch (error) {
        console.log(`  ❌ Battle Error:`, error.reason || error.message.split('\n')[0]);
    }

    console.log(`\n📊 Total Battles: ${battleCount}\n`);
    
    // Try to get total battles from contract
    try {
        const totalFromContract = await contract.getTotalBattles();
        console.log(`📊 Contract Reports: ${totalFromContract} battles\n`);
    } catch (e) {
        console.log(`📊 Could not fetch battle count from contract\n`);
    }

    console.log("📊 Final Stats:\n");

    // Display stats for each player
    for (const pet of pets) {
        console.log(`🐾 ${pet.name} (${pet.signer.address.slice(0, 6)}...)`);
        
        try {
            const petData = await contract.getPet(pet.signer.address);
            console.log(`   Stats: H:${petData[1]} | Hap:${petData[2]} | E:${petData[3]}`);
        } catch (e) {
            console.log(`   Stats: Unable to fetch`);
        }
        
        try {
            const cp = await contract.calculateCP(pet.signer.address);
            console.log(`   CP: ${cp}`);
        } catch (e) {
            console.log(`   CP: Unable to calculate`);
        }
        
        console.log("");
    }

    console.log("✨ Seeding complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    });