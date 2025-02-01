const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts using account: ${deployer.address}`);

  console.log("Deploying TokenA...");
  const TokenA = await hre.ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy();
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log(`TokenA deployed at: ${tokenAAddress}`);

  console.log("Deploying ChainAGateway...");
  const ChainAGateway = await hre.ethers.getContractFactory("ChainAGateway");
  const chainAGateway = await ChainAGateway.deploy(tokenAAddress, deployer.address); 
  await chainAGateway.waitForDeployment();
  const chainAGatewayAddress = await chainAGateway.getAddress();
  console.log(`ChainAGateway deployed at: ${chainAGatewayAddress}`);

  console.log("✅ Deployment completed successfully!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
