var Token = artifacts.require("./PeblikToken.sol");
var Presale = artifacts.require("./PeblikPresale.sol");

module.exports = function(deployer) {
  //deployer.deploy(Token);
  // Deploy A, then deploy B, passing in A's newly deployed address
  deployer.deploy(Token).then(function() {
    console.log("PeblikToken deployed at " + Token.address);

    var dt = new Date();
    dt.setDate(dt.getDate());
    /*
    const earlyTime = (dt.getTime())/1000; // one second in the future
    const startTime = earlyTime + 1800; // 30 minutes in the future
    const endTime = startTime + 5400; // 90 minutes after start
  */
    const earlyTime = Math.round((dt.getTime())/1000); // one second in the future
    const startTime = earlyTime + 1800; // 30 minutes in the future
    const endTime = startTime + 5400; // 90 minutes after start


    const centsPerToken = 15;
    const centsPerEth = new web3.BigNumber(100000);
    const cap = new web3.BigNumber(1000000);
    const minAmount = new web3.BigNumber(10000);
    const maxAmount = new web3.BigNumber(1000000);

    const wallet0 = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
    const wallet1 = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    //const tokenAddress = '0x345ca3e014aaf5dca488057592ee47305d9b3e10';

    console.log("Token Address: " + Token.address + " earlyTime: " + earlyTime  + " startTime: " + startTime + " endTime: " + endTime + " centsPerToken: " + centsPerToken 
    + " centsPerEth: " + centsPerEth + " cap: " + cap + " minAmount: " + minAmount + " maxAmount: " + minAmount + " wallet: " + wallet0);
   
    return deployer.deploy(Presale, Token.address, earlyTime, startTime, endTime, centsPerToken, centsPerEth, cap, minAmount, maxAmount, wallet0).then(function () {
      console.log("PeblikPresale deployed at " + Presale.address);

      //return Token.setController(Presale.address).then(function () {
      //  console.log("Controller set to " + Token.controller());
      //})
    });
  });

};
/*
var Presale = artifacts.require("./PeblikPresale.sol");
module.exports = function(deployer, network, accounts) {
  const earlyTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1; // one second in the future
  const startTime = earlyTime + 1800; // 30 minutes in the future
  const endTime = startTime + 5400; // 90 minutes after start
  const centsPerToken = 15;
  const centsPerEth = new web3.BigNumber(100000);
  const cap = new web3.BigNumber(1000000);
  const minAmount = new web3.BigNumber(10000);
  const maxAmount = new web3.BigNumber(100000);
  const wallet = accounts[0];
  const tokenAddress = "0x51942dd02be18b8feea8182fb3960ccfc0b86365";

  //address _token, uint256 _earlyTime, uint256 _startTime, uint256 _endTime, uint256 _centsPerToken, uint256 _centsPerEth, uint256 _cap, uint256 _min, uint256 _max, address _wallet
  deployer.deploy(Presale, tokenAddress, earlyTime, startTime, endTime, centsPerToken, centsPerEth, cap, minAmount, maxAmount, wallet);
};
*/