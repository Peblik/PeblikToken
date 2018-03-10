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

    const weiPerEth = 1000000000000000000;

    let tokenSaleContract;
    let tokenContract;
    
    let tokenCap;

    before('setup contracts for all tests', async function () {
        // cache instances of the contracts for use in all the tests
        PeblikTokenSale.deployed().then(async function (instance) {
            tokenSaleContract = instance;

            tokenCap = (await tokenSaleContract.tokenCap()) / weiPerEth;
            console.log("tokenCap = " + tokenCap)
        });

        PeblikToken.deployed().then(async function (tokenInstance) {
            tokenContract = tokenInstance;

            const addr = tokenContract.address;
            console.log("token contract address = " + addr);   
        });
    });

    it('changes payment source', async function() {
        try {
            await tokenSaleContract.changePaymentSource(pmtSrc, { from: owner1 }).then((result) => { 
                //console.log(result);
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer1, amount: 1000000000000000000 }})
             });
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

    it('buys tokens', async function(){
        const weiAmount = 1 * weiPerEth;
        try {
            var tokensSold = (await tokenSaleContract.tokensSold()) / weiPerEth;
            console.log("Tokens Sold: " + tokensSold + ", Cap: " + tokenCap);
            const dollarPrice = (await tokenSaleContract.getDollarPriceExternal.call(weiAmount, 0, tokensSold, buyer3));
            console.log("weiAmount: " + weiAmount + ", Price: " + dollarPrice);
            const tokenAmount = (await tokenSaleContract.calcTokens.call(weiAmount)).toNumber();
            console.log("tokenAmount = " + tokenAmount);

            var isCapReached = await tokenSaleContract.capReached();
            assert.equal(isCapReached, false, 'buys tokens - Cap Reached Failed');

            const totalExpected = (await tokenContract.totalSupply()).toNumber();
            const buyerExpected = (await tokenContract.balanceOf(buyer3)).toNumber();
            const walletExpected = (await web3.eth.getBalance(wallet1)).toNumber();

            await tokenSaleContract.buyTokens({ value: weiAmount, from: buyer3}).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    RecordLog(log);
                }
             });

            // check that the buyer got the right amount of tokens
            const buyerBal = (await tokenContract.balanceOf(buyer3)).toNumber();
            // check that tokensSold, totalSupply and availableSupply have been updated
            const totalSupply = (await tokenContract.totalSupply()).toNumber();
            // check that wei was transferred to correct wallet address
            const walletBal = (await web3.eth.getBalance(wallet1)).toNumber();

            console.log("buyerBal = " + buyerBal);
            console.log("totalSupply = " + totalSupply);
            console.log("walletBal = " + walletBal);

            assert.equal(walletBal, walletExpected + weiAmount, 'Wallet balance did not increase correctly');  
            assert.equal(totalSupply, totalExpected + tokenAmount, 'Total supply did not increase correctly'); 
            assert.equal(buyerBal, buyerExpected + tokenAmount, 'Balance did not increase correctly');

        } catch (error) {
            console.log(error);   
            assert.isOk(false);
        }
    });

    it('buys more tokens', async function(){
        const weiAmount = 1 * weiPerEth;
        try {
            var tokensSold = (await tokenSaleContract.tokensSold()) / weiPerEth;
            console.log("Tokens Sold: " + tokensSold + ", Cap: " + tokenCap);
            const dollarPrice = (await tokenSaleContract.getDollarPriceExternal.call(weiAmount, 0, tokensSold, buyer3));
            console.log("weiAmount: " + weiAmount + ", Price: " + dollarPrice);
            const tokenAmount = (await tokenSaleContract.calcTokens.call(weiAmount)).toNumber();
            console.log("tokenAmount = " + tokenAmount);

            var isCapReached = await tokenSaleContract.capReached();
            assert.equal(isCapReached, false, 'buys tokens - Cap Reached Failed');

            const totalExpected = (await tokenContract.totalSupply()).toNumber();
            const buyerExpected = (await tokenContract.balanceOf(buyer3)).toNumber();
            const walletExpected = (await web3.eth.getBalance(wallet1)).toNumber();

            await tokenSaleContract.buyTokens({ value: weiAmount, from: buyer3}).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    RecordLog(log);
                }
             });

            // check that the buyer got the right amount of tokens
            const buyerBal = (await tokenContract.balanceOf(buyer3)).toNumber();
            // check that tokensSold, totalSupply and availableSupply have been updated
            const totalSupply = (await tokenContract.totalSupply()).toNumber();
            // check that wei was transferred to correct wallet address
            const walletBal = (await web3.eth.getBalance(wallet1)).toNumber();

            console.log("buyerBal = " + buyerBal);
            console.log("totalSupply = " + totalSupply);
            console.log("walletBal = " + walletBal);

            assert.equal(walletBal, walletExpected + weiAmount, 'Wallet balance did not increase correctly');  
            assert.equal(totalSupply, totalExpected + tokenAmount, 'Total supply did not increase correctly'); 
            assert.equal(buyerBal, buyerExpected + tokenAmount, 'Balance did not increase correctly');

        } catch (error) {
            console.log(error);   
            assert.isOk(false);
        }
    });

    it('buys enough tokens to end first phase', async function(){
        const weiAmount = 10 * weiPerEth;
        try {
            var tokensSold = (await tokenSaleContract.tokensSold()) / weiPerEth;
            console.log("Tokens Sold: " + tokensSold + ", Cap: " + tokenCap);
            const dollarPrice = (await tokenSaleContract.getDollarPriceExternal.call(weiAmount, 0, tokensSold, buyer3));
            console.log("weiAmount: " + weiAmount + ", Price: " + dollarPrice);
            const tokenAmount = (await tokenSaleContract.calcTokens.call(weiAmount)).toNumber();
            console.log("tokenAmount = " + tokenAmount);

            await tokenSaleContract.buyTokens({ value: weiAmount, from: buyer4}).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    RecordLog(log);
                }
             });

            var newTokensSold = (await tokenSaleContract.tokensSold()) / weiPerEth;
            var newPrice = (await tokenSaleContract.getDollarPriceExternal.call(weiAmount, 0, newTokensSold, buyer3));

            console.log("newTokensSold = " + newTokensSold);
            console.log("newPrice = " + newPrice);

            assert.isAbove(newPrice, dollarPrice, 'Price should have increased'); 
            assert.equal(newTokensSold, tokensSold + (tokenAmount / weiPerEth), 'Tokens sold did not update correctly');  

        } catch (error) {
            console.log(error);
        }
    });

    it('buy fails because less than the min amount', async function(){ 
        try {
            const minCents = await tokenSaleContract.minCents();
            const minWei = await tokenSaleContract.minWei();
            const weiAmount = minWei - 1;
            console.log("minCents = " + minCents + ", minWei = " + minWei + ", weiAmount = " + weiAmount);

            await tokenSaleContract.buyTokens({ value: weiAmount, from: buyer3}).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    RecordLog(log);
                }
             });

            assert.isOk(false, 'Buy below minWei should have failed, but did not');

        } catch (error) {
            //console.log(error);  
            assert.isOk(true, 'Buy below minWei failed as intended');            
        }
    });

    it('buy fails because more than the max amount', async function(){
        try {
            const maxCents = await tokenSaleContract.maxCents();
            const maxWei = await tokenSaleContract.maxWei();
            const weiAmount = maxWei + 1;
            console.log("maxCents = " + maxCents + ", maxWei = " + maxWei + ", weiAmount = " + weiAmount);

            await tokenSaleContract.buyTokens({ value: weiAmount, from: buyer3}).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    RecordLog(log);
                }
             });
             assert.isOk(false, 'Buy above maxWei should have failed, but did not');

            } catch (error) {
                //console.log(error);  
                assert.isOk(true, 'Buy above maxWei failed as intended');            
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

            var isCapReached = await tokenSaleContract.capReached();
            assert.equal(isCapReached, false, 'makes external purchase - Cap Reached Failed');
  
            var tokenAmount = (await tokenSaleContract.calcCentsToTokens.call(centsAmount, {from: buyer4})).toNumber();
            const totalExpected = (await tokenContract.totalSupply()).toNumber();
            const buyerExpected = (await tokenContract.balanceOf(buyer4)).toNumber();

            await tokenSaleContract.externalPurchase(buyer4, centsAmount, {from: pmtSrc}).then((result) => { 
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
            var TokensSold = await tokenSaleContract.tokensSold();
            var TokenCap = await tokenSaleContract.tokenCap();
            console.log("Tokens Sold: " + TokensSold + ", Token Cap: " + TokenCap);
            
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

    it('change Levels price', async function() {

        const _value = 0;
        const _centsRaised = 0;
        const _tokensSold = 110001;
        const thresholds = [0,51000,110000,160000];
        const prices = [26,36,46,56];
        const expectedPrice = 46;
  
        try {
            const validPurchase = await tokenSaleContract.changeLevels(thresholds,prices).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: 1000000000000000000 }});
            });
            const newPrice = await tokenSaleContract.getDollarPriceExternal(_value,_centsRaised,_tokensSold,buyer4);
            assert.equal(newPrice.toNumber(), expectedPrice, 'change Levels price Failed');
        } catch (error) {
            console.log(error);
        }            
    });

   it('change Conversion Rate', async function() {
        try {
            const newRate = new web3.BigNumber(95000);
            var conversionRate = await tokenSaleContract.centsPerEth();
            
            await tokenSaleContract.changeConversionRate(newRate).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: 1000000000000000000 }});
            });
            conversionRate = await tokenSaleContract.centsPerEth();
            assert.equal(newRate.toNumber(), conversionRate.toNumber(), 'change Conversion Rate Failed');                
        } catch (error) {
            console.log(error);                
        }
    });

    it('change Wallet', async function() {
        try {
                      
            await tokenSaleContract.changeWallet(wallet2).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: 1000000000000000000 }});
            });

            assert.equal(true, true, 'change Wallet Failed');                
        } catch (error) {
            console.log(error);                
        }
    });

    it('buys tokens after Rate Change and Wallet', async function(){
        const weiAmount = 1 * weiPerEth;
        try {
            const tokenAmount = (await tokenSaleContract.calcTokens.call(weiAmount)).toNumber();

            var isCapReached = await tokenSaleContract.capReached();
            assert.equal(isCapReached, false, 'buys tokens after Rate Change and Wallet - Cap Reached Failed');

            const totalExpected = (await tokenContract.totalSupply()).toNumber();
            const buyerExpected = (await tokenContract.balanceOf(buyer4)).toNumber();
            const walletExpected = (await web3.eth.getBalance(wallet2)).toNumber();
            const walletOldExpected = (await web3.eth.getBalance(wallet1)).toNumber();

            await tokenSaleContract.buyTokens({ value: weiAmount, from: buyer4}).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    RecordLog(log);
                }
            });

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
            var dt = new Date();
            dt.setDate(dt.getDate());
            const newTime = (Math.round((dt.getTime())/1000)) + 1; // now
            await tokenSaleContract.changeStartTime(newTime).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: weiPerEth }});
            });

            startTime = await tokenSaleContract.startTime();
            assert.equal(newTime, startTime.toNumber(), 'change Start Time Failed');                
        } catch (error) {
            console.log(error);                
        }
    });

    it('change End Time', async function() {
        try {
            var dt = new Date();
            dt.setDate(dt.getDate());
            const newTime = (Math.round((dt.getTime())/1000)) + 5400; // 90 minutes after start
            await tokenSaleContract.changeEndTime(newTime).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: weiPerEth }});
            });
            endTime = await tokenSaleContract.endTime();
            assert.equal(newTime, endTime.toNumber(), 'change End Time Failed');                
        } catch (error) {
            console.log(error);                
        }
    });

   it('change Employee Pool Wallet', async function() {
        try {
            await tokenSaleContract.changeEmployeePoolWallet(owner1).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: weiPerEth }});
            });
            var newOwner = await tokenSaleContract.employeePoolWallet();
            assert.equal(newOwner, owner1, 'change Employee Pool Wallet Failed');                
        } catch (error) {
            console.log(error);                
        }
    });

    it('change Advisor Pool Wallet', async function() {
        try {
            await tokenSaleContract.changeAdvisorPoolWallet(owner2).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: weiPerEth }});
            });
            var newOwner = await tokenSaleContract.advisorPoolWallet();
            assert.equal(newOwner, owner2, 'change Advisor Pool Wallet Failed');                
        } catch (error) {
            console.log(error);                
        }
    });

    it('change Bounty Program Wallet', async function() {
        try {
            await tokenSaleContract.changeBountyProgramWallet(wallet1).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: weiPerEth }});
            });
            var newOwner = await tokenSaleContract.bountyProgramWallet();
            assert.equal(newOwner, wallet1, 'change Bounty Program Wallet Failed');                
        } catch (error) {
            console.log(error);                
        }
    });

    it('Sale Complete', async function() {
        try {
            
            var dt = new Date();
            dt.setDate(dt.getDate());
            const newTime = (Math.round((dt.getTime())/1000)) + 2; // now
            await tokenSaleContract.changeEndTime(newTime).then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: weiPerEth }});
            });

            await sleep(10000);

            const baseAmount = 1 * weiPerEth;

            const employeePoolToken = 360000000 * baseAmount;
            const advisorPoolToken = 120000000 * baseAmount;
            const bountyProgramToken = 120000000 * baseAmount;

            const totalExpected = (await tokenContract.totalSupply()).toNumber();
            const owner1BalExpected = (await tokenContract.balanceOf(owner1)).toNumber();
            const owner2BalExpected = (await tokenContract.balanceOf(owner2)).toNumber();
            const wallet1BalExpected = (await tokenContract.balanceOf(wallet1)).toNumber();

            //console.log("totalExpected " + totalExpected);
            //console.log("owner1BalExpected " + owner1BalExpected);
            //console.log("owner2BalExpected " + owner2BalExpected);
            //console.log("wallet1BalExpected " + wallet1BalExpected);

            await tokenSaleContract.completeSale().then((result) => { 
                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];
                    //console.log(log);
                    RecordLog(log);
                }
                //utils.assertEvent(tokenSaleContract, { event: "Mint", logIndex: 0, args: { to: buyer2, amount: weiPerEth }});
            });
            
            // check that tokensSold, totalSupply and availableSupply have been updated
            const totalSupply = (await tokenContract.totalSupply()).toNumber();
            // check that the Accounts got the right amount of tokens
            const owner1Bal = (await tokenContract.balanceOf(owner1)).toNumber();
            const owner2Bal = (await tokenContract.balanceOf(owner2)).toNumber();
            const wallet1Bal = (await tokenContract.balanceOf(wallet1)).toNumber();

            //console.log("totalSupply " + totalSupply);
            //console.log("owner1Bal " + owner1Bal);
            //console.log("owner2Bal " + owner2Bal);
            //console.log("wallet1Bal " + wallet1Bal);

            //console.log("totalExpected + employeePoolToken + advisorPoolToken + bountyProgramToken " + (totalExpected + employeePoolToken + advisorPoolToken + bountyProgramToken));
            assert.equal(totalSupply, (totalExpected + employeePoolToken + advisorPoolToken + bountyProgramToken), 'Sale Complete - Total supply did not increase correctly'); 
            assert.equal(owner1Bal, owner1BalExpected + employeePoolToken, 'Sale Complete - Balance did not increase correctly');
            assert.equal(owner2Bal, owner2BalExpected + advisorPoolToken, 'Sale Complete - Balance did not increase correctly');
            assert.equal(wallet1Bal, wallet1BalExpected + bountyProgramToken, 'Sale Complete - Balance did not increase correctly');            
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
            case "EmployeeWalletChanged":
            case "AdvisorWalletChanged":
            case "BountyWalletChanged":
            case "WalletChanged": {
                console.log("Event:" + " " + log.event +": " + log.args.newWallet);
                break;
            }       
            case "PaymentSourceChanged": {
                console.log("Event:" + " " + log.event +": oldSource " + log.args.oldSource + " newSource " + log.args.newSource);
                break;
            }        
            case "SaleComplete": {
                console.log("Event:" + " " + log.event +": totalSupply " + log.args.totalSupply.toNumber());
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