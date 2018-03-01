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

    it('adds to whitelist', async function(){
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

    it('correctly shows isListed', async function(){
        try {
            var isListed = await presaleContract.isListed(buyer1);
            assert.equal(isListed, true, 'isListed Failed');
            isListed = await presaleContract.isListed(buyer3);
            assert.equal(isListed, true, 'isListed Failed');
        } catch (error) {
            console.log(error);                 
        }
    });

    it('gets time', async function(){
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

    it('gets token and presale variables', async function(){
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
            var tokenAmount = await presaleContract.calcTokens.call(weiAmount);

            const totalExpected = (await tokenContract.totalSupply()).toNumber() + tokenAmount;
            const balanceExpected = (await tokenContract.balanceOf(buyer1)).toNumber() + tokenAmount;
            const pretotalExpected = (await presaleContract.totalSupply()) + tokenAmount;
            const prebalanceExpected = (await presaleContract.balanceOf(buyer1)) + tokenAmount;

            // 
            //var isMinted = await presaleContract.mintTokens.call({ from: buyer1 }).then(function(addr,amt) { console.log("addr " + addr); console.log("amt " + amt);}); 
            await presaleContract.buyTokens({ value: weiAmount, from: buyer1 }).then((result) => { 
                //console.log(result);
                //console.log(result.logs[0].event);
                //console.log(result.logs[1].event);
                //utils.assertEvent(presaleContract, { event: "Mint", logIndex: 0, args: { to: buyer1, amount: 1000000000000000000 }});
            });
            //var tx = await presaleContract.buyTokens.call({ value: weiAmount, from: buyer1 }); //.then(function(addr,amt) { console.log("addr " + addr); console.log("amt " + amt);}); 
            //console.log(isMinted);
            //assert.isOk(tx, 'Buy Tokens Failed');

            const totalSupply = await tokenContract.totalSupply();
            const balance = await tokenContract.balanceOf(buyer1);
            const pretotalSupply = await presaleContract.totalSupply();
            const prebalance = await presaleContract.balanceOf(buyer1);

            //console.log("totalExpected: " + totalExpected + " totalSupply: " + totalSupply);
            //console.log("balanceExpected: " + balanceExpected + " balance: " + balance);
            //console.log("pretotalExpected: " + pretotalExpected + " pretotalSupply: " + pretotalSupply);
            //console.log("prebalanceExpected: " + prebalanceExpected + " prebalance: " + prebalance);
            assert.equal(balance.toNumber(), balanceExpected, 'Balance did not increase correctly');
            assert.equal(totalSupply.toNumber(), totalExpected, 'Total supply did not increase correctly');          
        } catch (error) {
            console.log(error);              
        }
    });

    it("should do something that fires Mint", async function() { 
        await presaleContract.mintTokens({ from: buyer3 }).then((result) => { 
            //console.log(result);
            //console.log(result.logs[0].event);
            //console.log(result.logs[1].event);
            //utils.assertEvent(presaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: 1000000000000000000 }});
        });
    });

    it('should mint tokens and send to recipient', function(done){
        PeblikToken.deployed().then(async function(instance) {
            try {
                const tokenAmount = 20 * 1000000000000000000;
                const recipient = accounts[1]; //address(0xf17f52151EbEF6C7334FAD080c5704D77216b732);
                const totalExpected = (await tokenContract.totalSupply()).toNumber() + tokenAmount;
                const balanceExpected = (await tokenContract.balanceOf(recipient)).toNumber() + tokenAmount;
                //console.log(totalExpected);
                //console.log(balanceExpected);
                await tokenContract.mint(recipient, tokenAmount); //50e18, or 50 full tokens
                
                const totalSupply = await tokenContract.totalSupply();
                const balance = await tokenContract.balanceOf(recipient);
                //console.log(totalSupply);
                //console.log(balance);
                //console.log("totalExpected: " + totalExpected + " totalSupply: " + totalSupply);
                //console.log("balanceExpected: " + balanceExpected + " balance: " + balance);    
                assert.equal(balance.toNumber(), balanceExpected, 'Balance did not increase correctly');
                assert.equal(totalSupply.toNumber(), totalExpected, 'Total supply did not increase correctly');          
                done();
            } catch (error) {
                done(error);
            }
       });
    });
  
    it('makes external purchase', async function() {
        var isPurchased = false;
        const centsAmount = 10000;
        try {
            const source = await presaleContract.paymentSource.call();
            assert.equal(source, pmtSrc, 'makes external purchase - Payment Source Failed');
            var isListed = await presaleContract.isEarlylisted(buyer2);
            assert.equal(isListed, true, 'makes external purchase - Early listed Failed');
            var isCapReached = await presaleContract.getcapReached();
            console.log(isCapReached);
            assert.equal(isCapReached, false, 'makes external purchase - Cap Reached Failed');

            var tokenAmount = await presaleContract.calcCentsToTokens.call(centsAmount, {from: buyer2});
            console.log(tokenAmount.toNumber());
            
            var tokenValid = await presaleContract.calcCentsToTokensValidate.call(buyer2, centsAmount, {from: pmtSrc});
            console.log(tokenValid);
            assert.equal(tokenValid, true, 'makes external purchase - calcCentsToTokensValidate Failed');

            const totalExpected = (await tokenContract.totalSupply()).toNumber() + tokenAmount.toNumber();
            const balanceExpected = (await tokenContract.balanceOf(buyer2)).toNumber() + tokenAmount.toNumber();
            const pretotalExpected = (await presaleContract.totalSupply()) + tokenAmount.toNumber();
            const prebalanceExpected = (await presaleContract.balanceOf(buyer2)) + tokenAmount.toNumber();

            await presaleContract.externalPurchase(buyer2, centsAmount, {from: pmtSrc}).then((result) => { 
                console.log(result);
                //console.log(result.logs[0].event);
                //console.log(result.logs[1].event);
                //utils.assertEvent(presaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: 1000000000000000000 }});
            });

            const totalSupply = await tokenContract.totalSupply();
            const balance = await tokenContract.balanceOf(buyer2);
            const pretotalSupply = await presaleContract.totalSupply();
            const prebalance = await presaleContract.balanceOf(buyer2);

            //console.log("totalExpected: " + totalExpected + " totalSupply: " + totalSupply);
            //console.log("balanceExpected: " + balanceExpected + " balance: " + balance);
            //console.log("pretotalExpected: " + pretotalExpected + " pretotalSupply: " + pretotalSupply);
            //console.log("prebalanceExpected: " + prebalanceExpected + " prebalance: " + prebalance);
            assert.equal(balance.toNumber(), balanceExpected, 'Balance did not increase correctly');
            assert.equal(totalSupply.toNumber(), totalExpected, 'Total supply did not increase correctly');          


        } catch (error) {
            console.log(error);               
        }
    });

    it('buys after after after tokens', async function() {
        try {
            const totalSupply = await tokenContract.totalSupply();
            const balanceo1 = await tokenContract.balanceOf(owner1);
            const balanceo2 = await tokenContract.balanceOf(owner2);
            const balance1 = await tokenContract.balanceOf(buyer1);
            const balance2 = await tokenContract.balanceOf(buyer2);
            const balance3 = await tokenContract.balanceOf(buyer3);
            const balance4 = await tokenContract.balanceOf(buyer4);
            const balancepmtSrc = await tokenContract.balanceOf(pmtSrc);

            const pretotalSupply = await presaleContract.totalSupply();
            const prebalanceo1 = await presaleContract.balanceOf(owner1);
            const prebalanceo2 = await presaleContract.balanceOf(owner2);
            const prebalance1 = await presaleContract.balanceOf(buyer1);
            const prebalance2 = await presaleContract.balanceOf(buyer2);
            const prebalance3 = await presaleContract.balanceOf(buyer3);
            const prebalance4 = await presaleContract.balanceOf(buyer4);
            const prebalancepmtSrc = await presaleContract.balanceOf(pmtSrc);

            console.log(" totalSupply: " + totalSupply);
            console.log(" pretotalSupply: " + pretotalSupply);
            console.log(" balanceo1: " + balanceo1);
            console.log(" prebalanceo1: " + prebalanceo1);
            console.log(" balanceo2: " + balanceo2);        
            console.log(" prebalanceo2: " + prebalanceo2);        
            console.log(" balance1: " + balance1);        
            console.log(" prebalance1: " + prebalance1);        
            console.log(" balance2: " + balance2);        
            console.log(" prebalance2: " + prebalance2);        
            console.log(" balance3: " + balance3);        
            console.log(" prebalance3: " + prebalance3);        
            console.log(" balance4: " + balance4);        
            console.log(" prebalance4: " + prebalance4);        
            console.log(" balancepmtSrc: " + balancepmtSrc);         
            console.log(" prebalancepmtSrc: " + prebalancepmtSrc);         

        } catch (error) {
            console.log(error);              
        }
    });
   

    it('changes token price', async function(){
        const _value = 0;
        const _centsRaised = 0;
        const _tokensSold = 0;

        try {
            const currentPrice = await presaleContract.getDollarPriceExternal(_value,_centsRaised,_tokensSold,buyer1);
            const expectedPrice = currentPrice + 1;
            const validPurchase = await presaleContract.changePrice(expectedPrice);
            //console.log(validPurchase);
            const newPrice = await presaleContract.getDollarPriceExternal(_value,_centsRaised,_tokensSold,buyer1);
            assert.equal(newPrice, expectedPrice, 'Price Changed Failed');
        } catch (error) {
            console.log(error);              
        }            
    });
});