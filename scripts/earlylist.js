var Token = artifacts.require("./PeblikToken.sol");
var Presale = artifacts.require("./PeblikPresale.sol");
var TokenSale = artifacts.require("./PeblikTokenSale.sol");

module.exports = function(callback) {
    const tokenAddr = "0x6e2416ae86235b9fcbcb78580ddf3d4602172d4f";
    const presaleAddr = "0x03876e31439274dcf85937cff1f734fd32a71e81";
    const owner = "0xe64A4a8B4d6a19C71e3D18E0C3C7e20D9E8C86Aa";

    var addresses = [
        "0x3e94590cbC02A37B95fa2bcB1F0CdECDaE431E9d", // Steve
        "0xEef705Add9dD511b2344e3b632F3EDc21d26431b", // Matt
        "0xad9428059e4086C23f1A602a2048dB834FafF294", // Kevin
        "0xe320cB37C45A29e04e4936F437977f02eDFEF22c", // Todd
        "0x9d326F1fE1046C451e07578e32f4ce48e83f3C72", // Jag
        "0x2F19AA5a1617E568c0305e59826246A4f0453e98", // Rob Test1
        "0xfb79188d08fAe4C816652fB66484f68B029F4805", // Rob Test2
        "0xd7e5CbaEDF81ec67FE0124eeF17B38097Fe84023" // Eric
    ];

    var presale;
    var promises = [];

    Presale.at(presaleAddr).then(function(instance) {
        presale = instance;
        console.log("PeblikPresale: " + presale.address);

        const addToList = (addr) => {
            console.log("addr: " + addr);
            return presale.addToEarlylist(addr).then(function() { //, {from: owner}
                presale.isEarlylisted(addr).then(function(success) {
                    console.log("Added: " + addr + " = " + success);
                });
            });
        };

        addresses.forEach(element => {
            promises.push(addToList(element));
        });

        Promise.all(promises).then(function() {
            console.log("Complete.");
        });

        var token;
        Token.at(tokenAddr).then(function(instance) {
            token = instance;
            console.log("PeblikToken: " + token.address);
            token.availableSupply().then(function(avail) {
                console.log("availableSupply = " + avail);

                token.setController(presale.address).then(function(success) {
                    token.controller().then(function(addr) {
                        console.log("Set controller: " + addr);
                    });
                });
            });
        });
    });
}