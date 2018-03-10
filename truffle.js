var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "J7hZz39axP4U4uJztgah";
var mnemonic = "social torch security wife involve stable arena tribe oven focus stable prosper";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      network_id: "*" // Match any network id
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
      network_id: 3
      //, from: "0xe64A4a8B4d6a19C71e3D18E0C3C7e20D9E8C86Aa"
      , gas: 3000000
    },
    mainnet: {
      provider: new HDWalletProvider(mnemonic, "https://mainnet.infura.io/" + infura_apikey),
      network_id: 1
      //, from: "0xe64A4a8B4d6a19C71e3D18E0C3C7e20D9E8C86Aa"
      //, gas: 4710000
    }
  }
};
