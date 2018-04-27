var Token = artifacts.require("./PeblikToken.sol");
var Presale = artifacts.require("./PeblikPresale.sol");
var TokenSale = artifacts.require("./PeblikTokenSale.sol");

module.exports = function (callback) {

    const pmtSrc = "0x23F8cB20eFb5410a37A121218cB2c3d0dF3d026A";

    const presaleAddr = "0xb855bb50138da46b73005b79cc3b4dcf5867aea3";
    var presale;

    Presale.at(presaleAddr).then(function(instance) {
        
        presale = instance;
        console.log("PeblikPresale: " + presale.address);
        
        presale.changePaymentSource(pmtSrc).then(function() {
            presale.paymentSource().then(function(addr) {
                console.log("Changed paymentSource: " + addr);
            });
        });
    });
}