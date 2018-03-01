var Token = artifacts.require("./PeblikToken.sol");
var Presale = artifacts.require("./PeblikPresale.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Token).then(function() {
    console.log("PeblikToken deployed at " + Token.address);

    var dt = new Date();
    dt.setDate(dt.getDate());

    const earlyTime = Math.round((dt.getTime())/1000); // one second in the future
    //const startTime = earlyTime + 1800; // 30 minutes in the future
    const startTime = earlyTime + 10; // 8 seconds in the future
    const endTime = startTime + 5400; // 90 minutes after start
        
    const centsPerToken = 15;
    const centsPerEth = new web3.BigNumber(90000);
    const weiAmount = 1 * 1000000000000000000;
    const cap = new web3.BigNumber(20000 * weiAmount);
    const minAmount = new web3.BigNumber(10000);
    const maxAmount = new web3.BigNumber(1000000);

    console.log("Token Address: " + Token.address + " earlyTime: " + earlyTime  + " startTime: " + startTime + " endTime: " + endTime + " centsPerToken: " + centsPerToken 
    + " centsPerEth: " + centsPerEth + " cap: " + cap + " minAmount: " + minAmount + " maxAmount: " + minAmount + " wallet: " + accounts[7]);
   
    return deployer.deploy(Presale, Token.address, earlyTime, startTime, endTime, centsPerToken, centsPerEth, cap, minAmount, maxAmount, accounts[7]).then(function () {
      console.log("PeblikPresale deployed at " + Presale.address);

      //return Token.setController(Presale.address).then(function () {
      //  console.log("Controller set to " + Token.controller());
      //})
    });
  });

};