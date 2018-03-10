pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import "./IPriceStrategy.sol";
import "./FlatPricing.sol";
import "./PeblikToken.sol";

/**
 * This BaseTokenSale contract already includes some non-standard token crowdsale rules, including:
 * - tokens are minted and transferred to the purchaser at the time of sale
 * - there are no refunds
 * - all purchasers must be whitelisted prior to purchase
 * - token prices are defined in US dollars (actually cents per token), as opposed to ether
 * - dollar to ether conversion rate should be managed on at least a daily basis
 * - external (non-ether) transactions can be accepted from a remote paymentSource address 
 *   (presumably representing transactions triggered after a purchase from a web-based payment provider)
 * - purchases are subject to per-transaction minimums and per-buyer maximums
 * - the sale ends when either the tokensSold cap has been reached, or the endTime has passed
 * - a manual completeSale() function must be invoked after the sale ends to trigger any post-sale processing
 */
contract BaseTokenSale is Pausable {
    using SafeMath for uint256;

    // From Crowdsale.sol --------------------

    // The token being sold
    PeblikToken public token;

    // start and end timestamps where investments are allowed (both inclusive)
    uint256 public startTime;
    uint256 public endTime;

    // address where funds are collected
    address public wallet;

    // Customizations ------------------------

    // Address of the account from which external (non-ETH) transactions will be received.
    address public paymentSource;

    // The current conversion rate between USD and ETH, multiplied by 100
    uint256 public centsPerEth = 100000; // defaults to $1000.00

    uint256 public weiRaised;
    uint256 public centsRaised;
    uint256 public tokensSold;
    uint256 public tokenCap;

    uint256 public minCents;
    uint256 public maxCents;
    uint256 public minWei;
    uint256 public maxWei;

    bool public capReached = false;
    bool public saleComplete = false;

    IPriceStrategy public pricing;

    // list of addresses that can purchase during the presale
    mapping (address => bool) public whitelist;

    // total bought by specific buyers - to check against max
    mapping (address => uint256) public totalPurchase;

    uint256 public whitelistCount;

    /**
    * @dev Log a token purchase.
    * @param purchaser The address that paid for the tokens
    * @param buyer The address that got the tokens
    * @param centsPaid The amount paid for purchase, in US cents
    * @param tokenAmount The amount of tokens purchased
    * @param totalCentsRaised Total cents raised in sale so far
    * @param totalTokensSold The total number of tokens sold so far
    */
    event TokensBought(address indexed purchaser, address indexed buyer, uint256 centsPaid, uint256 tokenAmount, uint256 totalCentsRaised, uint256 totalTokensSold);
    
    event ExternalPurchase(address indexed buyer, address indexed source, uint256 centsPaid);
    event StartTimeChanged(uint256 newTime);
    event EndTimeChanged(uint256 newTime);
    event ConversionRateChanged(uint256 newRate);
    event WalletChanged(address newWallet);
    event PaymentSourceChanged(address indexed oldSource, address indexed newSource);
    event BuyerAdded(address indexed buyer, uint256 buyerCount);
    event BuyerRemoved(address indexed buyer, uint256 buyerCount);
    event CapReached(uint256 cap, uint256 tokensSold);
    event PurchaseError(string msg, address indexed sender);

    /**
     * @dev Constructor
     *
     * @param _token The address of the PeblikToken contract
     * @param _startTime The time that the main presale period begins
     * @param _endTime The time that the presale ends; after this no more purchases are possiible
     * @param _centsPerToken The initial price per token, in terms of US cents (e.g. $0.15 would be 15)
     * @param _centsPerEth The exchange rate between US cents and ether (e.g. $950.00 would be 95000)
     * @param _cap The maximum number of tokens that can be sold duringg the presale.
     * @param _wallet The address of the ethereum wallet for collecting funds
     * @param _min The minimum amount required per purchase, in terms of US cents
     * @param _min The maximum amount that a buyer can purchase during the entire presale, in terms of US cents
     */
    function BaseTokenSale(address _token, uint256 _startTime, uint256 _endTime, uint256 _centsPerToken, uint256 _centsPerEth, uint256 _cap, uint256 _min, uint256 _max, address _wallet) public {
        require(_token != 0x0);
        require(_startTime >= now);
        require(_endTime >= _startTime);
        require(_centsPerToken > 0);
        require(_centsPerEth > 0);
        require(_cap > 0);
        require(_wallet != 0x0);
        require(_max > _min);

        owner = msg.sender;

        token = PeblikToken(_token);
        startTime = _startTime;
        endTime = _endTime;
        centsPerEth = _centsPerEth;
        tokenCap = _cap;
        wallet = _wallet;

        changeMinMax(_min, _max);
    }

    function changeMinMax(uint256 _min, uint256 _max) internal {
        minCents = _min;
        maxCents = _max;

        minWei = _min.div(centsPerEth).mul(1 ether);
        maxWei = _max.div(centsPerEth).mul(1 ether);
    }

    /**
     * @dev Fallback Function to buy the tokens
     */
    function () public payable {
        buyTokens();
    }

    /**
     * @dev Purchase tokens with Ether.
     */
    function buyTokens() whenNotPaused public payable { 
        require(validPurchase(msg.sender));
        
        uint256 weiAmount = msg.value;
        uint256 centsAmount = weiAmount.mul(centsPerEth).div(1 ether);
        //uint256 tokens = centsAmount.div(price).mul(10 ** token.decimals());

        if (!buyWithCents(msg.sender, centsAmount)) {
            revert();
        }
        centsRaised = centsRaised.add(centsAmount);
        weiRaised = weiRaised.add(weiAmount);

        // send out the funds
        wallet.transfer(weiAmount);
    }

    /**
    * @dev Allows transfer of tokens to a recipient who has purchased offline,for dollars (or other currencies converted to dollars).
    * @param _buyer The address of the recipient of the tokens
    * @param _centsAmount The purchase amount in cents (dollars * 100, with no decimal place)
    * @return bool Returns true if executed successfully.
    */
    function externalPurchase (address _buyer, uint256 _centsAmount) whenNotPaused external returns (bool) {
        require(_buyer != 0x0);
        require(validPurchase(_buyer));
        require(msg.sender == paymentSource); // transaction must come from pre-approved address

        bool success = buyWithCents(_buyer, _centsAmount);

        if (success) {
            ExternalPurchase(_buyer, msg.sender, _centsAmount);
        }
        
        return success;
    }

    function buyWithCents(address _buyer, uint256 _centsAmount) internal returns (bool success) {
        // check purchase history
        uint256 totalAmount = _centsAmount;
        uint256 newBuyer = 0;

        if (totalPurchase[_buyer] != 0) {
            totalAmount = totalAmount.add(_centsAmount);
            newBuyer = 1;
        }

        if (_centsAmount < minCents) {
            // single purchase must meet the minimum
            PurchaseError("Below minimum purchase amount.", _buyer);
            revert();
        } else if (totalAmount > maxCents) {
            // total of all purchases by a single buyer during the sale cannot exceed the max
            PurchaseError("Above maximum purchase amount.", _buyer);
            revert();
        }
        
        uint256 price = getDollarPrice(_centsAmount, centsRaised, tokensSold, _buyer);

        // Price should never be zero, but just in case.
        if (price == 0) {
            PurchaseError("Price is zero.", _buyer);
            return false;
        }

        // Convert to a token amount with decimals.
        // Note that this assumes that the token has 18 decimal places (as ours does).
        uint256 tokens = _centsAmount.mul(1 ether).div(price);
        
        // mint tokens as we go
        token.mint(_buyer, tokens);

        // update this buyer's purchase total
        totalPurchase[_buyer] = totalAmount;

        // update presale stats
        centsRaised = centsRaised.add(_centsAmount);
        tokensSold = tokensSold.add(tokens);

        TokensBought(msg.sender, _buyer, _centsAmount, tokens, centsRaised, tokensSold);

        // Finalize the PartnerSale if necessary
        if (tokensSold >= tokenCap) {
            capReached = true;
            CapReached(tokenCap, tokensSold);
        }
        return true;
    }

    // 
    // @return true if buyers can buy at the moment
    function validPurchase(address _buyer) internal view returns (bool) {
        if (now >= startTime && now <= endTime && !capReached) {
            // in main sale period
            if (isWhitelisted(_buyer)) {
                return true;
            } 
        }
        return false;
    }

    /**
    * Shut down the sale. No purchases can be accepted after this is done.
    */
    function completeSale () public onlyOwner {
        require(capReached || now > endTime); 
        saleComplete = true;
    }

    /**
    * Change the start time of the sale. For example, to delay it.
    * @param _newTime The time stamp for the sale starting time.
    */
    function changeStartTime (uint256 _newTime) public onlyOwner {
        require(_newTime < endTime); 
        require(_newTime > now); 
        require(!saleComplete);

        startTime = _newTime;
        StartTimeChanged(_newTime);
    }

    /**
    * Change the end time of the sale. For example, to extend it.
    * @param _newTime The time stamp for the sale ending time.
    */
    function changeEndTime (uint256 _newTime) public onlyOwner {
        require(_newTime > startTime); 
        require(_newTime > now); 
        require(!saleComplete);

        endTime = _newTime;
        EndTimeChanged(_newTime);
    }

    /**
    * @dev Change the ETH USD exchange rate. To be set twice daily during the sale.
    * @param _newRate The current USD per ETH rate, multiplied by 100
    */
    function changeConversionRate (uint256 _newRate) public onlyOwner {
        require(_newRate >= 10000 && _newRate <= 10000000); // sanity check
        require(!saleComplete);

        centsPerEth = _newRate;

        // keep min/max in sync
        minWei = minCents.div(centsPerEth).mul(1 ether);
        maxWei = maxCents.div(centsPerEth).mul(1 ether);

        ConversionRateChanged(centsPerEth);
    }

    /**
    * @dev Change the wallet that's used to collect funds.
    * @param _newWallet The address of the new wallet to use.
    */
    function changeWallet (address _newWallet) public onlyOwner {
        require(_newWallet != 0); 
        require(!saleComplete);

        wallet = _newWallet;
        WalletChanged(_newWallet);
    }

    /**
    * @dev Change the address from which external payments can be sent.
    * @param _newSource The address of the new wallet to use.
    */
    function changePaymentSource (address _newSource) public onlyOwner {
        require(_newSource != 0x0); 
        require(!saleComplete);
        address oldSource = paymentSource;
        paymentSource = _newSource;
        PaymentSourceChanged(oldSource, _newSource);
    }

    // MANAGE WHITELISTS ----------------------------------------------------

    function addToWhitelist(address _buyer) public onlyOwner {
        require(!saleComplete);
        require(_buyer != 0x0);
        whitelist[_buyer] = true;
        whitelistCount++;
        BuyerAdded(_buyer, whitelistCount);
    }

    function removeFromWhitelist(address _buyer) public onlyOwner {
        require(!saleComplete);
        require(_buyer != 0x0 && whitelist[_buyer]);
        whitelist[_buyer] = false; 
        whitelistCount = whitelistCount.sub(1);
        BuyerRemoved(_buyer, whitelistCount);
    }

    // @return true if buyer is whitelisted
    function isWhitelisted(address _buyer) public view returns (bool) {
        return whitelist[_buyer];
    }

    function getDollarPrice(uint256 _value, uint256 _centsRaised, uint256 _tokensSold, address _buyer) internal view returns (uint256 price) {
        return pricing.getCurrentPrice(_value, _centsRaised, _tokensSold, _buyer);
    }

    /**
     * @dev In case someone accidentally sends other ERC20 tokens to this contract,
     * add a way to get them back out.
     * @param _token The address of the type of token that was received.
     * @param _to The address to which to send the stranded tokens.
     */
    function claimStrandedTokens(address _token, address _to) public onlyOwner returns (bool) {
		ERC20Basic strandedToken = ERC20Basic(_token);
		return strandedToken.transfer(_to, strandedToken.balanceOf(this));
	}

    // -----------------------------------------------------------
    /** Testing functions, for test script and debugging use. **/
    /** These will be removed from the production contracts before deploying to mainnet. */

    function getDollarPriceExternal(uint256 _value, uint256 _centsRaised, uint256 _tokensSold, address _buyer) public view returns (uint256 price) {
        return pricing.getCurrentPrice(_value, _centsRaised, _tokensSold, _buyer);
    }

    function calcTokens(uint256 weiAmount) public view returns (uint256 value) {
        uint256 price = getDollarPrice(weiAmount, centsRaised, tokensSold, msg.sender);
        return weiAmount.mul(centsPerEth).div(price);
    }

    function calcCentsToTokens(uint256 centsAmount) public view returns (uint256 value) {
        uint256 price = getDollarPrice(centsAmount, centsRaised, tokensSold, msg.sender);
        uint256 tokens = centsAmount.mul(10 ** token.decimals()).div(price);

        return tokens;
    }

}