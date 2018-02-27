var Token = artifacts.require("./PeblikToken.sol");
var Presale = artifacts.require("./PeblikPresale.sol");
//var BaseTokenSale = artifacts.require("./BaseTokenSale.sol");

module.exports = function(deployer) {
  //deployer.deploy(Token);
  // Deploy A, then deploy B, passing in A's newly deployed address
  deployer.deploy(Token).then(function() {
    //console.log("Token Address: " + tokenAddress);
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
    const maxAmount = new web3.BigNumber(100000);

    //const wallet = 0xceae3fcf42f45f487ead642a00812f27e4d9334a;
    //const tokenAddress = 0x7fd22367c432aa6fd7896c6d47e6da18d3b78e38;

    const wallet = 0xf17f52151EbEF6C7334FAD080c5704D77216b732;
    const tokenAddress = 0x345ca3e014aaf5dca488057592ee47305d9b3e10;

    console.log("dt: " + dt + " Token Address: " + tokenAddress + " earlyTime: " + earlyTime  + " startTime: " + startTime + " endTime: " + endTime + " centsPerToken: " + centsPerToken 
    + " centsPerEth: " + centsPerEth + " cap: " + cap + " minAmount: " + minAmount + " maxAmount: " + minAmount + " wallet: " + wallet);
    //address _token, uint256 _startTime, uint256 _endTime, uint256 _centsPerToken, uint256 _centsPerEth, uint256 _cap, uint256 _min, uint256 _max, address _wallet
    //deployer.deploy(BaseTokenSale, tokenAddress, startTime, endTime, centsPerToken, centsPerEth, cap, minAmount, maxAmount, wallet);
    //address _token, uint256 _earlyTime, uint256 _startTime, uint256 _endTime, uint256 _centsPerToken, uint256 _centsPerEth, uint256 _cap, uint256 _min, uint256 _max, address _wallet
    return deployer.deploy(Presale, Token.address, earlyTime, startTime, endTime, centsPerToken, centsPerEth, cap, minAmount, maxAmount, wallet).then(function () { console.log("PreSale deployed"); });
    //deployer.deploy(Presale, 0x345ca3e014aaf5dca488057592ee47305d9b3e10, 1519426071, 1519427871, 1519433271, 15, 100000, 1000000, 10000, 100000, 0xf17f52151EbEF6C7334FAD080c5704D77216b732);
    
    //console.log("PreSale deployed");
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