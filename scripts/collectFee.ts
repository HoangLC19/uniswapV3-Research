import { ethers } from "hardhat";
import { Contract, utils, BigNumber, Wallet } from "ethers";
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
import {
  collectFees,
  getPositionId,
  getPositionInfo,
  PositionInfo,
} from "./lib/liquidity";
import { config } from "dotenv";
import Tether from "../artifacts/contracts/Tether.sol/Tether.json";
import UsdCoin from "../artifacts/contracts/UsdCoin.sol/UsdCoin.json";
import { fromReadableAmount } from "./lib/conversion";
import { getPoolData } from "./lib/pool";
config();

const FACTORY = process.env.UniswapV3Factory || "";
const WETH = process.env.WETH9 || "";
const TETHER = process.env.Tether || "";
const USDC = process.env.UsdCoin || "";
const POOL = process.env.PoolAddress || "";
const QUOTER = process.env.QuoterV2 || "";
const ROUTER = process.env.SwapRouter || "";
const WALLET = process.env.WALLET_ADDRESS || "";
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const TRADER_WALLET = process.env.TRADER_ADDRESS || "";
const TRADER_PRIVATE_KEY = process.env.TRADER_PRIVATE_KEY || "";

const tetherContract = new Contract(TETHER, Tether.abi, ethers.provider);
const usdcContract = new Contract(USDC, UsdCoin.abi, ethers.provider);
const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

const tokenA = new Token(11155111, TETHER, 18, "USDT", "Tether");
const tokenB = new Token(11155111, USDC, 18, "USDC", "USDCoin");

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
  const poolOwner = new Wallet(PRIVATE_KEY, ethers.provider);
  const trader = new Wallet(TRADER_PRIVATE_KEY, ethers.provider);

  //   await tetherContract
  //     .connect(poolOwner)
  // .mint(TRADER_WALLET, utils.parseEther("100"));

  //   // console log balances of 2 tokens before swap
  let usdtBalance = await tetherContract.balanceOf(TRADER_WALLET);
  let usdcBalance = await usdcContract.balanceOf(TRADER_WALLET);
  //   console.log("usdtBalance", usdtBalance.toString());
  //   console.log("usdcBalance", usdcBalance.toString());

  //   const poolInfo = await getPoolData();

  //   const pool = new Pool(
  //     tokenA,
  //     tokenB,
  //     poolInfo.fee,
  //     poolInfo.sqrtPriceX96,
  //     poolInfo.liquidity,
  //     poolInfo.tick
  //   );

  //   const swapRoute = new Route([pool], tokenB, tokenA);

  //   const amountOut = await getOutputQuote(swapRoute, tokenB, 5);

  //   const uncheckedTrade = Trade.createUncheckedTrade({
  //     route: swapRoute,
  //     inputAmount: CurrencyAmount.fromRawAmount(
  //       tokenB,
  //       fromReadableAmount(5, 18)
  //     ),
  //     outputAmount: CurrencyAmount.fromRawAmount(tokenA, amountOut.toString()),
  //     tradeType: TradeType.EXACT_INPUT,
  //   });

  //   await usdcContract.connect(trader).approve(ROUTER, utils.parseEther("5"));

  //   const options: SwapOptions = {
  //     slippageTolerance: new Percent("50", "10000"),
  //     deadline: Math.floor(Date.now() / 1000) + 60 * 20,
  //     recipient: TRADER_WALLET,
  //   };

  //   const methodParameters = SwapRouter.swapCallParameters(
  //     [uncheckedTrade],
  //     options
  //   );

  //   const tx = {
  //     data: methodParameters.calldata,
  //     to: ROUTER,
  //     value: methodParameters.value,
  //     from: TRADER_WALLET,
  //     maxFeePerGas: 1000000000,
  //     maxPriorityFeePerGas: 1000000000,
  //   };

  //   const res = await sendTransactionViaWallet(trader, tx);

  //   // console log balances of 2 tokens after swap
  //   usdtBalance = await tetherContract.balanceOf(TRADER_WALLET);
  //   usdcBalance = await usdcContract.balanceOf(TRADER_WALLET);
  //   console.log("usdtBalance", usdtBalance.toString());
  //   console.log("usdcBalance", usdcBalance.toString());

  // get posision id
  const tokenIds: number[] = await getPositionId();
  const poolData = await getPoolData();
  console.log("poolData", poolData);

  console.log("tokenIds", tokenIds);

  // collect fees

  await collectFees(tokenIds[2]);

  let positionInfo: PositionInfo[] = [];
  for (let i = 0; i < tokenIds.length; i++) {
    const info = await getPositionInfo(tokenIds[i]);
    positionInfo.push(info);
  }

  console.log("positionInfo", positionInfo);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
