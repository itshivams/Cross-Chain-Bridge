const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts using account: ${deployer.address}`);

  let feeData = await hre.ethers.provider.getFeeData();
  let gasPrice = feeData.gasPrice;
  console.log("Current Gas Price:", hre.ethers.formatUnits(gasPrice, "gwei"), "Gwei");

  gasPrice = gasPrice * BigInt(5) / BigInt(10);
  console.log("Using Lower Gas Price:", hre.ethers.formatUnits(gasPrice, "gwei"), "Gwei");

  const gasLimit = BigInt(2_000_000); 

  console.log("Deploying TokenB...");
  const TokenB = await hre.ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy(deployer.address, { gasPrice, gasLimit });
  await tokenB.waitForDeployment();
  console.log(`TokenB deployed at: ${await tokenB.getAddress()}`);

  console.log("Deploying ChainBGateway...");
  const ChainBGateway = await hre.ethers.getContractFactory("ChainBGateway");
  const chainBGateway = await ChainBGateway.deploy(await tokenB.getAddress(), deployer.address, { gasPrice, gasLimit });
  await chainBGateway.waitForDeployment();
  console.log(`ChainBGateway deployed at: ${await chainBGateway.getAddress()}`);

  console.log("✅ Deployment on Amoy completed successfully!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
