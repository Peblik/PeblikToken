# Peblik Token Smart Contracts

Solidity smart contracts and administrative web pages for the Peblik Token, presale, and public sale.

## Token and Sale Requirements

The smart contracts are built to satisfy the following set of requirements:

* R-001 PeblikToken contract MUST follow ERC-20 standard
* R-002 Define token name; symbol; totalSupply
* R-003 Future allocation pool of 350 million to be reserved for later issuance.
* R-004 Resource acquisition pool of 960 million to be reserved for future use
* R-005 MUST be able to withdraw Ether or tokens inadvertently sent to the token contract.
* R-006 Max supply can be increased in the future
* R-007 Token sale has 3 phases: private placement; pre-sale; public sale
* R-008 MUST be able to issue tokens for people who paid with fiat during private placement
* R-009 Private placement buyers SHOULD be KYC-whitelisted priot to receiving tokens
* R-010 Private placement will sell 120 mln tokens at $0.05 or $0.10 each
* R-011 Pre-Sale will sell 50 mln tokens at $0.15 each
* R-012 Pre-sale participants must be KYC-whitelisted prior to sale start
* R-013 Pre-Sale minimum is 1 ETH; maximum is 200 ETH
* R-014 Pre-sale closes after a contribution takes it over 120 mln sold; or after 2 weeks
* R-015 MIGHT enable an Early Bird pre-sale phase to give a random subse at first chance at buying
* R-016 Public sale will sell 200 million tokens at prices from $0.25 to $0.50 each
* R-017 Public sale uses 4 level discount scheme based on total tokens sold
* R-018 Public sale runs until all 200 mln tokens are sold or for 4 weeks (unless time is extended).
* R-019 If public sale ends before reaching 200 mln cap unsold tokens go to the Future Allocation pool.
* R-020 Token price per ETH will be set at start of Presale and daily therafter
* R-021 Only direct ETH contributions will be accepted during the Presale
* R-022 During Public Sale contributions will be accepted in other cryptocurrencies as well
* R-023 MUST be able tp pause Presale and Public Sale in case of emergency
* R-024 Listenable events should happen for each purchase during Presale and Public Sale
* R-025 Listenable events should happen when token supply or allocations change
* R-026 Listenable events should happen when Presale or Public Sale state changes
* R-027 MUST be able to extend closing dates for Presale or Public Sale
* R-028 MUST be able to change the discount schedule during the Public Sale.
* R-029 When public sale closes send 480 million tokens to team and advisors vesting contract
* R-030 After public sale closes MUST be able to send tokens to biz dev partners and bounty participants.
* R-031 During Presale forward funds from contract to multisig funds wallet
* R-032 During public sale forward funds to multisig funds wallet
* R-033 After public sale refund addresses that have not submitted KYC
* R-034 After public sale owner MUST finalize sale triggering token distribution to other allocations

## Build Notes

This project uses Truffle and Node.js. You'll want to install the following node modules to get things working:

To install the OpenZeppelin base contracts:
```
npm install zeppelin-solidity
```
To use Infura.io networks:
```
npm install truffle-hdwallet-provider
```
To run the web interface locally, first install the lite server: 
```
npm install lite-server
```
Then run it: 
```
npm run dev
```