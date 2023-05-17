import { ethers, run, network } from "hardhat";
import { PepeCoin } from "../typechain-types";

const main = async () => {
  //   let pepeCoin: PepeCoin;
  //   const [owner] = await ethers.getSigners();
  //   const PepeCoin = await ethers.getContractFactory("PepeCoin");
  //   pepeCoin = await PepeCoin.deploy();
  //   await pepeCoin.deployed();

  //   console.log("PepeCoin deployed to:", pepeCoin.address);

  // verify contract on arbiscan
  console.log("verifying contract on arbiscan");
  //   await verify(pepeCoin.address);
  try {
    await run("verify:verify", {
      address: "0x8fa551BefF617D4A80509C28c220cE63d2bBcBE4",
      constructorArguments: [],
      contract: "contracts/PepeCoin.sol:PepeCoin",
    });
  } catch (error) {
    console.log("Contract verification failed:", error);
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
  });
