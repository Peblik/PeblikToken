pragma solidity ^0.4.18;

import "./IPriceStrategy.sol";
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * Simple flat price strategy. Price can be updated over time.
 */
contract FlatPricing is IPriceStrategy, Ownable {

    using SafeMath for uint256;

    uint256 public price;

    event PriceChanged(uint256 newPrice);

    function FlatPricing(uint256 _initialPrice) public {
        require(_initialPrice > 0);
        price = _initialPrice;
    }

    function changePrice(uint256 _newPrice) public onlyOwner returns (bool success) {
        if (_newPrice <= 0) {
            return false;
        }
        price = _newPrice;
        PriceChanged(_newPrice);
        return true;
    }

    function changeLevels(uint256[] _thresholds, uint256[] _prices) public { 
        //does not do anything for flat pricing;
        return;
    }

    /**
    * Caclulates the effective price for a sale transaction.
    *
    * @param _value The amount that was sent in, in wei
    * @param _tokensSold The total tokens sold in the sale so far
    * @param _totalRaised The total wei or fiat raised in the sale so far
    * @param _msgSender The address of the purchaser
    * @return The effective price (in term of price per token)
    */
    function getCurrentPrice(uint256 _value, uint256 _totalRaised, uint256 _tokensSold, address _msgSender) public view returns (uint256 pricePerToken) {
        return price;
    }

}