# Terra Smart Contract Tutorial

Contains a smart contract (inside contract directory) and a Reactjs client to interact with it (inside client directory)

## How to run it

Go into client, "npm install" and "npm start" to run the client.

## Contract Details
1. The contract is uploaded to the Bombay testnet: https://finder.terra.money/bombay-11/account/terra170sgpkzdggel0nuswyrrdrdr56zys4ver3gjpj.
2. Contains a query API of syntax {"get_balance": {"address": "terra1e74tlj8gqvcxf0x8tkl3jp35vxr3evkf5gp3m0"}}.
3. Contains execute APIs for deposit and withdraw, with syntaxes: {"deposit": {}} and {"withdraw": {"amount": 500}}.
4. Since the withdraw execution requires fee from the contract, an initial amount of 500UST had been deposited into the contract. In future, it would make more sense to create a mechanism for charging the fee from the withdrawer, not the contract. E.g. contract calculates fee and makes sure that the withdraw request sends that amount, or decline the execution.
