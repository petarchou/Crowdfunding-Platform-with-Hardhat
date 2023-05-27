const { task } = require("hardhat/config");

task("deploy", "Deploys the project on the current environment")
  .setAction(async () => {

    const [deployer] = await ethers.getSigners();
    const CrowdfundingPorject = await ethers.getContractFactory("CrowdfundingProject", deployer);
    const crowdfundingProject = await CrowdfundingPorject.deploy();

    console.log(
      `CrowdfundingProject Implementation was deployed at address ${crowdfundingProject.address}`
    );

    const CrowdfundingPlatform = await ethers.getContractFactory("CrowdfundingPlatform");
    const crowdfundingPlatform = await CrowdfundingPlatform.deploy(crowdfundingProject.address);

    console.log(
      `CrowdfundingPlatform was deployed at address ${crowdfundingPlatform.address}`
    );
  });