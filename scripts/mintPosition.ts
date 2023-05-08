import { ethers } from "hardhat";
import { Contract, utils, BigNumber } from "ethers";
import { toReadableAmount } from "./lib/conversion";
import {
  getPositionId,
  mintPositions,
  PositionInfo,
  getPositionInfo,
} from "./lib/liquidity";
import Tether from "../artifacts/contracts/Tether.sol/Tether.json";
import UsdCoin from "../artifacts/contracts/UsdCoin.sol/UsdCoin.json";
import { config } from "dotenv";
import { getPoolData } from "./lib/pool";
config();

const TETHER = process.env.Tether || "";
const USDC = process.env.UsdCoin || "";
const NFT_MANAGER = process.env.NonfungiblePositionManager || "";
const WALLET = process.env.WALLET_ADDRESS || "";
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

const tetherContract = new Contract(TETHER, Tether.abi, ethers.provider);
const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

const main = async () => {
  // mint usdt for owner
  console.log("minted 100 USDT for owner");
  const amount = utils.parseUnits("100", 18);
  await tetherContract.connect(wallet).mint(WALLET, amount);
  console.log(
    `owner usdt balance ${toReadableAmount(
      await tetherContract.balanceOf(WALLET),
      18
    )}`
  );

  // mint usdc for owner
  console.log("minted 100 USDC for owner");
  const usdcContract = new Contract(USDC, UsdCoin.abi, ethers.provider);
  await usdcContract.connect(wallet).mint(WALLET, amount);
  console.log(
    `owner usdc balance ${toReadableAmount(
      await usdcContract.balanceOf(WALLET),
      18
    )}`
  );

  // approve usdt for nft manager
  await tetherContract.connect(wallet).approve(NFT_MANAGER, amount);

  // approve usdc for nft manager
  await usdcContract.connect(wallet).approve(NFT_MANAGER, amount);

  const receipt = await mintPositions();

  console.log("receipt", receipt);

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
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
