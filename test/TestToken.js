var PeblikToken = artifacts.require("PeblikToken");

contract('PeblikToken', function(accounts) {

    it('should start non-transferable', function(done){
        PeblikToken.deployed().then(async function(instance) { 
            const isTransferable = await instance.transferable();
            assert.equal(isTransferable, false, 'Token should not be trasnferable at the start');
            done();
       });
    });

    it('should pause correctly', function(done){
        PeblikToken.deployed().then(async function(instance) {

            await instance.pause();
            const isPaused = await instance.paused();

            assert.equal(isPaused, true, 'Token was not paused correctly');
            done();
       });
    });

    it('should unpause correctly', function(done){
        PeblikToken.deployed().then(async function(instance) {

            await instance.unpause();
            const isPaused = await instance.paused();

            assert.equal(isPaused, false, 'Token was not unpaused correctly');
            done();
       });
    });

    it('should mint tokens and send to recipient', function(done){
        PeblikToken.deployed().then(async function(instance) {
            const tokenAmount = 20 * 1000000000000000000;
            const recipient = accounts[1]; //address(0xf17f52151EbEF6C7334FAD080c5704D77216b732);
            const totalExpected = (await instance.totalSupply.call()).toNumber() + tokenAmount;
            const balanceExpected = (await instance.balanceOf(recipient)).toNumber() + tokenAmount;

            await instance.mint(recipient, tokenAmount); //50e18, or 50 full tokens
            
            const totalSupply = await instance.totalSupply.call();
            const balance = await instance.balanceOf(recipient);

            assert.equal(balance.toNumber(), balanceExpected, 'Balance did not increase correctly');
            assert.equal(totalSupply.toNumber(), totalExpected, 'Total supply did not increase correctly');          
            done();
       });
    });

    /** Need to catch the revert () in the following test */
    /*
    it('should not be able to transfer tokens yet', function(done){
        PeblikToken.deployed().then(async function(instance) {
            const tokenAmount = 20 * 1000000000000000000;
            const sender = accounts[1]; 
            const recipient = accounts[2]; 

            const balanceExpected = (await instance.balanceOf(recipient)).toNumber();

            await instance.transfer(recipient, tokenAmount, {from: sender}); //50e18, or 50 full tokens
            
            const balance = await instance.balanceOf(recipient);

            assert.equal(balance.toNumber(), balanceExpected, 'Recipient balance should not have changed');        
            done();
       });
    });
    */
    it('should make token transferable', function(done){
        PeblikToken.deployed().then(async function(instance) { 

            await instance.setTransferable();
            const isTransferable = await instance.transferable();
            assert.equal(isTransferable, true, 'Token should now be transferable');
            done();
       });
    });

    it('should now be able to transfer tokens', function(done){
        PeblikToken.deployed().then(async function(instance) {
            const tokenAmount = 20 * 1000000000000000000;
            const sender = accounts[1]; 
            const recipient = accounts[2]; 

            const senderBalanceExpected = (await instance.balanceOf(sender)).toNumber() - tokenAmount;
            const balanceExpected = (await instance.balanceOf(recipient)).toNumber() + tokenAmount;

            await instance.transfer(recipient, tokenAmount, {from: sender}); 
            
            const senderBalance = await instance.balanceOf(sender);
            const balance = await instance.balanceOf(recipient);

            assert.equal(senderBalance.toNumber(), senderBalanceExpected, 'Sender balance should have decreased by ' + tokenAmount);      
            assert.equal(balance.toNumber(), balanceExpected, 'Recipient balance should have increased by ' + tokenAmount);        
            done();
       });
    });

});