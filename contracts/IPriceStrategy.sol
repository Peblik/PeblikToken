pragma solidity ^0.4.18;

/**
 * Interface for defining crowdsale pricing.
 */
interface IPriceStrategy {

  /** Interface declaration. */

  function changePrice(uint256 _newPrice) public returns (bool success);

  /**
   * @dev Caclulates the effective price for a sale transaction.
   *
   * @param _value The amount that was sent in, in wei
   * @param _tokensSold The total tokens sold in the sale so far
   * @param _totalRaised The total wei or fiat raised in the sale so far
   * @param _msgSender The address of the purchaser
   * @return The effective price (in term of price per token)
   */
  function getCurrentPrice(uint256 _value, uint256 _totalRaised, uint256 _tokensSold, address _msgSender) public view returns (uint256 pricePerToken);
}
