var PeblikPresale = artifacts.require("PeblikPresale");

contract('PeblikPresale', function(accounts) {

    /*

    externalPurchase (address _buyer, uint256 _centsAmount) external returns (bool)
    completeSale () public onlyOwner
    changeStartTime (uint256 _newTime) public onlyOwner
    changeEndTime (uint256 _newTime) public onlyOwner
    changeConversionRate (uint256 _newRate) public onlyOwner
    changeWallet (address _newWallet) public onlyOwner
    changePaymentSource (address _newSource) public onlyOwner
    addToWhitelist(address _buyer) public onlyOwner
    isWhitelisted(address _buyer) public view returns (bool)
    getDollarPrice(uint256 _value, uint256 _centsRaised, uint256 _tokensSold, address _buyer) internal view returns (uint256 price)
    claimStrandedTokens(address _token, address _to) public onlyOwner returns (bool)

    */

    it('add To Early list', function(done){
        PeblikPresale.deployed().then(async function(instance) {
            var isListed = await instance.isEarlylisted(accounts[1]);
            if (!isListed) {
                await instance.addToEarlylist(accounts[1]);
                isListed = await instance.isEarlylisted(accounts[1]);
            }

            try {
                assert.equal(isListed, true, 'Early listed Failed');
                done();
            } catch (error) {
                console.log(error);
                done(error);                    
            }    
       });
    });

    it('is White Listed', function(done){
        PeblikPresale.deployed().then(async function(instance) {
            var isListed = await instance.isWhitelisted(accounts[1]);
            
            if (!isListed) {
                await instance.addToWhitelist(accounts[1]);
                isListed = await instance.isWhitelisted(accounts[1]);
            }

            try {
                assert.equal(isListed, true, 'Is White listed Failed');
                done();
            } catch (error) {
                console.log(error);
                done(error);                    
            }
       });
    });


    it('is Listed', function(done){
        PeblikPresale.deployed().then(async function(instance) {
            var isListed = await instance.isListed(accounts[1]);
            
            try {
                assert.equal(isListed, true, 'Is listed Failed');
                done();
            } catch (error) {
                console.log(error); 
                done(error);                   
            }
       });
    });

    
    it('change Payment Source', function(done){
        PeblikPresale.deployed().then(async function(instance) {
            try {
                await instance.changePaymentSource(accounts[5]);
                assert.equal(true, true, 'change Payment Source Failed');
                done();
            } catch (error) {
                console.log(error);
                done(error);                
            }
       });
    });

    it('Get Time', function(done){
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

    
    it('External Purchase', function(done){
        PeblikPresale.deployed().then(async function(instance) {
            //var isListed = await instance.isListed(accounts[1]);
            var isPurchased = false;
            const centsAmount = new web3.BigNumber(10001);
            try {
                var tx = await instance.externalPurchase.call(accounts[1], centsAmount);
                //console.log(tx);
                assert.equal(tx, true, 'External Purchase Failed');
                done();
            } catch (error) {
                console.log(error);
                done(error);                
            }
        });
    });


    it('Price Changed correctly', function(done){
        PeblikPresale.deployed().then(async function(instance) {
            const _value = 0;
            const _centsRaised = 0;
            const _tokensSold = 0;

            try {
                const currentPrice = await instance.getDollarPriceExternal(_value,_centsRaised,_tokensSold,accounts[1]);
                const expectedPrice = currentPrice + 1;
                const validPurchase = await instance.changePrice(expectedPrice);
                //console.log(validPurchase);
                const newPrice = await instance.getDollarPriceExternal(_value,_centsRaised,_tokensSold,accounts[1]);
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