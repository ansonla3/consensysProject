# Background
### This is a survey smart contract, anyone can create a questionnaire (only allow YES/NO question at this stage) and reward to the participants by Ether. 


### Running the Dapp locally

Node Version: v8.7

The smart contract has been deployed to the Rinkeby testnet. Please do the following steps to interact with the smart contract.

* Download the project, `git clone https://github.com/ansonla3/consensysProject`
* `cd consensysProject`
* Install all the packages, `npm install`
* Start the app, `npm run dev`
* When the app is ready, go to http://localhost:3000


### Running the Tests

Make sure install the ganache-cli. If not, run `npm install -g ganache-cli`

* To start the ganache, `ganache-cli`
* Go to the consensys project, `cd consensyProject`
* Compile contracts, `truffle compile`
* Migrate contracts, `truffle migrate`
* Execute all tests, `truffle test ./test/questionnaire`

### Questions
Please free feel to open an issue in this repo if you have any questions.
