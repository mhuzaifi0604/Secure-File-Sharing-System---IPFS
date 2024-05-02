require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    Ganache:{
      url: "http://127.0.0.1:7545",
      accounts: ['0x25519330db47cac4cb150664223b0889837ee0df93663210128cefec2551be5f']
    }
  }
};
