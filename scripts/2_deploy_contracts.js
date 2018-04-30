var Token = artifacts.require("./PlayCashToken.sol");
var Presale = artifacts.require("./PlayCashPresale.sol");
var TokenSale = artifacts.require("./PlayCashTokenSale.sol");

module.exports = function (deployer, network, accounts) {
    const tokenAddr = "0x6e2416ae86235b9fcbcb78580ddf3d4602172d4f";
    const owner = accounts[0]; //'0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
    const wallet = '0x204afab6451928583637a16d75a34c22d3cd52ba'; // test multi-sig wallet
    
    const earlyTime = 1524155400;
    const startTime = earlyTime + 86400; // 24 hours in the future
    const endTime = startTime + 345600; // 4 days after start

    console.log("earlyTime: " + earlyTime + " = " + new Date(earlyTime * 1000).toLocaleString());
    console.log("startTime: " + startTime + " = " + new Date(startTime * 1000).toLocaleString());
    console.log("endTime: " + endTime + " = " + new Date(endTime * 1000).toLocaleString());
        
    const weiAmount = 1000000000000000000;
    const centsPerToken = 15;
    const centsPerEth = 50000; // $500
    const cap = 1000000; // 1m tokens
    const minAmount =   1000; // $   10
    const maxAmount = 200000; // $2,000

    console.log("Token Address: " + tokenAddr + " earlyTime: " + earlyTime  + " startTime: " + startTime + " endTime: " + endTime + " centsPerToken: " + centsPerToken 
    + " centsPerEth: " + centsPerEth + " cap: " + cap + " minAmount: " + minAmount + " maxAmount: " + maxAmount + " wallet: " + wallet);

    deployer.deploy(Presale, tokenAddr, earlyTime, startTime, endTime, centsPerToken, centsPerEth, cap, minAmount, maxAmount, wallet).then(function () {
        console.log("PlayCashPresale deployed at " + Presale.address);
        
        var token;
        Token.at(tokenAddr).then(function(instance) {
            token = instance;
            console.log("PlayCashToken: " + token.address);
            token.availableSupply().then(function(avail) {
                console.log("availableSupply = " + avail);
            });

            token.setController(Presale.address, { from: owner }).then(function () {
                token.controller().then(function (controlAddr) {
                    console.log("controller = " + controlAddr);
                });
            });
        });
        
    }).catch(function(err) {
        console.log(err.message);
    });
};