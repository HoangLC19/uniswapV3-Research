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
config();

import { getPoolData } from "./lib/pool";

const TETHER = process.env.GOERLI_USDT || "";
const USDC = process.env.GOERLI_USDC || "";
const WALLET = process.env.WALLET_ADDRESS || "";
const NFT_MANAGER = process.env.GOERLI_NFT_MANAGER || "";
const ROUTER_V3 = process.env.GOERLI_SWAP_ROUTER_02 || "";
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

const tetherContract = new Contract(TETHER, Tether.abi, ethers.provider);
const usdcContract = new Contract(USDC, UsdCoin.abi, ethers.provider);
const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

const main = async () => {
  const amount = utils.parseEther("100");

  // mint tokens
  await tetherContract.connect(wallet).mint(wallet.address, amount);
  await usdcContract.connect(wallet).mint(wallet.address, amount);

  //approve tokens for nft manager
  await tetherContract.connect(wallet).approve(ROUTER_V3, amount);
  await usdcContract.connect(wallet).approve(ROUTER_V3, amount);

  const tokenIds: number[] = await getPositionId();
  const poolData = await getPoolData();
  // console.log("poolData", poolData);

  const positionIds = await getPositionId();

  // console.log("tokenId", tokenIds);

  // console.log("positionInfo", positionIds);

  // log balances before adding liquidity
  console.log(
    "owner usdt balance before adding liquidity",
    toReadableAmount(await tetherContract.balanceOf(WALLET), 18)
  );
  console.log(
    "owner usdc balance before adding liquidity",
    toReadableAmount(await usdcContract.balanceOf(WALLET), 18)
  );

  // swap and add liquidity
  const swapAndAddLiquidityResult = await swapAndAddLiquidity(tokenIds[0]);

  console.log("swapAndAddLiquidityResult", swapAndAddLiquidityResult);

  // console tether and usdc balances after adding liquidity
  console.log(
    "owner usdt balance after adding liquidity",
    toReadableAmount(await tetherContract.balanceOf(WALLET), 18)
  );
  console.log(
    "owner usdc balance after adding liquidity",
    toReadableAmount(await usdcContract.balanceOf(WALLET), 18)
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
