// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  await hre.run("compile");

  const CrowdfundingPorject = await hre.ethers.getContractFactory("CrowdfundingProject");
  const crowdfundingProject = await CrowdfundingPorject.deploy();

  console.log(
    `CrowdfundingProject Implementation was deployed at address ${crowdfundingProject.address}`
  );

  const CrowdfundingPlatform = await hre.ethers.getContractFactory("CrowdfundingPlatform");
  const crowdfundingPlatform = await CrowdfundingPlatform.deploy(crowdfundingProject.address);

  console.log(
    `CrowdfundingPlatform was deployed at address ${crowdfundingPlatform.address}`
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
