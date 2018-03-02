var Token = artifacts.require("./PeblikToken.sol");
var Presale = artifacts.require("./PeblikPresale.sol");
var TokenSale = artifacts.require("./PeblikTokenSale.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Token).then(function() {
      console.log("PeblikToken deployed at " + Token.address);

      var dt = new Date();
      dt.setDate(dt.getDate());

      const earlyTime = Math.round((dt.getTime())/1000); // one second in the future
      //const startTime = earlyTime + 1800; // 30 minutes in the future
      const startTime = earlyTime + 10; // 10 seconds in the future
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

      //const thresholds = [new web3.BigNumber(0),new web3.BigNumber(50000),new web3.BigNumber(100000),new web3.BigNumber(150000)];
      //const prices = [new web3.BigNumber(25),new web3.BigNumber(35),new web3.BigNumber(45),new web3.BigNumber(50)];

      const thresholds = [0,50000,100000,150000];
      const prices = [25,35,45,50];

      //PeblikTokenSale(address _token, uint256 _startTime, uint256 _endTime, uint256 _centsPerToken, uint256 _centsPerEth, uint256 _cap, uint256 _min, uint256 _max, address _wallet, uint256[] _thresholds, uint256[] _prices)
      return deployer.deploy(TokenSale, Token.address, startTime, endTime, centsPerToken, centsPerEth, cap, minAmount, maxAmount, accounts[7], thresholds, prices).then(function () { 
        console.log("PeblikTokenSale deployed at " + TokenSale.address);

        //return Token.setController(Presale.address).then(function () {
        //  console.log("Controller set to " + Token.controller());
        //})
      });
    });
  });
};