const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying ProofOfTransfer contract...");
    const ProofOfTransfer = await ethers.getContractFactory("ProofOfTransfer");
    const proofOfTransfer = await ProofOfTransfer.deploy();
    await proofOfTransfer.deployed();
    console.log("ProofOfTransfer deployed at:", proofOfTransfer.address);

    console.log("Deploying ChainGateway contract...");
    const ChainGateway = await ethers.getContractFactory("ChainGateway");
    const chainGateway = await ChainGateway.deploy(proofOfTransfer.address);
    await chainGateway.deployed();
    console.log("ChainGateway deployed at:", chainGateway.address);

    console.log("Deployment Successful! \n");
    console.log(`ProofOfTransfer Address: ${proofOfTransfer.address}`);
    console.log(`ChainGateway Address: ${chainGateway.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
