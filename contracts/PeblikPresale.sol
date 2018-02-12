pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
//import "../node_modules/zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import "./IPriceStrategy.sol";
import "./FlatPricing.sol";
import "./BaseTokenSale.sol";
import "./PeblikToken.sol";

/**
 * Manages the Peblik Token Presale. In addition to all the rules defined in the BaseTokenSale superclass:
 * - defines an additional "early bird" period so buyers in the early list can purchase ahead of the main sale phase
 */
contract PeblikPresale is BaseTokenSale {
    using SafeMath for uint256;

    // Customizations ------------------------

    // The time that the optional Early Bird period starts
    uint256 public earlyTime;

    // list of addresses that can purchase before presale opens
    mapping (address => bool) public earlylist;

    uint256 public earlylistCount;

    /**
     * @dev Keeps track of when price changes occurred, to help with reporting and customer suppport inquiries.
     */
    RateHistory[] public priceHistory;

    event EarlyBuyerAdded(address buyer, uint256 buyerCount);

    event PriceChanged(uint256 newPrice);

    /**
     * @dev Constructor
     *
     * @param _token The address of the PeblikToken contract
     * @param _earlyTime The time that the early bird period begins
     * @param _startTime The time that the main presale period begins
     * @param _endTime The time that the presale ends; after this no more purchases are possiible
     * @param _centsPerToken The initial price per token, in terms of US cents (e.g. $0.15 would be 15)
     * @param _centsPerEth The exchange rate between US cents and ether (e.g. $950.00 would be 95000)
     * @param _cap The maximum number of tokens that can be sold duringg the presale.
     * @param _wallet The address of the ethereum wallet for collecting funds
     * @param _min The minimum amount required per purchase, in terms of US cents
     * @param _min The maximum amount that a buyer can purchase during the entire presale, in terms of US cents
     */
    function PeblikPresale(address _token, uint256 _earlyTime, uint256 _startTime, uint256 _endTime, uint256 _centsPerToken, uint256 _centsPerEth, uint256 _cap, uint256 _min, uint256 _max, address _wallet) public {
        require(_token != 0x0);
        require(_earlyTime >= now);
        require(_startTime >= _earlyTime);
        require(_endTime >= _startTime);
        require(_centsPerToken > 0);
        require(_centsPerEth > 0);
        require(_cap > 0);
        require(_wallet != 0x0);
        require(_max > _min);

        owner = msg.sender;

        token = PeblikToken(_token);
        earlyTime = _earlyTime;
        startTime = _startTime;
        endTime = _endTime;
        centsPerEth = _centsPerEth;
        tokenCap = _cap;
        wallet = _wallet;

        changeMinMax(_min, _max);

        pricing = new FlatPricing(_centsPerToken);
    }

    /** 
     * @dev Overrides validPurchase to add earlylist check. 
     * @return true if buyers can buy at the moment
     */
    function validPurchase(address _buyer) internal view returns (bool) {
        if (now >= earlyTime && now <= endTime && !capReached) {
            if (now < startTime) {
                // in early period
                if (isEarlylisted(_buyer)) {
                    return true;
                }
            } else {
                // in main sale period
                if (isListed(_buyer)) {
                    return true;
                } 
            }
        }
        return false;
    }

    /**
    * @dev Change the price per token for the current phase of the sale.
    * @param _newPrice The new price, as cents per token
    */
    function changePrice(uint256 _newPrice) public onlyOwner {
        require(_newPrice > 0);
        require(!saleComplete);

        pricing.changePrice(_newPrice);
        priceHistory.push(RateHistory(now, _newPrice));

        PriceChanged(_newPrice);
    }

    // MANAGE WHITELISTS ----------------------------------------------------
    function addToEarlylist(address _buyer) public onlyOwner {
        require(!saleComplete);
        require(_buyer != 0x0);
        earlylist[_buyer] = true; 
        earlylistCount++;
        BuyerAdded(_buyer, earlylistCount);
    }

    // @return true if buyer is earlylisted
    function isEarlylisted(address _buyer) public view returns (bool) {
        return earlylist[_buyer];
    }

        // @return true if buyer is listed at all
    function isListed(address _buyer) public view returns (bool) {
        return (whitelist[_buyer] || earlylist[_buyer]);
    }
}