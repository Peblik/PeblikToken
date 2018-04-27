var Token = artifacts.require("./PlayCashToken.sol");
var Presale = artifacts.require("./PlayCashPresale.sol");
var TokenSale = artifacts.require("./PlayCashTokenSale.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Token).then(function() {
    console.log("PlayCashToken deployed at " + Token.address);

    var dt = new Date();

    const earlyTime = Math.round((dt.getTime())/1000) + 600; // ten minutes in the future
    const startTime = earlyTime + 1200; //20 minutes in the future
    const endTime = startTime + 5400; // 90 minutes after start
          
    const cap = 200000;
    
    const weiAmount =   1000000000000000000;
    const weiPerToken =     100000000000000; // 0.0001 Eth = $0.05
    const minAmount =    100000000000000000; // 0.1 eth = $50
    const maxAmount = 100000000000000000000; // 100 Eth = $50,000

    console.log("Token Address: " + Token.address + " earlyTime: " + earlyTime  + " startTime: " + startTime + " endTime: " + endTime + " weiPerToken: " + weiPerToken 
    + " cap: " + cap + " minAmount: " + minAmount + " maxAmount: " + minAmount + " wallet: " + accounts[7]);
  
    deployer.deploy(Presale, Token.address, earlyTime, startTime, endTime, centsPerToken, centsPerEth, cap, minAmount, maxAmount, accounts[7]).then(function () {
      console.log("PlayCashPresale deployed at " + Presale.address);
      
      //return Token.setController(Presale.address).then(function () {
      //  console.log("Controller set to " + Token.controller());
      //})
    });

    const startTokenTime = Math.round((dt.getTime())/1000) + 7200; // 2 hours in the future
    const endTokenTime = startTokenTime + 5400; // 90 minutes after start
    
    const thresholds = [0,50000,100000,150000];
    const prices = [25,35,45,50];

    const newCap = 200000;

      return deployer.deploy(TokenSale, Token.address, startTokenTime, endTokenTime, centsPerToken, centsPerEth, newCap, minAmount, maxAmount, accounts[7], thresholds, prices).then(function () { 
        console.log("PlayCashTokenSale deployed at " + TokenSale.address);

        //return Token.setController(Presale.address).then(function () {
        //  console.log("Controller set to " + Token.controller());
        //})
        
      });
      
  });
};
/*
module.exports = function(deployer, network, accounts) {};*/