import { ethers } from "hardhat";
import { Contract, utils } from "ethers";
import { toReadableAmount } from "./lib/conversion";
import Tether from "../artifacts/contracts/Tether.sol/Tether.json";
import UsdCoin from "../artifacts/contracts/UsdCoin.sol/UsdCoin.json";
import { config } from "dotenv";
import { getPoolData } from "./lib/pool";
import {
  getPositionId,
  PositionInfo,
  getPositionInfo,
  addLiquidity,
  removeLiquidity,
} from "./lib/liquidity";
config();

const TETHER = process.env.Tether || "";
const WALLET = process.env.WALLET_ADDRESS || "";

const tetherContract = new Contract(TETHER, Tether.abi, ethers.provider);

const main = async () => {
  console.log(
    "owner usdt balance before removing liquidity",
    toReadableAmount(await tetherContract.balanceOf(WALLET), 18)
  );
  console.log(
    "owner usdc balance before removing liquidity",
    toReadableAmount(await tetherContract.balanceOf(WALLET), 18)
  );

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

  //remove liquidity
  const removeLiquidityReceipt = await removeLiquidity(tokenIds[3]);
  console.log("removeLiquidityReceipt", removeLiquidityReceipt);

  // console tether and usdc balances after removing liquidity
  console.log(
    "owner usdt balance after removing liquidity",
    toReadableAmount(await tetherContract.balanceOf(WALLET), 18)
  );
  console.log(
    "owner usdc balance after removing liquidity",
    toReadableAmount(await tetherContract.balanceOf(WALLET), 18)
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
