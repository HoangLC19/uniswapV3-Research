import {
  AlphaRouter,
  ChainId,
  SwapOptionsSwapRouter02,
  SwapRoute,
  SwapType,
} from "@uniswap/smart-order-router";
import { TradeType, CurrencyAmount, Percent, Token } from "@uniswap/sdk-core";
import { sendTransactionViaWallet, TransactionState } from "./provider";
import { ethers } from "hardhat";
import { fromReadableAmount } from "./conversion";
import { config } from "dotenv";
config();

// const WALLET_ADDRESS = process.env.WALLET_ADDRESS || "";
const PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const USDC = process.env.MAINNET_USDC || "";
const USDT = process.env.MAINNET_USDT || "";
const ROUTER = process.env.GOERLI_SWAP_ROUTER || "";
const tokenA = new Token(1, USDC, 6, "USDC", "USD Coin");
const tokenB = new Token(1, USDT, 6, "USDT", "Tether USD");

export const generateRoute = async (): Promise<SwapRoute | null> => {
  const accounts = await ethers.getSigners();
  const owner = accounts[0];
  const router = new AlphaRouter({
    chainId: ChainId.MAINNET,
    provider: ethers.provider,
  });

  const options: SwapOptionsSwapRouter02 = {
    recipient: owner.address,
    slippageTolerance: new Percent("50", "10000"),
    deadline: Math.floor(Date.now() / 1000 + 1800),
    type: SwapType.SWAP_ROUTER_02,
  };

  const route = await router.route(
    CurrencyAmount.fromRawAmount(
      tokenA,
      fromReadableAmount(10, tokenA.decimals)
    ),
    tokenB,
    TradeType.EXACT_INPUT,
    options
  );

  return route;
};

export const executeRoute = async (
  route: SwapRoute
): Promise<TransactionState> => {
  const wallet = new ethers.Wallet(PRIVATE_KEY || "", ethers.provider);

  const accounts = await ethers.getSigners();
  const owner = accounts[0];
  const res = await sendTransactionViaWallet(wallet, {
    data: route.methodParameters?.calldata,
    to: ROUTER,
    value: route?.methodParameters?.value,
    from: owner.address,
    maxFeePerGas: "1000000000",
    maxPriorityFeePerGas: "1000000000",
  });

  return res;
};
