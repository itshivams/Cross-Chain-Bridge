require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { SEPOLIA_RPC_URL, AMOY_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY, POLYGONSCAN_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    chainA: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    chainB: {
      url: AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,       
      polygonAmoy: POLYGONSCAN_API_KEY, 
    },
  },
};
