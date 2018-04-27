var Token = artifacts.require("./PlayCashToken.sol");
var Presale = artifacts.require("./PlayCashPresale.sol");
var TokenSale = artifacts.require("./PlayCashTokenSale.sol");

module.exports = function (deployer, network, accounts) {
    
    console.log("account0: " + accounts[0]);
    console.log("account1: " + accounts[1]);
    
    const owner = accounts[0]; //'0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
    const wallet = '0x204afab6451928583637a16d75a34c22d3cd52ba'; // test wallet
    deployer.deploy(Token).then(function() {
        console.log("PlayCashToken deployed at " + Token.address);

        const earlyTime = 1524520800;
        const startTime = earlyTime + 604800;
        const endTime = startTime + 1209600; // 14 days after start
            
        const weiAmount = 1000000000000000000;
        const centsPerToken = 15;
        const centsPerEth = 56000; // $ 560
        const cap = 50000000;      // 50m tokens
        const minAmount =    50000; // $ 500
        const maxAmount = 50000000; // $ 500K

        var token;
        Token.deployed().then(function(dep) {
            token = dep;
            console.log("PlayCashToken: " + token.address);
            token.owner().then(function(own) {
                console.log("owner = " + own);
                token.availableSupply().then(function(avail) {
                    console.log("availableSupply = " + avail);
                });
            });
        });

        console.log("Token Address: " + Token.address + " earlyTime: " + earlyTime  + " startTime: " + startTime + " endTime: " + endTime + " centsPerToken: " + centsPerToken 
        + " centsPerEth: " + centsPerEth + " cap: " + cap + " minAmount: " + minAmount + " maxAmount: " + minAmount + " wallet: " + wallet);
        
        deployer.deploy(Presale, Token.address, earlyTime, startTime, endTime, centsPerToken, centsPerEth, cap, minAmount, maxAmount, wallet).then(function () {
            console.log("PlayCashPresale deployed at " + Presale.address);
            
            token.setController(Presale.address, {from: owner}).then(function () {
                token.controller().then(function(controlAddr) {
                    console.log("controller = " + controlAddr);
                });
            });
            
        });
    /*
        const startTokenTime = Math.round((dt.getTime())/1000) + 1800; // 30 minutes in the future
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
       */
    });
    
};