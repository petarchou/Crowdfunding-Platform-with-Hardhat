require("@nomicfoundation/hardhat-toolbox");
require("./tasks");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      debug:true,
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/eTwmP7IfEizMSz4vw2MR6hJArNqcpTwY",
      accounts: ['4de7cfef43b1c3f504894cb316f2d9aa6a204cfc62637b22419867a20f471248'] //VERY RICH ACCOUNT, 9999 ETHERS INSIDE

    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "R66KS2NSCIF5IG5U15A3WRPEVVYYH5FMNS"
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100
      },
  }
};
