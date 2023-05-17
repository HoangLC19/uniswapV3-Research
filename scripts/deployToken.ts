import { ethers, run} from "hardhat";
import { utils } from "ethers";

async function main() {
  const [owner] = await ethers.getSigners();
  const Tether = await ethers.getContractFactory("Tether");
  const tether = await Tether.deploy();
  await tether.deployed();

  const UsdCoin = await ethers.getContractFactory("UsdCoin");
  const usdCoin = await UsdCoin.deploy();
  await usdCoin.deployed();

  await tether.connect(owner).mint(owner.address, utils.parseEther("100000"));
  await usdCoin.connect(owner).mint(owner.address, utils.parseEther("100000"));

  console.log("Tether address:", tether.address);
  console.log("UsdCoin address:", usdCoin.address);

  // verify 3 contracts above
  // console.log("verify contract...");
  // try {
  //   await run("verify:verify", {
  //     address: tether.address,
  //     constructorArguments: [],
  //     contract: "contracts/Tether.sol:Tether",
  //   });
  // } catch (error) {
  //   console.log("Contract verification failed:", error);
  // }

  // try {
  //   await run("verify:verify", {
  //     address: usdCoin.address,
  //     constructorArguments: [],
  //     contract: "contracts/UsdCoin.sol:UsdCoin",
  //   });
  // } catch (error) {
  //   console.log("Contract verification failed:", error);
  // }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
