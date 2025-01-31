const hre = require("hardhat");

async function main() {
  const TokenB = await hre.ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy();
  await tokenB.deployed();
  console.log("TokenB deployed to:", tokenB.address);

  const ChainBGateway = await hre.ethers.getContractFactory("ChainBGateway");
  const chainBGateway = await ChainBGateway.deploy(tokenB.address);
  await chainBGateway.deployed();
  console.log("ChainBGateway deployed to:", chainBGateway.address);

  await tokenB.setGateway(chainBGateway.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
