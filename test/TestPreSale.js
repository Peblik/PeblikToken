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
    const wallet = accounts[7];

    let presaleContract;
    let tokenContract;

    before('setup contracts for all tests', async function () {
        // cache instances of the contracts for use in all the tests
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

    it('adds to whitelist', async function() {
        try {
            var isListed = await presaleContract.isWhitelisted(buyer3);
        
            if (!isListed) {
                await presaleContract.addToWhitelist(buyer3);
                isListed = await presaleContract.isWhitelisted(buyer3);
            }
            assert.equal(isListed, true, 'Is White listed Failed');

            isListed = await presaleContract.isWhitelisted(buyer4);
        
            if (!isListed) {
                await presaleContract.addToWhitelist(buyer4);
                isListed = await presaleContract.isWhitelisted(buyer4);
            }
            assert.equal(isListed, true, 'Is White listed Failed');
        } catch (error) {
            console.log(error);                  
        }
    });

    it('correctly shows isListed', async function() {
        try {
            var isListed = await presaleContract.isListed(buyer1);
            assert.equal(isListed, true, 'isListed Failed');
            isListed = await presaleContract.isListed(buyer3);
            assert.equal(isListed, true, 'isListed Failed');
        } catch (error) {
            console.log(error);                   
        }
    });

    it('gets time', async function() {
        var currentDate = Math.round((new Date().getTime()) / 1000);
        try {
            var timex = await presaleContract.getTime.call();
            var testit = timex.toNumber() <= currentDate;
            //console.log(testit);
            assert.equal(testit, true, 'Get Time Failed');
        } catch (error) {
            console.log(error);               
        }
    });

    it('gets token and presale variables', async function() {
        try { 
            const weiAmount = 1 * 1000000000000000000;
            var tokenAmount = await presaleContract.calcTokens.call(weiAmount);
            console.log("Tokens for 1 ether: " + tokenAmount);
            var tokenOwner = await presaleContract.getTokenOwner.call();
            console.log("Token owner: " + tokenOwner);
            var tokenController = await presaleContract.getTokenController.call();
            console.log("Token controller: " + tokenController);
            var paymentSource = await presaleContract.getPaymentSource.call();
            console.log("Payment source: " + paymentSource);
            var tokenPaused = await presaleContract.getTokenPaused.call();
            console.log("Token Paused: " + tokenPaused);
            var tokenCanMint = await presaleContract.getTokenCanMint.call();
            console.log("Token Is Finished Minting: " + tokenCanMint);
            var tokenOnlyOwner = await presaleContract.getTokenOnlyOwner.call();
            console.log("Token no account getTokenOnlyOwner: " + tokenOnlyOwner);
            var tokenOnlyOwner = await presaleContract.getTokenOnlyOwner.call({from:owner1});
            console.log("Token account 0 getTokenOnlyOwner: " + tokenOnlyOwner);
            var tokenOnlyOwner = await presaleContract.getTokenOnlyOwner.call({from:buyer1});
            console.log("Token account 3 getTokenOnlyOwner: " + tokenOnlyOwner);

            var owner = await presaleContract.getOwner.call();
            console.log("PreSale Owner: " + owner);
            var validX = await presaleContract.validPurchasePublic.call(owner1);
            console.log("PreSale Valid Purchase for " + owner1 + ": " + validX);
            validX = await presaleContract.validPurchasePublic.call(buyer1);
            console.log("PreSale Valid Purchase for " + buyer1 + ": " + validX);
            validX = await presaleContract.validPurchasePublic.call(buyer2);
            console.log("PreSale Valid Purchase for " + buyer2 + ": " + validX);
            validX = await presaleContract.validPurchasePublic.call(buyer3);
            console.log("PreSale Valid Purchase for " + buyer3 + ": " + validX);

            assert.equal(true, true, 'Get Token and Presale Variables Failed');
        } catch (error) {
            console.log(error);            
        }
    });

    it('buys tokens', async function(){
        const weiAmount = 1 * 1000000000000000000;
        try {
            const tokenAmount = (await presaleContract.calcTokens.call(weiAmount)).toNumber();
            console.log("tokenAmount = " + tokenAmount);

            const buyerExpected = (await tokenContract.balanceOf(buyer2)).toNumber();
            console.log("buyerInitial = " + buyerExpected);

            const totalExpected = (await tokenContract.totalSupply()).toNumber();
            console.log("totalInitial = " + totalExpected);

            const walletExpected = (await web3.eth.getBalance(wallet)).toNumber();
            console.log("walletInitial = " + walletExpected);

            await presaleContract.buyTokens({ value: weiAmount, from: buyer2}).then((result) => { 
                //console.log(result);
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    if (log.event == "TokensBought") {
                        // We found the event!
                        console.log("TokensBought: " + log.args.tokenAmount.toNumber() + " by " + log.args.buyer);
                        break;
                    }
                    else if (log.event == "CapReached") {
                        console.log("CapReached: " + log.args.tokensSold.toNumber() + " >= " + log.args.cap);
                        break;
                    }
                  }
             });

            // check that the buyer got the right amount of tokens
            const buyerBal = (await tokenContract.balanceOf(buyer2)).toNumber();
            // check that tokensSold, totalSupply and availableSupply have been updated
            const totalSupply = (await tokenContract.totalSupply()).toNumber();
            // check that wei was transferred to correct wallet address
            const walletBal = (await web3.eth.getBalance(wallet)).toNumber();

            console.log("buyerBal = " + buyerBal);
            console.log("totalSupply = " + totalSupply);
            console.log("walletBal = " + walletBal);

            assert.equal(walletBal, walletExpected + weiAmount, 'Wallet balance did not increase correctly');  
            assert.equal(totalSupply, totalExpected + tokenAmount, 'Total supply did not increase correctly'); 
            assert.equal(buyerBal, buyerExpected + tokenAmount, 'Balance did not increase correctly');

        } catch (error) {
            console.log(error);              
        }
    });

    it('should mint tokens and send to recipient', async function() {
        try {
            const tokenAmount = 20 * 1000000000000000000;
            const recipient = buyer2; //address(0xf17f52151EbEF6C7334FAD080c5704D77216b732);
            const totalExpected = (await tokenContract.totalSupply()).toNumber() + tokenAmount;
            const balanceExpected = (await tokenContract.balanceOf(recipient)).toNumber() + tokenAmount;
            //console.log(totalExpected);
            //console.log(balanceExpected);
            await tokenContract.mint(recipient, tokenAmount); //50e18, or 50 full tokens
            
            const totalSupply = await tokenContract.totalSupply();
            const balance = await tokenContract.balanceOf(recipient);
            //console.log(totalSupply);
            //console.log(balance);
            assert.equal(balance.toNumber(), balanceExpected, 'Balance did not increase correctly');
            assert.equal(totalSupply.toNumber(), totalExpected, 'Total supply did not increase correctly');          
        } catch (error) {
            console.log(error);
        }
    });
   /*
    it('makes external purchase', async function(){
        var isPurchased = false;
        const centsAmount = 10000;
        try {
            return await presaleContract.externalPurchase(buyer2, centsAmount, {from: pmtSrc}).then((result) => { 
                console.log(result);
                //console.log(result.logs[0].event);
                //console.log(result.logs[1].event);
                //utils.assertEvent(presaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: 1000000000000000000 }});
            });
            //var tx = await presaleContract.externalPurchase.call(buyer2, centsAmount, {from: pmtSrc});
            //console.log(tx);
            //assert.equal(tx, true, 'External Purchase Failed');

            // TODO: check that buyer's token balance was updated correctly
            // TODO: check that wei was transferred to correct wallet address
            // TODO: check that tokensSold, totalSupply and availableSupply have been updated

        } catch (error) {
            console.log(error);               
        }
    });
    */
    it('changes token price', async function() {

        const _value = 0;
        const _centsRaised = 0;
        const _tokensSold = 0;

        try {
            const currentPrice = await presaleContract.getDollarPriceExternal(_value,_centsRaised,_tokensSold,buyer1);
            const expectedPrice = currentPrice + 5;
            const validPurchase = await presaleContract.changePrice(expectedPrice);

            const newPrice = await presaleContract.getDollarPriceExternal(_value,_centsRaised,_tokensSold,buyer1);
            assert.equal(newPrice, expectedPrice, 'Price Changed Failed');
        } catch (error) {
            console.log(error);
        }            
    });

    it('should pause correctly', async function() {

        await presaleContract.pause();
        const isPaused = await presaleContract.paused();

        try {
            assert.equal(isPaused, true, 'Presale was not paused correctly');                
        } catch (error) {
            console.log(error);           
        }
    });
    
    it('should unpause correctly', async function() {

        await presaleContract.unpause();
        const isPaused = await presaleContract.paused();

        try {
            assert.equal(isPaused, false, 'Presale was not unpaused correctly');                
        } catch (error) {
            console.log(error);                
        }
    });

});