import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "@nomiclabs/hardhat-etherscan";
dotenv.config();

const ALCHEMY_URL = process.env.ALCHEMY_URL || "";
const ALCHEMY_ARB_URL = process.env.ALCHEMY_ARB_URL || "";
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 5000,
        details: { yul: false },
      },
    },
  },

  networks: {
    sepolia: {
      chainId: 11155111,
      url: ALCHEMY_URL,
      accounts: [WALLET_PRIVATE_KEY],
    },

    arbitrum: {
      chainId: 421613,
      url: ALCHEMY_ARB_URL,
      accounts: [WALLET_PRIVATE_KEY],
    },
  },

  etherscan: {
    apiKey: {
      goerli: "9YAK5QXHPTZW65ZS54F1XBRCHMKIQZ98H",
      sepolia: "QKZAI2BMSQNB4BKZ3G69YSZTM1WVY97EYW",
      arbitrumGoerli: "MQRH5VMUMAUWYQV5KCJHHW4FRF6F5236SH",
    },
  },
};

export default config;
