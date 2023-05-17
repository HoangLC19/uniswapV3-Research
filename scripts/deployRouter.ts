import { ethers, run, network } from "hardhat";
import { ContractFactory, utils } from "ethers";
import * as WETH9 from "./utils/WETH9.json";
import { linkLibraries } from "./utils/linkLibraries";
import { config } from "dotenv";
config();

// get abi of the contracts
const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
  WETH9,
};

const FACTORY = process.env.FACTORY || "";
const WETH = process.env.WETH || "";

const main = async () => {
  //deploy smart router contract on arbitrum
  const [owner] = await ethers.getSigners();
  const SwapRouter = new ContractFactory(
    artifacts.SwapRouter.abi,
    artifacts.SwapRouter.bytecode,
    owner
  );

  const swapRouter = await SwapRouter.deploy(FACTORY, WETH);
  await swapRouter.deployed();
  console.log("SwapRouter deployed to:", swapRouter.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
  });
