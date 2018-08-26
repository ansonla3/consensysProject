var Survey = artifacts.require("./Survey.sol");

module.exports = deployer => {
	deployer.deploy(Survey)
	// deployer.deploy(EIP20, 10000, 'Simon Bucks', 1, 'SBX')
}


// const EIP20Factory = artifacts.require('./EIP20Factory.sol')

// module.exports = deployer => {
// 	deployer.deploy(EIP20Factory)
// }
