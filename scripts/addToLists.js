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
    var presale;
    Presale.deployed().then(function(dep) {
        
        presale = dep;
        console.log("PeblikPresale: " + presale.address);

        presale.addToEarlylist(address1).then(function() {
            presale.isEarlylisted(address1).then(function(success) {
                console.log("Added to whitelist: " + address1 + " = " + success);
            });
        });
            
    });
}