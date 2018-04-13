var Token = artifacts.require("./PeblikToken.sol");
var Presale = artifacts.require("./PeblikPresale.sol");
var TokenSale = artifacts.require("./PeblikTokenSale.sol");

module.exports = function (callback) {

    const tokenAddr = "0x6e2416ae86235b9fcbcb78580ddf3d4602172d4f";
    var token;

    Token.at(tokenAddr).then(function(instance) {
        token = instance;
        console.log("PeblikToken: " + token.address);
        token.availableSupply().then(function(avail) {
            console.log("availableSupply = " + avail);
        });
    });
    
    const address1 = "0x9d326F1fE1046C451e07578e32f4ce48e83f3C72"; // jag2
    const owner = "0xe64a4a8b4d6a19c71e3d18e0c3c7e20d9e8c86aa";
    const pmtSrc = "0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5";

    const presaleAddr = "0x305a236ffd0968be8ccf4cd3fac8bf79761a9ff1";
    var presale;

    Presale.at(presaleAddr).then(function(instance) {
        
        presale = instance;
        console.log("PeblikPresale: " + presale.address);
        /*
        token.setController(presale.address).then(function(success) {
            token.controller().then(function(addr) {
                console.log("Set controller: " + addr);
            });
        });
        */
        presale.addToWhitelist(address1).then(function() {
            presale.isWhitelisted(address1).then(function(success) {
                console.log("Added to whitelist: " + address1 + " = " + success);

                //const weiAmount = 1 * 1000000000000000000;
                //presale.buyTokens({ value: weiAmount, from: address1}).then(function(success) {
                //    console.log(JSON.stringify(success));
                //});
            });
        });

    });
}