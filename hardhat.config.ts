import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "@nomiclabs/hardhat-etherscan";
dotenv.config();

const ALCHEMY_URL = process.env.ALCHEMY_URL || "";
const ALCHEMY_ARB_URL = process.env.ALCHEMY_ARB_URL || "";
const ALCHEMY_GOERLI_URL = process.env.ALCHEMY_GOERLI_URL || "";
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
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/lr5fW3101frl8znkj2UxtAi7YS6OD-V9",
      },
      chainId: 1,
    },
    goerli: {
      chainId: 5,
      url: ALCHEMY_GOERLI_URL,
      accounts: [WALLET_PRIVATE_KEY],
    },

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
      
      goerli: "FUZ4I4HG81DBDP6VFI22I9DVI5YJN5MFY3",
      sepolia: "QKZAI2BMSQNB4BKZ3G69YSZTM1WVY97EYW",
      arbitrumGoerli: "MQRH5VMUMAUWYQV5KCJHHW4FRF6F5236SH",
    },
  },
};

export default config;
