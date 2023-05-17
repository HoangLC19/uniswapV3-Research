import { ethers } from "hardhat";
import { Contract, utils } from "ethers";
import { config } from "dotenv";
import { IERC20 } from "../../typechain-types";
import { fromReadableAmount, toReadableAmount } from "../lib/conversion";
import {
  getPositionId,
  PositionInfo,
  getPositionInfo,
  swapAndAddLiquidity,
} from "../lib/liquidity";
import { transferUSDC, transferUSDT } from "./transfer";

import { generateRoute, executeRoute } from "../lib/routing";
import { getPoolData } from "../lib/pool";
config();

const NFT_MANAGER = process.env.GOERLI_NFT_MANAGER || "";
const ROUTER = process.env.GOERLI_SWAP_ROUTER || "";
const USDC = process.env.MAINNET_USDC || "";
const USDT = process.env.MAINNET_USDT || "";

const main = async () => {
  const amount = utils.parseEther("10");

  const accounts = await ethers.getSigners();
  const owner = accounts[0];

  await transferUSDC();
  await transferUSDT();

  const usdc = await ethers.getContractAt("IERC20", USDC);
  const usdt = await ethers.getContractAt("IERC20", USDT);

  //generate route for swap USDT to USDC

  //approve tokens for swap router

  //generate route for swap USDT to USDC
  //   const route = await generateRoute();
  //   console.log(`Swap 10 USDT for ${route?.quote.toExact()} USDC`);

  //   console.log(
  //     `${route?.route
  //       .map((r) => r.tokenPath.map((t) => t.symbol).join(" -> "))
  //       .join(", ")}`
  //   );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
