import { ethers } from "hardhat";
import { Contract, utils } from "ethers";
import {
  Currency,
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
} from "@uniswap/sdk-core";
import {
  Route,
  Pool,
  SwapQuoter,
  SwapOptions,
  SwapRouter,
  Trade,
} from "@uniswap/v3-sdk";
import { config } from "dotenv";
import Tether from "../artifacts/contracts/Tether.sol/Tether.json";
import UsdCoin from "../artifacts/contracts/UsdCoin.sol/UsdCoin.json";
import { sendTransactionViaWallet } from "./lib/provider";
import { fromReadableAmount, toReadableAmount } from "./lib/conversion";
config();

import { getPoolData } from "./lib/pool";

const TETHER = process.env.GOERLI_USDT || "";
const USDC = process.env.GOERLI_USDC || "";
const QUOTER = process.env.GOERLI_QUOTER || "";
const ROUTER = process.env.GOERLI_SWAP_ROUTER || "";
const WALLET = process.env.WALLET_ADDRESS || "";
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

const tetherContract = new Contract(TETHER, Tether.abi, ethers.provider);
const usdcContract = new Contract(USDC, UsdCoin.abi, ethers.provider);
const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

const tokenA = new Token(5, TETHER, 18, "USDT", "Tether");
const tokenB = new Token(5, USDC, 18, "USDC", "USDCoin");

const getOutputQuote = async (
  route: Route<Currency, Currency>,
  tokenIn: Token,
  amountIn: number
) => {
  const provider = ethers.provider;

  if (!provider) {
    throw new Error("Provider not found");
  }

  const { calldata } = await SwapQuoter.quoteCallParameters(
    route,
    CurrencyAmount.fromRawAmount(
      tokenIn,
      fromReadableAmount(amountIn, 18).toString()
    ),
    TradeType.EXACT_INPUT,
    {
      useQuoterV2: true,
    }
  );

  const quoteCallReturnData = await provider.call({
    to: QUOTER,
    data: calldata,
  });

  return utils.defaultAbiCoder.decode(["uint256"], quoteCallReturnData);
};

const main = async () => {
  const poolInfo = await getPoolData();

  const pool = new Pool(
    tokenA,
    tokenB,
    poolInfo.fee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  );

  const swapRoute = new Route([pool], tokenA, tokenB);
  //
  console.log("swapRoute", swapRoute);

  const amountOut = await getOutputQuote(swapRoute, tokenA, 5);

  console.log("amountOut", amountOut.toString());

  const uncheckedTrade = Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(
      tokenA,
      fromReadableAmount(5, 18).toString()
    ),
    outputAmount: CurrencyAmount.fromRawAmount(tokenB, amountOut.toString()),
    tradeType: TradeType.EXACT_INPUT,
  });

  // console.log("uncheckedTrade", uncheckedTrade);

  await tetherContract.connect(wallet).approve(ROUTER, utils.parseEther("5"));

  await tetherContract.approval;

  const options: SwapOptions = {
    slippageTolerance: new Percent(10, 10_000),
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    recipient: WALLET,
  };

  // log the balances before the swap
  const [usdt, usdc] = await Promise.all([
    tetherContract.balanceOf(WALLET),
    usdcContract.balanceOf(WALLET),
  ]);

  console.log("usdt balance before Swap", toReadableAmount(usdt, 18));
  console.log("usdc balance before Swap", toReadableAmount(usdc, 18));

  const methodParameters = SwapRouter.swapCallParameters(
    [uncheckedTrade],
    options
  );

  console.log("methodParameters", methodParameters);

  const tx = {
    data: methodParameters.calldata,
    to: ROUTER,
    value: methodParameters.value,
    from: WALLET,
    maxFeePerGas: 1000000000,
    maxPriorityFeePerGas: 1000000000,
  };

  const res = await sendTransactionViaWallet(wallet, tx);

  console.log("res", res);

  // log the balances after the swap
  const [usdtAfter, usdcAfter] = await Promise.all([
    tetherContract.balanceOf(WALLET),
    usdcContract.balanceOf(WALLET),
  ]);

  console.log("usdt balance after Swap", toReadableAmount(usdtAfter, 18));
  console.log("usdc balance after Swap", toReadableAmount(usdcAfter, 18));

  //   console.log("res", res);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
