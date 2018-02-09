pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import "./IPriceStrategy.sol";
import "./SaleThresholdPricing.sol";
import "./PeblikToken.sol";

// TODO: Extract commonalities between this and PeblikPresale.sol into a common superclass.

/**
 * Manages the public crowdsale of PeblikTokens.
 */
contract PeblikTokenSale is Ownable {
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

    // additional wallets where token allocations go after the sale
    address public employeePoolWallet;
    address public advisorPoolWallet;
    address public bountyProgramWallet;

    // NOTE: we await a decision about whether these amounts need to be changeable 
    uint256 public employeePoolAmount = 360000000e18;
    uint256 public advisorPoolAmount = 120000000e18;
    uint256 public bountyProgramAmount = 120000000e18;
    
    // NOTE: we await a business decision about whether reserve tokens should be pre-minted and sent to wallets, 
    // or just managed in the token contract itself as limits on available supply
    //address resourceReserveWallet;
    //address publicReserveWallet;
    //uint256 public resourceReserveAmount = 960000000e18;
    //uint256 public publicReserveAmount = 350000000e18;

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
    uint256 public buyerCount;

    struct RateHistory {
        uint256 rate;
        uint256 timestamp;
    }

    RateHistory[] public conversionHistory;

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
    //event ResourceReserveWalletChanged(address newWallet);
    //event PublicReserveWalletChanged(address newWallet);
    event EmployeeWalletChanged(address newWallet);
    event AdvisorWalletChanged(address newWallet);
    event BountyWalletChanged(address newWallet);

    event PaymentSourceChanged(address newSource);

    event BuyerAdded(address buyer, uint256 buyerCount);

    event PricesChanged(uint256 level1, uint256 level2, uint256 level3, uint256 level4);

    event CapReached(uint256 cap, uint256 tokensSold);

    event PurchaseError(string msg);

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
     * @param _thresholds An array of tokens-sold amounts that trigger new price levels
     * @param _prices An array of price-per-token values corresponding to the sales thresholds
     */
    function PeblikTokenSale(address _token, uint256 _startTime, uint256 _endTime, uint256 _centsPerToken, uint256 _centsPerEth, uint256 _cap, uint256 _min, uint256 _max, address _wallet, uint256[] _thresholds, uint256[] _prices) public {
        require(_token != 0x0);
        require(_startTime > now);
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

        pricing = new SaleThresholdPricing(_thresholds, _prices);
    }

    function changeMinMax(uint256 _min, uint256 _max) internal {
        minCents = _min;
        maxCents = _max;

        minWei = _min.div(centsPerEth).mul(1 ether);
        maxWei = _max.div(centsPerEth).mul(1 ether);
    }

    /*****
    * Fallback Function to buy the tokens
    */
    function () public payable {
        buyTokens();
    }

    /**
     * @dev Purchase tokens for Ether.
     */
    function buyTokens() public payable {
        require(validPurchase(msg.sender));

        uint256 weiAmount = msg.value;
        if (weiAmount < minWei)
        {
            PurchaseError("Below minimum purchase amount.");
            revert();
        } else if (weiAmount > maxWei) {
            PurchaseError("Above maximum purchase amount.");
            revert();
        }

        uint256 ethAmount = weiAmount.div(1 ether); 
        uint256 centsAmount = ethAmount.mul(centsPerEth);

        if (!buyWithCents(msg.sender, centsAmount)) {
            revert();
        }
        centsRaised = centsRaised.add(centsAmount);
        weiRaised = weiRaised.add(weiAmount);

        // send out the funds
        wallet.transfer(weiAmount);
    }

    /**
    * Allows transfer of tokens to a recipient who has purchased offline,for dollars (or other currencies converted to dollars).
    * @param _buyer The address of the recipient of the tokens
    * @param _centsAmount The purchase amount in cents (dollars * 100, with no decimal place)
    * @return bool Returns true if executed successfully.
    */
    function externalPurchase (address _buyer, uint256 _centsAmount) external returns (bool) {
        require(validPurchase(_buyer));
        require(msg.sender == paymentSource); // transaction must come from pre-approved address
        require(_buyer != 0x0);

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
            PurchaseError("Below minimum purchase amount.");
            revert();
        } else if (totalAmount > maxCents) {
            // total of all purchases by a single buyer during the sale cannot exceed the max
            PurchaseError("Above maximum purchase amount.");
            revert();
        }

        uint256 price = getDollarPrice(_centsAmount, centsRaised, tokensSold, _buyer);

        // Price should never be zero, but just in case.
        if (price == 0) {
            PurchaseError("Price is zero.");
            return false;
        }

        // Convert to a token amount with decimals 
        uint256 tokens = (_centsAmount.div(price)).mul(10 ** token.decimals());

        // mint tokens as we go
        token.mint(_buyer, tokens);

        // update this buyer's purchase total
        totalPurchase[_buyer] = totalAmount;
        // keep count of unique buyer addresses
        buyerCount = buyerCount.add(newBuyer);

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

        // allocate and transfer all allocations to other wallets
        token.mint(employeePoolWallet, employeePoolAmount);
        token.mint(advisorPoolWallet, advisorPoolAmount);
        token.mint(bountyProgramWallet, bountyProgramAmount);
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
        
        conversionHistory.push(RateHistory(now, _newRate));
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
    * @dev Change the wallet used for the Resource Reserve.
    * @param _newWallet The address of the new wallet to use.
    */
    /*
    function changeResourceReserveWallet (address _newWallet) public onlyOwner {
        require(_newWallet != 0); 
        require(!saleComplete);

        resourceReserveWallet = _newWallet;
        ResourceReserveWalletChanged(_newWallet);
    }
    */
    /**
    * @dev Change the wallet used for the Public Reserve.
    * @param _newWallet The address of the new wallet to use.
    */
    /*
    function changePublicReserveWallet (address _newWallet) public onlyOwner {
        require(_newWallet != 0); 
        require(!saleComplete);

        publicReserveWallet = _newWallet;
        PublicReserveWalletChanged(_newWallet);
    }
    */

    /**
    * @dev Change the wallet used for the employee pool. (This should be directed to an employee vesting contract).
    * @param _newWallet The address of the new wallet to use.
    */
    function changeEmployeePoolWallet (address _newWallet) public onlyOwner {
        require(_newWallet != 0); 
        require(!saleComplete);

        employeePoolWallet = _newWallet;
        EmployeeWalletChanged(_newWallet);
    }

        /**
    * @dev Change the wallet used for the advisor pool. (This should be directed to a token vesting contract).
    * @param _newWallet The address of the new wallet to use.
    */
    function changeAdvisorPoolWallet (address _newWallet) public onlyOwner {
        require(_newWallet != 0); 
        require(!saleComplete);

        advisorPoolWallet = _newWallet;
        AdvisorWalletChanged(_newWallet);
    }

    /**
    * @dev Change the wallet used for the Bounty Program. 
    * (This may go to a smart contract that manages the progam; or just to a multisig wwallet used to disburse funds).
    * @param _newWallet The address of the new wallet to use.
    */
    function changeBountyProgramWallet (address _newWallet) public onlyOwner {
        require(_newWallet != 0); 
        require(!saleComplete);

        bountyProgramWallet = _newWallet;
        BountyWalletChanged(_newWallet);
    }

    /**
    * @dev Change the address from which external payments can be sent.
    * @param _newSource The address of the new wallet to use.
    */
    function changePaymentSource (address _newSource) public onlyOwner {
        require(_newSource != 0); 
        require(!saleComplete);

        paymentSource = _newSource;
        PaymentSourceChanged(_newSource);
    }

    /**
     * @dev Change the price per token for the current phase of the sale.
     * @param _thresholds An array of tokens-sold amounts that trigger new price levels
     * @param _prices An array of price-per-token values corresponding to the sales thresholds
     */
    function changePrices(uint256[] _thresholds, uint256[] _prices) public onlyOwner {
        SaleThresholdPricing(pricing).changeLevels(_thresholds, _prices);
    }

    // MANAGE WHITELISTS ----------------------------------------------------

    /**
     * @dev All participants in the public sale must be in the whitelist before they purchase. 
     * Depending on their country, some participants will be required to provide KYC information, 
     * or even qualify as accredited investors, before they will be added to thew whitelist.
     * Participants can be added to the whitelist during the sale, but not after it is closed.
     * @param _buyer The buyer's address to be added to the whitelist.
     */
    function addToWhitelist(address _buyer) public onlyOwner {
        require(!saleComplete);
        require(_buyer != 0x0);
        whitelist[_buyer] = true;
        whitelistCount++;
        BuyerAdded(_buyer, whitelistCount);
    }

    // @return true if buyer is whitelisted
    function isWhitelisted(address _buyer) public view returns (bool) {
        return whitelist[_buyer];
    }

    function getDollarPrice(uint256 _value, uint256 _centsRaised, uint256 _tokensSold, address _buyer) internal view returns (uint256 price) {
        return pricing.getCurrentPrice(_value, _centsRaised, _tokensSold, _buyer);
    }
}