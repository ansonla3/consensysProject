Fail early and fail loud
In Survey.sol, most of functions require user's input that has require() statement to check it before submit the transaction to the Ethereum network, which is great. It is because users can identify their transactions will be failed at the very beginning (Users without waste any gas cost).

Restricting Access
In Survey.sol, toggleContractStopped() function is using a modifier to check the sender whether it is the contract owner.Just imigaine if this function allows everyone able to execute that could  potentialy make the Dapp stuck, therfore only "onlyOwner" is allowed to make a change to restricting non-admin people.

Circuit Breaker
In Survey.sol, createQuestionnaire() function has used the haltInEmergency modifier, which means if some emergency is happened (e.g. we want to upgrade the contract to a new version), the contract state will be stopped to allow people to create questionnaire.