var Token = artifacts.require("./PeblikToken.sol");
var Presale = artifacts.require("./PeblikPresale.sol");
var TokenSale = artifacts.require("./PeblikTokenSale.sol");

module.exports = function(deployer, network, accounts) {
    const owner = accounts[0]; //'0x627306090abaB3A6e1400e9345bC60c78a8BEf57';

    deployer.deploy(Token).then(function() {
        console.log("PeblikToken deployed at " + Token.address);

        var dt = new Date();
        dt.setDate(dt.getDate());

        const earlyTime = Math.round((dt.getTime())/1000); // one second in the future
        //const startTime = earlyTime + 1800; // 30 minutes in the future
        const startTime = earlyTime + 86400; // 1 day in the future
        const endTime = startTime + 172800; // 2 days after start
            
        const centsPerToken = 15;
        const centsPerEth = 40000; // $400
        const weiAmount = 1000000000000000000;
        const cap = 500000; // 500K tokens
        const minAmount =   1000; // $   10
        const maxAmount = 500000; // $5,000

        console.log("Token Address: " + Token.address + " earlyTime: " + earlyTime  + " startTime: " + startTime + " endTime: " + endTime + " centsPerToken: " + centsPerToken 
        + " centsPerEth: " + centsPerEth + " cap: " + cap + " minAmount: " + minAmount + " maxAmount: " + minAmount + " wallet: " + accounts[7]);
        
        deployer.deploy(Presale, Token.address, earlyTime, startTime, endTime, centsPerToken, centsPerEth, cap, minAmount, maxAmount, accounts[7]).then(function () {
            console.log("PeblikPresale deployed at " + Presale.address);
            
            //return Token.setController(Presale.address, {from: owner}).then(function () {
                //console.log("Controller set to " + Token.controller());
            //})
        });
    /*
        const startTokenTime = Math.round((dt.getTime())/1000) + 1800; // 30 minutes in the future
        const endTokenTime = startTokenTime + 5400; // 90 minutes after start
        
        const thresholds = [0,50000,100000,150000];
        const prices = [25,35,45,50];

        const newCap = 200000;

        return deployer.deploy(TokenSale, Token.address, startTokenTime, endTokenTime, centsPerToken, centsPerEth, newCap, minAmount, maxAmount, accounts[7], thresholds, prices).then(function () { 
            console.log("PeblikTokenSale deployed at " + TokenSale.address);

            //return Token.setController(Presale.address).then(function () {
            //  console.log("Controller set to " + Token.controller());
            //})
            
        });
    */    
    });
};
/*
module.exports = function(deployer, network, accounts) {};*/