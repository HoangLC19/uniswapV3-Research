import { ethers, run, network } from "hardhat";
import { ContractFactory, utils } from "ethers";
import * as WETH9 from "./utils/WETH9.json";
import { linkLibraries } from "./utils/linkLibraries";
import { config } from "dotenv";
config();

const FACTORY = process.env.UniswapV3Factory || "";
const WETH = process.env.WETH9 || "";

// get abi of the contracts
const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
  NFTDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json"),
  NonfungibleTokenPositionDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  QuoterV2: require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json"),
  WETH9,
};

async function main() {
  const [owner] = await ethers.getSigners();

  const Weth = new ContractFactory(
    artifacts.WETH9.abi,
    artifacts.WETH9.bytecode,
    owner
  );
  const weth = await Weth.deploy();
  await weth.deployed();
  console.log("WETH9 deployed to:", weth.address);

  const Factory = new ContractFactory(
    artifacts.UniswapV3Factory.abi,
    artifacts.UniswapV3Factory.bytecode,
    owner
  );
  const factory = await Factory.deploy();
  await factory.deployed();
  console.log("UniswapV3Factory deployed to:", factory.address);

  const SwapRouter = new ContractFactory(
    artifacts.SwapRouter.abi,
    artifacts.SwapRouter.bytecode,
    owner
  );
  const swapRouter = await SwapRouter.deploy(FACTORY, WETH);
  await swapRouter.deployed();
  console.log("SwapRouter deployed to:", swapRouter.address);

  const NFTDescriptor = new ContractFactory(
    artifacts.NFTDescriptor.abi,
    artifacts.NFTDescriptor.bytecode,
    owner
  );
  const nftDescriptor = await NFTDescriptor.deploy();
  await nftDescriptor.deployed();
  console.log("NFTDescriptor deployed to:", nftDescriptor.address);

  const linkedBytecode = linkLibraries(
    {
      bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences: {
        "NFTDescriptor.sol": {
          NFTDescriptor: [
            {
              length: 20,
              start: 1681,
            },
          ],
        },
      },
    },
    {
      NFTDescriptor: nftDescriptor.address,
    }
  );

  const NonfungibleTokenPositionDescriptor = new ContractFactory(
    artifacts.NonfungibleTokenPositionDescriptor.abi,
    linkedBytecode,
    owner
  );
  const nonfungibleTokenPositionDescriptor =
    await NonfungibleTokenPositionDescriptor.deploy(
      WETH,
      utils.formatBytes32String("WETH")
    );
  await nonfungibleTokenPositionDescriptor.deployed();
  console.log(
    "NonfungibleTokenPositionDescriptor deployed to:",
    nonfungibleTokenPositionDescriptor.address
  );

  const NonfungiblePositionManager = new ContractFactory(
    artifacts.NonfungiblePositionManager.abi,
    artifacts.NonfungiblePositionManager.bytecode,
    owner
  );
  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    FACTORY,
    WETH,
    nonfungibleTokenPositionDescriptor.address
  );
  await nonfungiblePositionManager.deployed();

  console.log(
    "NonfungiblePositionManager deployed to:",
    nonfungiblePositionManager.address
  );

  const QuoterV2 = new ContractFactory(
    artifacts.QuoterV2.abi,
    artifacts.QuoterV2.bytecode,
    owner
  );
  const quoterV2 = await QuoterV2.deploy(FACTORY, WETH);
  await quoterV2.deployed();
  console.log("QuoterV2 deployed to:", quoterV2.address);
}

// function to verity factory contracts
// async function verifyContract(contractAddress: string, params: any[]) {
//   try {
//     await run("verify:verify", {
//       address: contractAddress,
//       constructorArguments: params,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
