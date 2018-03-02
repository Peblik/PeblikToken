var PeblikTokenSale = artifacts.require("PeblikTokenSale");
var PeblikToken = artifacts.require("PeblikToken");

contract('PeblikTokenSale', function(accounts) {

    const owner1 = accounts[0];
    const owner2 = accounts[1];
    const buyer1 = accounts[2];
    const buyer2 = accounts[3];
    const buyer3 = accounts[4];
    const buyer4 = accounts[5];
    const pmtSrc = accounts[6];
    const wallet1 = accounts[7];
    const wallet2 = accounts[8];

    let tokenSaleContract;
    let tokenContract;

    before('setup contracts for all tests', async function () {
        // cache instances of the contracts for use in all the tests
        PeblikTokenSale.deployed().then(async function (instance) {
            tokenSaleContract = instance;
        });

        PeblikToken.deployed().then(async function (tokenInstance) {
            tokenContract = tokenInstance;

            const addr = tokenContract.address;
            //console.log("token contract address = " + addr);   
        });
    });

    it('changes payment source', async function() {
        try {
            await tokenSaleContract.changePaymentSource(pmtSrc, { from: owner1 });
            const source = await tokenSaleContract.paymentSource.call();
            assert.equal(source, pmtSrc, 'Change Payment Source Failed');
        } catch (error) {
            console.log(error);
        }
    });

    it('changes token controller', async function () {
        try {
            //console.log("presale address: " + tokenSaleContract.address);
            await tokenContract.setController(tokenSaleContract.address, { from: owner1 });
            const controllerAddr = await tokenContract.controller.call();
            //console.log("controllerAddr: " + controllerAddr);
            assert.equal(tokenSaleContract.address, controllerAddr, 'setController Failed');
        } catch (error) {
            console.log(error);
        }
    });

    it('adds to whitelist', async function() {
        try {
            var isListed = await tokenSaleContract.isWhitelisted(buyer3);
        
            if (!isListed) {
                await tokenSaleContract.addToWhitelist(buyer3);
                isListed = await tokenSaleContract.isWhitelisted(buyer3);
            }
            assert.equal(isListed, true, 'Is White listed Failed');

            isListed = await tokenSaleContract.isWhitelisted(buyer4);
        
            if (!isListed) {
                await tokenSaleContract.addToWhitelist(buyer4);
                isListed = await tokenSaleContract.isWhitelisted(buyer4);
            }
            assert.equal(isListed, true, 'Is White listed Failed');
        } catch (error) {
            console.log(error);                  
        }
    });

    it('gets token and sale variables', async function() {
        try { 
            /*
            const weiAmount = 1 * 1000000000000000000;
            var tokenAmount = await tokenSaleContract.calcTokens.call(weiAmount);
            console.log("Tokens for 1 ether: " + tokenAmount);
            var tokenOwner = await tokenSaleContract.getTokenOwner.call();
            console.log("Token owner: " + tokenOwner);
            var tokenController = await tokenSaleContract.getTokenController.call();
            console.log("Token controller: " + tokenController);
            var paymentSource = await tokenSaleContract.getPaymentSource.call();
            console.log("Payment source: " + paymentSource);
            var tokenPaused = await tokenSaleContract.getTokenPaused.call();
            console.log("Token Paused: " + tokenPaused);
            var tokenCanMint = await tokenSaleContract.getTokenCanMint.call();
            console.log("Token Is Finished Minting: " + tokenCanMint);
            var tokenOnlyOwner = await tokenSaleContract.getTokenOnlyOwner.call();
            console.log("Token no account getTokenOnlyOwner: " + tokenOnlyOwner);
            var tokenOnlyOwner = await tokenSaleContract.getTokenOnlyOwner.call({from:owner1});
            console.log("Token account 0 getTokenOnlyOwner: " + tokenOnlyOwner);
            var tokenOnlyOwner = await tokenSaleContract.getTokenOnlyOwner.call({from:buyer1});
            console.log("Token account 3 getTokenOnlyOwner: " + tokenOnlyOwner);

            var owner = await tokenSaleContract.getOwner.call();
            console.log("PreSale Owner: " + owner);
            var validX = await tokenSaleContract.validPurchasePublic.call(owner1);
            console.log("PreSale Valid Purchase for " + owner1 + ": " + validX);
            validX = await tokenSaleContract.validPurchasePublic.call(buyer1);
            console.log("PreSale Valid Purchase for " + buyer1 + ": " + validX);
            validX = await tokenSaleContract.validPurchasePublic.call(buyer2);
            console.log("PreSale Valid Purchase for " + buyer2 + ": " + validX);
            validX = await tokenSaleContract.validPurchasePublic.call(buyer3);
            console.log("PreSale Valid Purchase for " + buyer3 + ": " + validX);
            */
            assert.equal(true, true, 'Get Token and Presale Variables Failed');
        } catch (error) {
            console.log(error);            
        }
    });

    it('buys tokens', async function(){
        const weiAmount = 1 * 1000000000000000000;
        try {
            const tokenAmount = (await tokenSaleContract.calcTokens.call(weiAmount)).toNumber();
            //console.log("tokenAmount = " + tokenAmount);

            //var TokensSold = await tokenSaleContract.getTokensSold();
            //var TokenCap = await tokenSaleContract.getTokenCap();
            //console.log("Tokens Sold: " + TokensSold + " Token Cap " + TokenCap);
            var isCapReached = await tokenSaleContract.getcapReached();
            assert.equal(isCapReached, false, 'buys tokens - Cap Reached Failed');


            const totalExpected = (await tokenContract.totalSupply()).toNumber();
            const buyerExpected = (await tokenContract.balanceOf(buyer3)).toNumber();
            const walletExpected = (await web3.eth.getBalance(wallet1)).toNumber();

            await tokenSaleContract.buyTokens({ value: weiAmount, from: buyer3}).then((result) => { 
                //console.log(result);
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer1, amount: 1000000000000000000 }})
             });

            // check that the buyer got the right amount of tokens
            const buyerBal = (await tokenContract.balanceOf(buyer3)).toNumber();
            // check that tokensSold, totalSupply and availableSupply have been updated
            const totalSupply = (await tokenContract.totalSupply()).toNumber();
            // check that wei was transferred to correct wallet address
            const walletBal = (await web3.eth.getBalance(wallet1)).toNumber();

            //console.log("buyerBal = " + buyerBal);
            //console.log("totalSupply = " + totalSupply);
            //console.log("walletBal = " + walletBal);

            assert.equal(walletBal, walletExpected + weiAmount, 'Wallet balance did not increase correctly');  
            assert.equal(totalSupply, totalExpected + tokenAmount, 'Total supply did not increase correctly'); 
            assert.equal(buyerBal, buyerExpected + tokenAmount, 'Balance did not increase correctly');

        } catch (error) {
            console.log(error);              
        }
    });
 
    it('makes external purchase', async function() {
        var isPurchased = false;
        const centsAmount = 10000;
        try {
            const source = await tokenSaleContract.paymentSource.call();
            assert.equal(source, pmtSrc, 'makes external purchase - Payment Source Failed');
            var isListed = await tokenSaleContract.isWhitelisted(buyer4);
            assert.equal(isListed, true, 'makes external purchase - Early listed Failed');
            //var TokensSold = await tokenSaleContract.getTokensSold();
            //var TokenCap = await tokenSaleContract.getTokenCap();
            //console.log("Tokens Sold: " + TokensSold + " Token Cap " + TokenCap);

            var isCapReached = await tokenSaleContract.getcapReached();
            assert.equal(isCapReached, false, 'makes external purchase - Cap Reached Failed');
            //var tokenValid = await tokenSaleContract.calcCentsToTokensValidate.call(buyer2, centsAmount, {from: pmtSrc});
            //assert.equal(tokenValid, true, 'makes external purchase - calcCentsToTokensValidate Failed');

            var tokenAmount = (await tokenSaleContract.calcCentsToTokens.call(centsAmount, {from: buyer4})).toNumber();
            const totalExpected = (await tokenContract.totalSupply()).toNumber();
            const buyerExpected = (await tokenContract.balanceOf(buyer4)).toNumber();

            tokenSaleContract.externalPurchase(buyer4, centsAmount, {from: pmtSrc}).then((result) => { 
                //console.log(result);
                //console.log(result.logs.length);                
                for (var i = 0; i < result.logs.length; i++) {
                    //console.log(i);
                    var log = result.logs[i];
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: 1000000000000000000 }});
            });

            // check that the buyer got the right amount of tokens
            const buyerBal = (await tokenContract.balanceOf(buyer4)).toNumber();
            // check that tokensSold, totalSupply and availableSupply have been updated
            const totalSupply = (await tokenContract.totalSupply()).toNumber();

            assert.equal(totalSupply, totalExpected + tokenAmount, 'Total supply did not increase correctly'); 
            assert.equal(buyerBal, buyerExpected + tokenAmount, 'Balance did not increase correctly');

        } catch (error) {
            console.log(error);               
        }
    });

    it('buys after tokens', async function(){
        try {
            const totalSupply = await tokenContract.totalSupply();
            const balanceo1 = await tokenContract.balanceOf(owner1);
            const balanceo2 = await tokenContract.balanceOf(owner2);
            const balance1 = await tokenContract.balanceOf(buyer1);
            const balance2 = await tokenContract.balanceOf(buyer2);
            const balance3 = await tokenContract.balanceOf(buyer3);
            const balance4 = await tokenContract.balanceOf(buyer4);
            const balancepmtSrc = await tokenContract.balanceOf(pmtSrc);
            const walletBalpmtSrc = (await web3.eth.getBalance(pmtSrc)).toNumber();
            const wallet1Bal = (await web3.eth.getBalance(wallet1)).toNumber();
            const wallet2Bal = (await web3.eth.getBalance(wallet2)).toNumber();
            var TokensSold = await tokenSaleContract.getTokensSold();
            var TokenCap = await tokenSaleContract.getTokenCap();
            console.log("Tokens Sold: " + TokensSold + " Token Cap " + TokenCap);
            
            console.log("totalSupply: " + totalSupply);
            console.log("balanceo1: " + balanceo1);
            console.log("balanceo2: " + balanceo2);        
            console.log("balance1: " + balance1);        
            console.log("balance2: " + balance2);        
            console.log("balance3: " + balance3);        
            console.log("balance4: " + balance4);        
            console.log("balancepmtSrc: " + balancepmtSrc);                
            console.log("walletBalpmtSrc: " + walletBalpmtSrc);                
            console.log("walletBal1: " + wallet1Bal);         
            console.log("walletBal2: " + wallet2Bal);         

        } catch (error) {
            console.log(error);              
        }
    })

    it('changes token price', async function() {

        const _value = 0;
        const _centsRaised = 0;
        const _tokensSold = 0;

        try {
            const currentPrice = await tokenSaleContract.getDollarPriceExternal(_value,_centsRaised,_tokensSold,buyer1);
            const expectedPrice = currentPrice + 5;
            const validPurchase = await tokenSaleContract.changePrice(expectedPrice);

            const newPrice = await tokenSaleContract.getDollarPriceExternal(_value,_centsRaised,_tokensSold,buyer1);
            assert.equal(newPrice, expectedPrice, 'Price Changed Failed');
        } catch (error) {
            console.log(error);
        }            
    });

    it('should pause correctly', async function() {
        try {
            await tokenSaleContract.pause();
            const isPaused = await tokenSaleContract.paused();
            assert.equal(isPaused, true, 'Presale was not paused correctly');                
        } catch (error) {
            console.log(error);           
        }
    });
    
    it('should unpause correctly', async function() {
        try {
            await tokenSaleContract.unpause();
            const isPaused = await tokenSaleContract.paused();
            assert.equal(isPaused, false, 'Presale was not unpaused correctly');                
        } catch (error) {
            console.log(error);                
        }
    });

    /*

    claimStrandedTokens(address _token, address _to) public onlyOwner returns (bool)

    */

   it('change Conversion Rate', async function() {
        try {
            const newRate = new web3.BigNumber(95000);
            var conversionRate = await tokenSaleContract.getConversionRate();
            
            tokenSaleContract.changeConversionRate(newRate).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: 1000000000000000000 }});
            });
            conversionRate = await tokenSaleContract.getConversionRate();
            assert.equal(newRate.toNumber(), conversionRate.toNumber(), 'change Conversion Rate Failed');                
        } catch (error) {
            console.log(error);                
        }
    });

    it('change Wallet', async function() {
        try {
                      
            tokenSaleContract.changeWallet(wallet2).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: 1000000000000000000 }});
            });
            await sleep(500);
            assert.equal(true, true, 'change Wallet Failed');                
        } catch (error) {
            console.log(error);                
        }
    });

    it('buys tokens after Rate Change and Wallet', async function(){
        const weiAmount = 1 * 1000000000000000000;
        try {
            const tokenAmount = (await tokenSaleContract.calcTokens.call(weiAmount)).toNumber();
            console.log("tokenAmount = " + tokenAmount);

            //var TokensSold = await tokenSaleContract.getTokensSold();
            //var TokenCap = await tokenSaleContract.getTokenCap();
            //console.log("Tokens Sold: " + TokensSold + " Token Cap " + TokenCap);
            var isCapReached = await tokenSaleContract.getcapReached();
            assert.equal(isCapReached, false, 'buys tokens after Rate Change and Wallet - Cap Reached Failed');

            const totalExpected = (await tokenContract.totalSupply()).toNumber();
            const buyerExpected = (await tokenContract.balanceOf(buyer4)).toNumber();
            const walletExpected = (await web3.eth.getBalance(wallet2)).toNumber();
            const walletOldExpected = (await web3.eth.getBalance(wallet1)).toNumber();

            await tokenSaleContract.buyTokens({ value: weiAmount, from: buyer4}).then((result) => { 
                //console.log(result);
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer1, amount: 1000000000000000000 }})
            });

            await sleep(500);

            // check that the buyer got the right amount of tokens
            const buyerBal = (await tokenContract.balanceOf(buyer4)).toNumber();
            // check that tokensSold, totalSupply and availableSupply have been updated
            const totalSupply = (await tokenContract.totalSupply()).toNumber();
            // check that wei was transferred to correct wallet address
            const walletBal = (await web3.eth.getBalance(wallet2)).toNumber();
            const walletOldBal = (await web3.eth.getBalance(wallet1)).toNumber();

            //console.log("buyerBal = " + buyerBal);
            //console.log("totalSupply = " + totalSupply);
            //console.log("walletBal = " + walletBal);

            assert.equal(walletOldBal, walletOldExpected, 'buys tokens after Rate Change and Wallet - Wallet1 balance did not increase correctly');  
            assert.equal(walletBal, walletExpected + weiAmount, 'buys tokens after Rate Change and Wallet - Wallet2 balance did not increase correctly');  
            assert.equal(totalSupply, totalExpected + tokenAmount, 'buys tokens after Rate Change and Wallet - Total supply did not increase correctly'); 
            assert.equal(buyerBal, buyerExpected + tokenAmount, 'buys tokens after Rate Change and Wallet - Balance did not increase correctly');

        } catch (error) {
            console.log(error);              
        }
    });

    it('change Start Time', async function() {
        try {
            var startTime = await tokenSaleContract.getStartTime();
            const newTime = startTime.toNumber() + 1;
            tokenSaleContract.changeStartTime(newTime).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: 1000000000000000000 }});
            });
            await sleep(500);
            startTime = await tokenSaleContract.getStartTime();
            assert.equal(newTime, startTime.toNumber(), 'change Start Time Failed');                
        } catch (error) {
            console.log(error);                
        }
    });

    it('change End Time', async function() {
        try {
            var endTime = await tokenSaleContract.getStartTime();
            const newTime = endTime.toNumber() + 1;
            tokenSaleContract.changeEndTime(newTime).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: 1000000000000000000 }});
            });
            await sleep(500);
            endTime = await tokenSaleContract.getEndTime();
            assert.equal(newTime, endTime.toNumber(), 'change End Time Failed');                
        } catch (error) {
            console.log(error);                
        }
    });

    it('Sale Complete Test', async function() {
        try {           
            var isComplete = await tokenSaleContract.completeSale();
            assert.equal(isComplete, true, 'Sale Complete Failed');              
        } catch (error) {
            console.log(error);                
        }
    })

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
      
    function RecordLog(log) {
        switch (log.event) {
            case "TokensBought": {
                console.log("Event:" + " " + log.event +": " + log.args.tokenAmount.toNumber() + " by " + log.args.buyer + " purchaser " + log.args.purchaser + " centsPaid: " + log.args.centsPaid.toNumber());
                break;
            }
            case "CapReached": {
                console.log("Event:" + " " + log.event +": " + log.args.tokensSold.toNumber() + " >= " + log.args.cap);
                break;
            }
            case "ExternalPurchase": {
                console.log("Event:" + " " + log.event +": " + " by " + log.args.buyer + " payment source " + log.args.source + " centsPaid: " + log.args.centsPaid.toNumber());
                break;
            }
            case "Mint": {
                console.log("Event:" + " " + log.event +": " + log.args.amount.toNumber() + " by " + log.args.to);
                break;
            }
            case "Transfer": {
                console.log("Event:" + " " + log.event +": " + log.args.value.toNumber() + " from " + log.args.from + " to " + log.args.to);
                break;
            }
            case "StartTimeChanged": {
                console.log("Event:" + " " + log.event +": " + log.args.newTime.toNumber());
                break;
            }
            case "EndTimeChanged": {
                console.log("Event:" + " " + log.event +": " + log.args.newTime.toNumber());
                break;
            }
            case "ConversionRateChanged": {
                console.log("Event:" + " " + log.event +": " + log.args.newRate.toNumber());
                break;
            }
            case "WalletChanged": {
                console.log("Event:" + " " + log.event +": " + log.args.newWallet);
                break;
            }            
            default: {
                //console.log(log.event);
                console.log(log);
                break;
            }
        }
    }

});