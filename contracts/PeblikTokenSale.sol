pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import "./IPriceStrategy.sol";
import "./SaleThresholdPricing.sol";
import "./PeblikToken.sol";
import "./BaseTokenSale.sol";

 /**
 * Manages the public crowdsale of Peblik Tokens.. In addition to all the rules defined in the BaseTokenSale superclass:
 * - defines additional wallets for transferring fund allocation after the sale ends
 * - supports a multiple-level pricing scheme where price levels are based on token sale thresholds
 */
contract PeblikTokenSale is BaseTokenSale {
    using SafeMath for uint256;

    // Customizations ------------------------

    // additional wallets where token allocations go after the sale
    address public employeePoolWallet;
    address public advisorPoolWallet;
    address public bountyProgramWallet;

    // NOTE: we await a decision about whether these amounts need to be changeable 
    uint256 public employeePoolAmount = 360000000e18;
    uint256 public advisorPoolAmount = 120000000e18;
    uint256 public bountyProgramAmount = 120000000e18;

    //event ResourceReserveWalletChanged(address newWallet);
    //event PublicReserveWalletChanged(address newWallet);
    event EmployeeWalletChanged(address newWallet); 
    event AdvisorWalletChanged(address newWallet); 
    event BountyWalletChanged(address newWallet); 

    //event PricesChanged(uint256 level1, uint256 level2, uint256 level3, uint256 level4);

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
    function PeblikTokenSale(address _token, uint256 _startTime, uint256 _endTime, uint256 _centsPerToken, uint256 _centsPerEth, uint256 _cap, uint256 _min, uint256 _max, address _wallet, uint256[] _thresholds, uint256[] _prices) BaseTokenSale(_token, _startTime,  _endTime, _centsPerToken, _centsPerEth, _cap, _min, _max, _wallet) public {
        pricing = new SaleThresholdPricing(_thresholds, _prices);
    }

    /**
    * @dev Override to mint tokens for post-sale allocations.
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

}