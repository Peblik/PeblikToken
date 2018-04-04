var Token = artifacts.require("./PeblikToken.sol");
var Presale = artifacts.require("./PeblikPresale.sol");
var TokenSale = artifacts.require("./PeblikTokenSale.sol");

module.exports = function(callback) {
    var token;
    Token.deployed().then(function(dep) {
        token = dep;
        console.log("PeblikToken: " + token.address);
        token.availableSupply().then(function(avail) {
            console.log("availableSupply = " + avail);
        });
    });
    
    var address1 = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";
    var owner = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
    var pmtSrc = "0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5";
    var presale;
    Presale.deployed().then(function(dep) {
        
        presale = dep;
        console.log("PeblikPresale: " + presale.address);

        //presale.changePaymentSource(pmtSrc, { from: owner }).then(function() {

        //});

        token.setController(presale.address, { from: owner }).then(function() {
            presale.addToEarlylist(address1).then(function() {
                presale.isEarlylisted(address1).then(function(success) {
                    console.log("Added to whitelist: " + address1 + " = " + success);
    
                    //const weiAmount = 1 * 1000000000000000000;
                    //presale.buyTokens({ value: weiAmount, from: address1}).then(function(success) {
                    //    console.log(JSON.stringify(success));
                    //});
                });
            });        
        });


    });
}