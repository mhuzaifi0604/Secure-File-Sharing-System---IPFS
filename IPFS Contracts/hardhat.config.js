require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    Ganache:{
      url: "http://127.0.0.1:7545",
      accounts: ['0x40d55865ddd54e509f9c92f9ea9ebf754f06e1d991ccb912904be959e32bedc7']
    }
  }
};
