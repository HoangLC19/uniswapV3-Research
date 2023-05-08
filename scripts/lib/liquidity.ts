import { CurrencyAmount, Percent, Token, Fraction } from "@uniswap/sdk-core";
import {
  MintOptions,
  nearestUsableTick,
  NonfungiblePositionManager,
  Pool,
  Position,
  AddLiquidityOptions,
  RemoveLiquidityOptions,
  CollectOptions,
} from "@uniswap/v3-sdk";
import { BigNumber, Contract, Wallet } from "ethers";
import { ethers } from "hardhat";
import { fromReadableAmount } from "./conversion";
import { config } from "dotenv";
config();
import NONFUNGIBLE_POSITION_MANAGER_ABI from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { getPoolData } from "./pool";
import { TransactionState, sendTransactionViaWallet } from "./provider";
import {
  AlphaRouter,
  SwapAndAddConfig,
  SwapAndAddOptions,
  SwapToRatioResponse,
  SwapToRatioRoute,
  SwapToRatioStatus,
  SwapType,
} from "@uniswap/smart-order-router";

const NONFUNGIBLE_POSITION_MANAGER_ADDRESS =
  process.env.NonfungiblePositionManager || "";
const WALLET = process.env.WALLET_ADDRESS || "";
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const TETHER = process.env.Tether || "";
const USDC = process.env.UsdCoin || "";
const ROUTER = process.env.SwapRouter || "";

export interface PositionInfo {
  tickLower: number;
  tickUpper: number;
  liquidity: BigNumber;
  feeGrowthInside0LastX128: BigNumber;
  feeGrowthInside1LastX128: BigNumber;
  tokensOwed0: BigNumber;
  tokensOwed1: BigNumber;
}
const tokenA = new Token(11155111, TETHER, 18, "USDT", "Tether");
const tokenB = new Token(11155111, USDC, 18, "USDC", "USDCoin");

export const swapAndAddLiquidity = async (positionId: number) => {
  const wallet = new Wallet(PRIVATE_KEY, ethers.provider);
  const provider = ethers.provider;

  if (!wallet || !provider) {
    return TransactionState.Failed;
  }

  const router = new AlphaRouter({
    chainId: 11155111,
    provider: provider,
  });

  const tokenACurrencyAmount = CurrencyAmount.fromRawAmount(
    tokenA,
    fromReadableAmount(100, tokenA.decimals)
  );

  const tokenBCurrencyAmount = CurrencyAmount.fromRawAmount(
    tokenB,
    fromReadableAmount(100, tokenB.decimals)
  );

  const currentPosition = await constructPositionWithPlaceholderLiquidity(
    tokenA,
    tokenB
  );
``
  const swapAndConfig: SwapAndAddConfig = {
    ratioErrorTolerance: new Fraction("1", "10000"),
    maxIterations: 6,
  };

  const swapAndOptions: SwapAndAddOptions = {
    swapOptions: {
      type: SwapType.SWAP_ROUTER_02,
      recipient: WALLET,
      slippageTolerance: new Percent("50", "10000"),
      deadline: 60 * 20,
    },
    addLiquidityOptions: {
      tokenId: positionId,
    },
  };

  const routeToRatioResponse: SwapToRatioResponse = await router.routeToRatio(
    tokenACurrencyAmount,
    tokenBCurrencyAmount,
    currentPosition,
    swapAndConfig,
    swapAndOptions
  );

  if (
    !routeToRatioResponse ||
    routeToRatioResponse.status !== SwapToRatioStatus.SUCCESS
  )
    return TransactionState.Failed;

  const route: SwapToRatioRoute = routeToRatioResponse.result;

  const transaction = {
    data: route.methodParameters?.calldata,
    to: ROUTER,
    value: route.methodParameters?.value,
    from: WALLET,
  };

  return sendTransactionViaWallet(wallet, transaction);
};

export const mintPositions = async () => {
  const provider = ethers.provider;
  const wallet = new Wallet(PRIVATE_KEY, provider);
  const tokenA = new Token(11155111, TETHER, 18, "USDT", "Tether");
  const tokenB = new Token(11155111, USDC, 18, "USDC", "USDCoin");

  const positionToMint = await constructPosition(
    CurrencyAmount.fromRawAmount(
      tokenA,
      fromReadableAmount(100, tokenA.decimals)
    ),
    CurrencyAmount.fromRawAmount(
      tokenB,
      fromReadableAmount(100, tokenB.decimals)
    )
  );

  const mintOptions: MintOptions = {
    recipient: WALLET,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    slippageTolerance: new Percent("50", "10000"),
  };

  const { calldata, value } = NonfungiblePositionManager.addCallParameters(
    positionToMint,
    mintOptions
  );

  const transaction = {
    data: calldata,
    to: NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    value: value,
    from: WALLET,
    maxFeePerGas: 1000000000,
    maxPriorityFeePerGas: 1000000000,
  };

  const txRes = await sendTransactionViaWallet(wallet, transaction);

  console.log(txRes);

  return txRes;
};

export const addLiquidity = async (PositionId: number) => {
  const provider = ethers.provider;
  const wallet = new Wallet(PRIVATE_KEY, provider);

  const positionToIncreaseBy = await constructPosition(
    CurrencyAmount.fromRawAmount(
      tokenA,
      fromReadableAmount(100, tokenA.decimals)
    ),
    CurrencyAmount.fromRawAmount(
      tokenB,
      fromReadableAmount(100, tokenB.decimals)
    )
  );

  const addLiquidityOptions: AddLiquidityOptions = {
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    slippageTolerance: new Percent("50", "10000"),
    tokenId: PositionId,
  };

  const { calldata, value } = NonfungiblePositionManager.addCallParameters(
    positionToIncreaseBy,
    addLiquidityOptions
  );

  const transaction = {
    data: calldata,
    to: NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    value: value,
    from: WALLET,
    maxFeePerGas: 100000000000,
    maxPriorityFeePerGas: 1000000000,
  };

  return sendTransactionViaWallet(wallet, transaction);
};

export const removeLiquidity = async (PositionId: number) => {
  const provider = ethers.provider;
  const address = new Wallet(PRIVATE_KEY, provider);

  const currentPosition = await constructPosition(
    CurrencyAmount.fromRawAmount(tokenA, fromReadableAmount(50, 18)),
    CurrencyAmount.fromRawAmount(tokenB, fromReadableAmount(50, 18))
  );

  const collectOptions: Omit<CollectOptions, "tokenId"> = {
    expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(tokenA, 0),
    expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(tokenB, 0),
    recipient: address.address,
  };

  const removeLiquidityOptions: RemoveLiquidityOptions = {
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    slippageTolerance: new Percent("50", "10000"),
    tokenId: PositionId,
    //percentage of liquidity to remove
    liquidityPercentage: new Percent(1),
    collectOptions,
  };

  const { calldata, value } = NonfungiblePositionManager.removeCallParameters(
    currentPosition,
    removeLiquidityOptions
  );

  const transaction = {
    data: calldata,
    to: NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    value: value,
    from: WALLET,
    maxFeePerGas: 100000000000,
    maxPriorityFeePerGas: 1000000000,
  };

  return sendTransactionViaWallet(address, transaction);
};

export const constructPositionWithPlaceholderLiquidity = async (
  tokenA: Token,
  tokenB: Token
) => {
  const poolData = await getPoolData();

  //construct pool instance
  const configuredPool = new Pool(
    tokenA,
    tokenB,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  );

  //create position using the maximum liquidity from input amounts
  return new Position({
    pool: configuredPool,
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 4,
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 4,
    liquidity: 1,
  });
};

export const constructPosition = async (
  token0Amount: CurrencyAmount<Token>,
  token1Amount: CurrencyAmount<Token>
) => {
  const poolInfo = await getPoolData();

  // construct pool instance
  const configuredPool = new Pool(
    token0Amount.currency,
    token1Amount.currency,
    poolInfo.fee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  );

  // create position using the maximum liquidity from input amounts
  return Position.fromAmounts({
    pool: configuredPool,
    tickLower:
      nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) -
      poolInfo.tickSpacing * 4,
    tickUpper:
      nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) +
      poolInfo.tickSpacing * 4,
    amount0: token0Amount.quotient,
    amount1: token1Amount.quotient,
    useFullPrecision: true,
  });
};

export const collectFees = (positionId: number) => {
  const provider = ethers.provider;

  const collectOptions: CollectOptions = {
    tokenId: positionId,
    expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
      tokenA,
      fromReadableAmount(10, 18)
    ),
    expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
      tokenB,
      fromReadableAmount(10, 18)
    ),
    recipient: WALLET,
  };

  //get calldata for minting a position
  const { calldata, value } =
    NonfungiblePositionManager.collectCallParameters(collectOptions);

  const transaction = {
    data: calldata,
    to: NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    value: value,
    from: WALLET,
    maxFeePerGas: 100000000000,
    maxPriorityFeePerGas: 1000000000,
  };

  return sendTransactionViaWallet(
    new Wallet(PRIVATE_KEY, provider),
    transaction
  );
};

export const getPositionId = async (): Promise<number[]> => {
  const provider = ethers.provider;

  const positionContract = new Contract(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    NONFUNGIBLE_POSITION_MANAGER_ABI.abi,
    provider
  );

  // Get number of positions
  const balance = await positionContract.balanceOf(WALLET);

  // Get all position
  const tokenIds = [];
  for (let i = 0; i < balance; i++) {
    const tokenOfOwnerByIndex: number =
      await positionContract.tokenOfOwnerByIndex(WALLET, i);
    tokenIds.push(tokenOfOwnerByIndex);
  }

  return tokenIds;
};

export const getPositionInfo = async (
  tokenId: number
): Promise<PositionInfo> => {
  const provider = ethers.provider;

  const positionContract = new Contract(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    NONFUNGIBLE_POSITION_MANAGER_ABI.abi,
    provider
  );

  const position = await positionContract.positions(tokenId);

  return {
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
    feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
    feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
    tokensOwed0: position.tokensOwed0,
    tokensOwed1: position.tokensOwed1,
  };
};
