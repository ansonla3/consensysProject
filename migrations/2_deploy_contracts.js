var Survey = artifacts.require("./Survey.sol");
var Registry = artifacts.require("./Registry.sol");

module.exports = deployer => {
	deployer.deploy(Registry)
	deployer.deploy(Survey)
}