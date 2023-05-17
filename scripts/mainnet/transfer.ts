import { ethers, network } from "hardhat";
import { IERC20 } from "../../typechain-types";

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const USDC_WHALE = "0x203520F4ec42Ea39b03F62B20e20Cf17DB5fdfA7";
const USDT_WHALE = "0xF7F741e29828da8500A5DAAE6A348008FE3a5816";

export const transferUSDC = async () => {
  {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDC_WHALE],
    });
  }

  const whale = await ethers.getSigner(USDC_WHALE);
  const usdc = await ethers.getContractAt("IERC20", USDC);

  const accounts = await ethers.getSigners();
  const owner = accounts[0];

  const HUNRED_THOUSAND = ethers.utils.parseUnits("100000", 6);
  let whaleBalance = await usdc.balanceOf(USDC_WHALE);
  let attackerBalance = await usdc.balanceOf(owner.address);

  console.log(owner.address);

  console.log(
    "Initial whale balance",
    ethers.utils.formatUnits(whaleBalance, 6)
  );
  console.log(
    "Initial attacker balance",
    ethers.utils.formatUnits(attackerBalance, 6)
  );

  await accounts[0].sendTransaction({
    to: whale.address,
    value: ethers.utils.parseEther("50"),
  });

  await usdc.connect(whale).transfer(owner.address, HUNRED_THOUSAND);

  whaleBalance = await usdc.balanceOf(USDC_WHALE);
  attackerBalance = await usdc.balanceOf(owner.address);

  console.log("Final whale balance", ethers.utils.formatUnits(whaleBalance, 6));
  console.log(
    "Final attacker balance",
    ethers.utils.formatUnits(attackerBalance, 6)
  );
};

export const transferUSDT = async () => {
    {
        await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [USDT_WHALE],
        });
    }
    
    const whale = await ethers.getSigner(USDT_WHALE);
    const usdt = await ethers.getContractAt("IERC20", USDT);
    
    const accounts = await ethers.getSigners();
    const owner = accounts[0];
    
    const HUNRED_THOUSAND = ethers.utils.parseUnits("100000", 6);
    let whaleBalance = await usdt.balanceOf(USDT_WHALE);
    let attackerBalance = await usdt.balanceOf(owner.address);
    
    console.log(owner.address);
    
    console.log(
        "Initial whale balance",
        ethers.utils.formatUnits(whaleBalance, 6)
    );
    console.log(
        "Initial attacker balance",
        ethers.utils.formatUnits(attackerBalance, 6)
    );
    
    await accounts[0].sendTransaction({
        to: whale.address,
        value: ethers.utils.parseEther("50"),
    });
    
    await usdt.connect(whale).transfer(owner.address, HUNRED_THOUSAND);
    
    whaleBalance = await usdt.balanceOf(USDT_WHALE);
    attackerBalance = await usdt.balanceOf(owner.address);
    
    console.log("Final whale balance", ethers.utils.formatUnits(whaleBalance, 6));
    console.log(
        "Final attacker balance",
        ethers.utils.formatUnits(attackerBalance, 6)
    );
};
