import { ethers } from "hardhat";
import { Contract } from "ethers";
import IUnisapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

import { config } from "dotenv";
config();

const POOL = process.env.PoolAddress || "";

export const getPoolData = async () => {
  // console.log("IUnisapV3PoolABI", IUnisapV3PoolABI.abi)
  const poolContract = new Contract(
    POOL,
    IUnisapV3PoolABI.abi,
    ethers.provider
  );

  const [token0, token1, fee, tickSpacing, liquidity, slot0] =
    await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.tickSpacing(),
      poolContract.liquidity(),
      poolContract.slot0(),
    ]);

  return {
    token0,
    token1,
    fee,
    tickSpacing,
    liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
};
