import { ethers, run, network } from "hardhat";
import { utils } from "ethers";

async function main() {
  // const [owner] = await ethers.getSigners();
  // const Tether = await ethers.getContractFactory("Tether");
  // const tether = await Tether.deploy();
  // await tether.deployed();

  // const UsdCoin = await ethers.getContractFactory("UsdCoin");
  // const usdCoin = await UsdCoin.deploy();
  // await usdCoin.deployed();

  // const WrappedBitcoin = await ethers.getContractFactory("WrappedBitcoin");
  // const wrappedBitcoin = await WrappedBitcoin.deploy();
  // await wrappedBitcoin.deployed();

  // await tether.connect(owner).mint(owner.address, utils.parseEther("100000"));
  // await usdCoin
  //   .connect(owner)
  //   .mint(owner.address, utils.parseEther("100000"));
  // await wrappedBitcoin
  //   .connect(owner)
  //   .mint(owner.address, utils.parseEther("100000"));

  // console.log("Tether address:", tether.address);
  // console.log("UsdCoin address:", usdCoin.address);
  // console.log("WrappedBitcoin address:", wrappedBitcoin.address);

  // verify 3 contracts above
  console.log("verify contract...")
  try {
    await run("verify:verify", {
      address: "0x44f58750A39Be766853542f7226FAa6f265E1350",
      constructorArguments: [],
      contract: "contracts/Tether.sol:Tether",
    });
  } catch (error) {
    console.log("Contract verification failed:", error);
  }

  try {
    await run("verify:verify", {
      address: "0xd6bc45ffB4A91114AA7E0A1ef5F2bcA40caF6828",
      constructorArguments: [],
      contract: "contracts/UsdCoin.sol:UsdCoin",
    });
  } catch (error) {
    console.log("Contract verification failed:", error);
  }

  try {
    await run("verify:verify", {
      address: "0x713021a21784D83B95aeEc06f514c27b1016A3dB",
      constructorArguments: [],
      contract: "contracts/WrappedBitcoin.sol:WrappedBitcoin",
    });
  } catch (error) {
    console.log("Contract verification failed:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
