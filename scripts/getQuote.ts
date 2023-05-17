import { computePoolAddress } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import IUnisapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";

import { fromReadableAmount, toReadableAmount } from "./lib/conversion";
import { config } from "dotenv";
config();


const pool = process.env.USDT_USDC_POOL || "";
const QUOTER = process.env.GOERLI_QUOTER || "";

const getPoolData = async (poolAddress: Contract) => {
  const [token0, token1, fee] = await Promise.all([
    poolAddress.token0(),
    poolAddress.token1(),
    poolAddress.fee(),
  ]);

  return {
    token0,
    token1,
    fee,
  };
};

const main = async () => {
  const poolContract = new Contract(
    pool,
    IUnisapV3PoolABI.abi,
    ethers.provider
  );

  const poolConstants = await getPoolData(poolContract);
  console.log("poolConstants", poolConstants);

  const quoterContract = new Contract(QUOTER, Quoter.abi, ethers.provider);

  const params = {
    tokenIn: poolConstants.token0,
    tokenOut: poolConstants.token1,
    fee: poolConstants.fee,
    amountIn: fromReadableAmount(1, 18).toString(),
    sqrtPriceLimitX96: 0,
  };

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    params
  );

  console.log(quotedAmountOut);

  console.log(
    "quoteAmountOut",
    toReadableAmount(quotedAmountOut.amountOut, 18)
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
