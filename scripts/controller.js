var Token = artifacts.require("./PeblikToken.sol");
var Presale = artifacts.require("./PeblikPresale.sol");
var TokenSale = artifacts.require("./PeblikTokenSale.sol");

module.exports = function (callback) {

    //const controller = "0x23F8cB20eFb5410a37A121218cB2c3d0dF3d026A";
    const presaleAddr = "0x37845e77645d393ac9a375dfc58c7bf885478a8f";
    const tokenAddr = "0x57dae64f612f50d10381476faafd625fb3552652";
    var token;

    Token.at(tokenAddr).then(function(instance) {
        
        token = instance;
        console.log("Token: " + token.address);

        token.setController(presaleAddr).then(function(success) {
            token.controller().then(function(addr) {
                console.log("Set controller: " + addr);

                token.owner().then(function (owner) {
                    console.log("Owner: " + owner);
                });
            });
        });
    });
}