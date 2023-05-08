import { ethers } from "hardhat";
import { Contract, utils } from "ethers";
import { Currency, Token, CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { Route, SwapQuoter } from "@uniswap/v3-sdk";
import { config } from "dotenv";
import Tether from "../artifacts/contracts/Tether.sol/Tether.json";
import UsdCoin from "../artifacts/contracts/UsdCoin.sol/UsdCoin.json";
import { fromReadableAmount, toReadableAmount } from "./lib/conversion";
import {
  getPositionId,
  PositionInfo,
  getPositionInfo,
  addLiquidity,
  swapAndAddLiquidity,
} from "./lib/liquidity";
config();

import { getPoolData } from "./lib/pool";

const TETHER = process.env.Tether || "";
const USDC = process.env.UsdCoin || "";
const QUOTER = process.env.QuoterV2 || "";
const WALLET = process.env.WALLET_ADDRESS || "";
const NFT_MANAGER = process.env.NonfungiblePositionManager || "";
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

const tetherContract = new Contract(TETHER, Tether.abi, ethers.provider);
const usdcContract = new Contract(USDC, UsdCoin.abi, ethers.provider);
const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

const main = async () => {
  const amount = utils.parseEther("100");

  //approve tokens for nft manager
  await tetherContract.connect(wallet).approve(NFT_MANAGER, amount);
  await usdcContract.connect(wallet).approve(NFT_MANAGER, amount);

  const tokenIds: number[] = await getPositionId();
  const poolData = await getPoolData();
  console.log("poolData", poolData);

  console.log("tokenIds", tokenIds);

  let positionInfo: PositionInfo[] = [];
  for (let i = 0; i < tokenIds.length; i++) {
    const info = await getPositionInfo(tokenIds[i]);
    positionInfo.push(info);
  }

  console.log("positionInfo", positionInfo);

  // log balances before adding liquidity
  console.log(
    "owner usdt balance before adding liquidity",
    toReadableAmount(await tetherContract.balanceOf(WALLET), 18)
  );
  console.log(
    "owner usdc balance before adding liquidity",
    toReadableAmount(await tetherContract.balanceOf(WALLET), 18)
  );

  // swap and add liquidity
  const swapAndAddLiquidityResult = await swapAndAddLiquidity(tokenIds[2]);

  console.log("swapAndAddLiquidityResult", swapAndAddLiquidityResult);

  // console tether and usdc balances after adding liquidity
  console.log(
    "owner usdt balance after adding liquidity",
    toReadableAmount(await tetherContract.balanceOf(WALLET), 18)
  );
  console.log(
    "owner usdc balance after adding liquidity",
    toReadableAmount(await tetherContract.balanceOf(WALLET), 18)
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
