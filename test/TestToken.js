var PeblikToken = artifacts.require("PeblikToken");

contract('PeblikToken', function(accounts) {

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
            const tokenAmount = 50 * 1000000000000000000;
            const recipient = accounts[1]; //address(0xf17f52151EbEF6C7334FAD080c5704D77216b732);
            const totalExpected = (await instance.totalSupply.call()).toNumber() + tokenAmount;
            const balanceExpected = (await web3.eth.getBalance(recipient)).toNumber() + tokenAmount;

            await instance.mint(recipient, tokenAmount); //50e18, or 50 full tokens
            
            const totalSupply = await instance.totalSupply.call();
            const balance = await web3.eth.getBalance(recipient);

            assert.equal(balance.toNumber(), balanceExpected, 'Total supply did not increase correctly');
            assert.equal(totalSupply.toNumber(), totalExpected, 'Total supply did not increase correctly');
           
            done();
       });
    });

});