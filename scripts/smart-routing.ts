import { ethers } from "hardhat";
import { Contract, utils } from "ethers";
import { config } from "dotenv";
import Tether from "../artifacts/contracts/Tether.sol/Tether.json";
import UsdCoin from "../artifacts/contracts/UsdCoin.sol/UsdCoin.json";
import { fromReadableAmount, toReadableAmount } from "./lib/conversion";
import {
  getPositionId,
  PositionInfo,
  getPositionInfo,
  swapAndAddLiquidity,
} from "./lib/liquidity";

import { generateRoute, executeRoute } from "./lib/routing";
import { getPoolData } from "./lib/pool";
config();

const TETHER = process.env.GOERLI_USDT || "";
const USDC = process.env.GOERLI_USDC || "";
const WALLET = process.env.WALLET_ADDRESS || "";
const NFT_MANAGER = process.env.GOERLI_NFT_MANAGER || "";
const ROUTER = process.env.GOERLI_SWAP_ROUTER || "";
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

const tetherContract = new Contract(TETHER, Tether.abi, ethers.provider);
const usdcContract = new Contract(USDC, UsdCoin.abi, ethers.provider);
const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

const main = async () => {
  const amount = utils.parseEther("10");

  //approve tokens for swap router
  await tetherContract.connect(wallet).approve(ROUTER, amount);

  // generate route for swap USDT to USDC
  const route = await generateRoute();
  console.log("route", route);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
