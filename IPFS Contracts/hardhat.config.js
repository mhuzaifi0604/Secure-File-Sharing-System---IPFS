require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    Ganache:{
      url: "http://127.0.0.1:7545",
      accounts: ['0xf5814836473908e56bbb9d732cd73cf9465dea8a85aa43f8d4b4806b79d9fd61']
    }
  }
};
