import { ethers } from "hardhat";
import { Contract, utils } from "ethers";
import { config } from "dotenv";
import { IERC20 } from "../../typechain-types";
import { fromReadableAmount, toReadableAmount } from "../lib/conversion";
import {
  mintPositions,
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
const ROUTER_V3 = process.env.GOERLI_SWAP_ROUTER_02 || "";
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

  // approve 100 tokens for nft manager
  await usdc
    .connect(owner)
    .approve(NFT_MANAGER, ethers.utils.parseUnits("100", 6));

  await usdt
    .connect(owner)
    .approve(NFT_MANAGER, ethers.utils.parseUnits("100", 6));

  // mint positions
  let tx = await mintPositions();
  console.log("tx", tx);

  let usdtBalance = await usdt.balanceOf(owner.address);
  let usdcBalance = await usdc.balanceOf(owner.address);
  console.log(
    "usdc balance after mint Position",
    utils.formatUnits(usdcBalance, 6)
  );
  console.log(
    "usdt balance after mint Position",
    utils.formatUnits(usdtBalance, 6)
  );

  //arpove tokens for swap router
  await usdc.connect(owner).approve(ROUTER_V3, amount);
  await usdt.connect(owner).approve(ROUTER_V3, amount);

  const poolInfo = await getPoolData();

  console.log("poolInfo", poolInfo);

  const positionIds = await getPositionId();

  console.log("positionIds", positionIds);

  tx = await swapAndAddLiquidity(positionIds[positionIds.length - 1]);
  console.log("tx", tx);

  usdtBalance = await usdt.balanceOf(owner.address);
  usdcBalance = await usdc.balanceOf(owner.address);
  console.log(
    "usdc balance after adding liquidity",
    utils.formatUnits(usdcBalance, 6)
  );
  console.log(
    "usdt balance after adding liquidity",
    utils.formatUnits(usdtBalance, 6)
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
