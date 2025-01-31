const hre = require("hardhat");

async function main() {
  const TokenA = await hre.ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy();
  await tokenA.deployed();
  console.log("TokenA deployed to:", tokenA.address);

  const ChainAGateway = await hre.ethers.getContractFactory("ChainAGateway");
  const chainAGateway = await ChainAGateway.deploy(tokenA.address);
  await chainAGateway.deployed();
  console.log("ChainAGateway deployed to:", chainAGateway.address);


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
