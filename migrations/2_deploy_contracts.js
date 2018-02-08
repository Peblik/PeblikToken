var Token = artifacts.require("./PeblikToken.sol");
module.exports = function(deployer) {
  deployer.deploy(Token);
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