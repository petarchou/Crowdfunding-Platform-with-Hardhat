# Crowdfunding Platform Project

This is a platform where users can create crowdfunding campaigns and receive funding for their projects.

Funding seekers can create new projects from the Crowdfunding Platform and present them to potential contributors.

Contributors can back the project by contributing ether until the funding goal is reached.
Contributors are eligible for receiving royalties based on how much they have contributed to the funding goal.
If the funding goal is not reached, contributors will receive a refund on all of their contributions.

Technical Details:

1. CrowdfundingProject uses the ERC20Upgradable contract from OpenZeppelin
2. The contracts are UNLICENSED
3. New projects are created with CREATE2
4. Alchemy is used for project deployment



Deployment on the Sepolia Network:
CrowdfundingPlatform: 0x905777AF37ebcDEa49C3868b319e347A3B38699e
CrowdfundingProject (ERC20 Implementation): 0x2c08c920763C076bf91D95b8276a6f68E605dfc9