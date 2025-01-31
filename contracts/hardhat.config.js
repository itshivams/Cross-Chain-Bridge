require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { CHAIN_A_RPC_URL, CHAIN_B_RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.18",
  networks: {
    chainA: {
      url: CHAIN_A_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    chainB: {
      url: CHAIN_B_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
