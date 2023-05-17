import { Contract, BigNumber } from "ethers";
import { ethers } from "hardhat";
import { config } from "dotenv";
import bn from "bignumber.js";
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });
config();
const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

const TETHER_ADDRESS = process.env.USDT || "";
const USDC_ADDRESS = process.env.PEPE || "";

// Uniswap contract address
const FACTORY_ADDRESS = process.env.FACTORY || "";
const POSITION_MANAGER_ADDRESS = process.env.NFT_MANAGER || "";

const encodePriceSqrt = (reserve1: number, reserve0: number) => {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
};

const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  artifacts.NonfungiblePositionManager.abi,
  ethers.provider
);

const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory.abi,
  ethers.provider
);

const deployPool = async (token0: any, token1: any, fee: any, price: any) => {
  const [owner] = await ethers.getSigners();
  await nonfungiblePositionManager
    .connect(owner)
    .createAndInitializePoolIfNecessary(token0, token1, fee, price, {
      gasLimit: 5000000,
    });
  const poolAddress = await factory.getPool(token0, token1, fee);
  return poolAddress;
};

const main = async () => {
  const usdtPepe500 = await deployPool(
    TETHER_ADDRESS,
    USDC_ADDRESS,
    500,
    encodePriceSqrt(2, 1)
  );
  console.log("USDT/PEPE 500: ", usdtPepe500);

  const poolAddress = await factory.getPool(TETHER_ADDRESS, USDC_ADDRESS, 500);
  console.log("poolAddress", poolAddress);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
