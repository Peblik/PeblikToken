var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "rXJi4CbP8yVMyPcbV25M";
var mnemonic = "social torch security wife involve stable arena tribe oven focus stable prosper";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      from: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
      gas: 4710000 // note that 47100000 is barely enough -- need to cut down contract size
      //gas: 4800000 // 47100000 is the max for Ropsten and Mainnet
    },
    azure: {
      host: "nooc4oyz7.westus2.cloudapp.azure.com",
      port: 8545,
      network_id: "*",
      from: "0xe64A4a8B4d6a19C71e3D18E0C3C7e20D9E8C86Aa"
      //, gas: 4710000
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey),
      network_id: 3,
      //from: "0xE07d7B62Ab04D68DA8d2E29504C13C419BcECC4F",
      gasPrice: 100000000000
      , gas: 4300000
    },
    mainnet: {
      provider: new HDWalletProvider(mnemonic, "https://mainnet.infura.io/" + infura_apikey),
      network_id: 1,
      //, from: "0x67345a69d26904754cfE7E1205b4F0725d5E4E7E",
      gas: 4300000
    }
  }
};
