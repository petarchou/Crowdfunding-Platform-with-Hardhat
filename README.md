# Crowdfunding Platform Project

This is a platform where users can create crowdfunding campaigns and receive funding for their projects.

Funding seekers can create new projects from the Crowdfunding Platform and present them to potential contributors.

Contributors can back the project by contributing ether until the funding goal is reached.
Contributors are eligible for receiving royalties based on how much they have contributed to the funding goal.
If the funding goal is not reached, contributors will receive a refund on all of their contributions.

Technical Details:

This project contains two main contracts:
**CrowdfundingPlatform** - a Minimal Proxy factory which creates instances of the CrowdfundingProject contract. It is built via OpenZeppelin Clones and uses create2 for clone creation.
**CrowdfundingProject** - an ERC20Upgradable contract which represents the implementation for a crowdfunding project.

The contracts are UNLICENSED
Alchemy is used for project deployment



Deployment on the Sepolia Network:<br>
**CrowdfundingPlatform**: [0x905777AF37ebcDEa49C3868b319e347A3B38699e](https://sepolia.etherscan.io/address/0x905777AF37ebcDEa49C3868b319e347A3B38699e)<br>
**CrowdfundingProject**: [0x2c08c920763C076bf91D95b8276a6f68E605dfc9](https://sepolia.etherscan.io/address/0x2c08c920763C076bf91D95b8276a6f68E605dfc9)