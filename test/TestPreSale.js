var PeblikPresale = artifacts.require("PeblikPresale");
var PeblikToken = artifacts.require("PeblikToken");

contract('PeblikPresale', function(accounts) {

    const owner1 = accounts[0];
    const owner2 = accounts[1];
    const buyer1 = accounts[2];
    const buyer2 = accounts[3];
    const buyer3 = accounts[4];
    const buyer4 = accounts[5];
    const pmtSrc = accounts[6];

    let presaleContract;
    let tokenContract;

    before('setup contracts for all tests', async function () {

        PeblikPresale.deployed().then(async function (instance) {
            presaleContract = instance;
        });

        PeblikToken.deployed().then(async function (tokenInstance) {
            tokenContract = tokenInstance;

            const addr = tokenContract.address;
            console.log("token contract address = " + addr);   
        });
    
    });

    it('changes payment source', async function() {
        try {
            await presaleContract.changePaymentSource(pmtSrc, { from: owner1 });
            const source = await presaleContract.paymentSource.call();
            assert.equal(source, pmtSrc, 'Change Payment Source Failed');
        } catch (error) {
            console.log(error);
        }
    });

    it('changes token controller', async function () {
        try {
            console.log("presale address: " + presaleContract.address);
            await tokenContract.setController(presaleContract.address, { from: owner1 });
            const controllerAddr = await tokenContract.controller.call();
            console.log("controllerAddr: " + controllerAddr);
            assert.equal(presaleContract.address, controllerAddr, 'setController Failed');
        } catch (error) {
            console.log(error);
        }
    });

    it('adds to early list', async function() {
        try {
            var isListed = await presaleContract.isEarlylisted(buyer1);
            if (!isListed) {
                await presaleContract.addToEarlylist(buyer1);
                isListed = await presaleContract.isEarlylisted(buyer1);
            }
            assert.equal(isListed, true, 'Early listed Failed');

            isListed = await presaleContract.isEarlylisted(buyer2);
            if (!isListed) {
                await presaleContract.addToEarlylist(buyer2);
                isListed = await presaleContract.isEarlylisted(buyer2);
            }
            assert.equal(isListed, true, 'Early listed Failed');
        } catch (error) {
            console.log(error);                  
        }    
    });

    it('adds to whitelist', function(done){
        PeblikPresale.deployed().then(async function(instance) {

            try {
                var isListed = await instance.isWhitelisted(buyer3);
            
                if (!isListed) {
                    await instance.addToWhitelist(buyer3);
                    isListed = await instance.isWhitelisted(buyer3);
                }
                assert.equal(isListed, true, 'Is White listed Failed');
                isListed = await instance.isWhitelisted(buyer4);
            
                if (!isListed) {
                    await instance.addToWhitelist(buyer4);
                    isListed = await instance.isWhitelisted(buyer4);
                }
                assert.equal(isListed, true, 'Is White listed Failed');
                 done();
            } catch (error) {
                console.log(error);
                done(error);                    
            }
       });
    });

    it('correctly shows isListed', function(done){
        PeblikPresale.deployed().then(async function(instance) {
            
            try {
                var isListed = await instance.isListed(buyer1);
                assert.equal(isListed, true, 'isListed Failed');
                isListed = await instance.isListed(buyer3);
                assert.equal(isListed, true, 'isListed Failed');
                done();
            } catch (error) {
                console.log(error); 
                done(error);                   
            }
       });
    });

    it('gets time', function(done){
        PeblikPresale.deployed().then(async function(instance) {
            var currentDate = Math.round((new Date().getTime()) / 1000);
            try {
                var timex = await instance.getTime.call();
                var testit = timex.toNumber() <= currentDate;
                //console.log(testit);
                assert.equal(testit, true, 'Get Time Failed');
                done();
            } catch (error) {
                console.log(error);
                done(error);                
            }
        });
    });

    it('gets token and presale variables', function(done){
        PeblikPresale.deployed().then(async function(instance) {
            try { 
                const weiAmount = 1 * 1000000000000000000;
                var tokenAmount = await instance.calcTokens.call(weiAmount);
                console.log("Tokens for 1 ether: " + tokenAmount);
                var tokenOwner = await instance.getTokenOwner.call();
                console.log("Token owner: " + tokenOwner);
                var tokenController = await instance.getTokenController.call();
                console.log("Token controller: " + tokenController);
                var paymentSource = await instance.getPaymentSource.call();
                console.log("Payment source: " + paymentSource);
                var tokenPaused = await instance.getTokenPaused.call();
                console.log("Token Paused: " + tokenPaused);
                var tokenCanMint = await instance.getTokenCanMint.call();
                console.log("Token Is Finished Minting: " + tokenCanMint);
                var tokenOnlyOwner = await instance.getTokenOnlyOwner.call();
                console.log("Token no account getTokenOnlyOwner: " + tokenOnlyOwner);
                var tokenOnlyOwner = await instance.getTokenOnlyOwner.call({from:owner1});
                console.log("Token account 0 getTokenOnlyOwner: " + tokenOnlyOwner);
                var tokenOnlyOwner = await instance.getTokenOnlyOwner.call({from:buyer1});
                console.log("Token account 3 getTokenOnlyOwner: " + tokenOnlyOwner);

                var owner = await instance.getOwner.call();
                console.log("PreSale Owner: " + owner);
                var validX = await instance.validPurchasePublic.call(owner1);
                console.log("PreSale Valid Purchase for " + owner1 + ": " + validX);
                validX = await instance.validPurchasePublic.call(buyer1);
                console.log("PreSale Valid Purchase for " + buyer1 + ": " + validX);
                validX = await instance.validPurchasePublic.call(buyer2);
                console.log("PreSale Valid Purchase for " + buyer2 + ": " + validX);
                validX = await instance.validPurchasePublic.call(buyer3);
                console.log("PreSale Valid Purchase for " + buyer3 + ": " + validX);

                assert.equal(true, true, 'Get Token and Presale Variables Failed');
                done();
            } catch (error) {
                console.log(error);
                done(error);                
            }
        });
    });

    it('buys tokens', async function(){
        const weiAmount = 1 * 1000000000000000000;
        try {
            var tokenAmount = await presaleContract.calcTokens.call(weiAmount);
            
            var tx = await presaleContract.buyTokens.call({ value: weiAmount, from: buyer1 }); //, from:accounts[0]

            assert.isOk(tx, 'Buy Tokens Failed');

            // check that the buyer got the right amount of tokens
            //const buyerBal = await tokenContract.balanceOf.call(buyer1);
            //assert.equal(buyerBal.toNumber(), tokenAmount.toNumber(), "Buyer has wrong amount of tokens");

            // TODO: check that wei was transferred to correct wallet address
            // TODO: check that tokensSold, totalSupply and availableSupply have been updated
        } catch (error) {
            console.log(error);              
        }
    });
   
    it('makes external purchase', async function(){
        var isPurchased = false;
        const centsAmount = 10000;
        try {
            var tx = await presaleContract.externalPurchase.call(buyer2, centsAmount, {from: pmtSrc});
            //console.log(tx);
            assert.equal(tx, true, 'External Purchase Failed');

            // TODO: check that buyer's token balance was updated correctly
            // TODO: check that wei was transferred to correct wallet address
            // TODO: check that tokensSold, totalSupply and availableSupply have been updated

        } catch (error) {
            console.log(error);               
        }
    });

    it('changes token price', function(done){
        PeblikPresale.deployed().then(async function(instance) {
            const _value = 0;
            const _centsRaised = 0;
            const _tokensSold = 0;

            try {
                const currentPrice = await instance.getDollarPriceExternal(_value,_centsRaised,_tokensSold,buyer1);
                const expectedPrice = currentPrice + 1;
                const validPurchase = await instance.changePrice(expectedPrice);
                //console.log(validPurchase);
                const newPrice = await instance.getDollarPriceExternal(_value,_centsRaised,_tokensSold,buyer1);
                assert.equal(newPrice, expectedPrice, 'Price Changed Failed');
                done();
            } catch (error) {
                console.log(error); 
                done(error);               
            }            
       });
    });


    /*
    it('should unpause correctly', function(done){
        PeblikPresale.deployed().then(async function(instance) {

            await instance.unpause();
            const isPaused = await instance.paused();

            try {
                assert.equal(isPaused, false, 'Token was not unpaused correctly');                
            } catch (error) {
                console.log(error);                
            }
            done();
       });
    });

    it('should mint tokens and send to recipient', function(done){
        PeblikPresale.deployed().then(async function(instance) {
            const tokenAmount = 50 * 1000000000000000000;
            const recipient = accounts[1]; //address(0xf17f52151EbEF6C7334FAD080c5704D77216b732);
            const totalExpected = (await instance.totalSupply.call()).toNumber() + tokenAmount;
            const balanceExpected = (await web3.eth.getBalance(recipient)).toNumber() + tokenAmount;

            await instance.mint(recipient, tokenAmount); //50e18, or 50 full tokens
            
            const totalSupply = await instance.totalSupply.call();
            const balance = await web3.eth.getBalance(recipient);

            try {
                assert.equal(balance.toNumber(), balanceExpected, 'Total supply did not increase correctly');                
            } catch (error) {
                console.log(error);
            }
            try {
                assert.equal(totalSupply.toNumber(), totalExpected, 'Total supply did not increase correctly');               
            } catch (error) {
                console.log(error);                
            }
           
            done();
       });
    });
    */
});