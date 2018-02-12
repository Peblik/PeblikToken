pragma solidity ^0.4.18;

import "./IPriceStrategy.sol";
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * Manages a schedule of prices based on total tokens sold during a crowdsale.
 */
contract SaleThresholdPricing is IPriceStrategy, Ownable {

    using SafeMath for uint256;

    uint256 public numLevels;
    
    struct PriceLevel {
        uint256 threshold;
        uint256 dollarPrice;
    }
    
    PriceLevel[] public levels;

    event PriceLevelsChanged(uint256 numLevelsAdded);

    function SaleThresholdPricing(uint256[] _thresholds, uint256[] _prices) public {

        changeLevels(_thresholds, _prices);
    }

    function changePrice(uint256 _newPrice) public onlyOwner returns (bool success) {
        // doesn't make sense to just change one price in this pricing model
        return false;
    }

    function changeLevels(uint256[] _thresholds, uint256[] _prices) public onlyOwner {
        require(_thresholds.length <= 8 && _prices.length <= 8); // keep the levels limited
        require(_thresholds[0] == 0); // must have a default level
        require(_thresholds.length == _prices.length); // arrays must have same number of entries

        uint256 prevAmount = 0;
        // Loops are costly, but  the length of the array is limited so we can live with it.
        for (uint8 i = 0; i < _thresholds.length; i++) {
           
            // Check that all thresholds are increasing
            if (_thresholds[i] <= prevAmount) {
                revert();
            }
            // Prices must be non-zero
            if (_prices[i] <= 0) {
                revert();
            }

            levels[i] = PriceLevel(_thresholds[i], _prices[i]);
        }
        numLevels = levels.length;

        PriceLevelsChanged(numLevels);
    }

    function getPriceLevels() public view returns (PriceLevel[] _levels) {
        return levels;
    }

    /**
    * Caclulates the effective price for a sale transaction.
    *
    * @param _value The amount that was sent in, in wei
    * @param _tokensSold The total tokens sold in the sale so far
    * @param _totalRaised The total wei or fiat raised in the sale so far
    * @param _msgSender The address of the purchaser
    * @return The effective price per token
    */
    function getCurrentPrice(uint256 _value, uint256 _totalRaised, uint256 _tokensSold, address _msgSender) public view returns (uint256 pricePerToken) {
        require(_tokensSold >= 0);

        uint256 index;
        for (index = levels.length - 1; index >= 0; index--) {
           
            // Find the highest threshold that's been passed.
            // Note that this should always succeed for level[0], since that threshold should always be zero.
            if (_tokensSold >= levels[index].threshold) {
                break;
            }
        }
        return levels[index].dollarPrice;
    }
}