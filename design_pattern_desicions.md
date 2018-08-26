Mapping Iterator
Many times we need to iterate a mapping, but since mappings in Solidity cannot be iterated and they only store values, the Mapping Iterator pattern turns out to be extremely useful.Some things to keep in mind are that as elements count goes up the complexity of iteration will increase, as well as the storage cost, so avoid iterating when possible. For example, when you want to know a participant has he/she claimed the reward, it is better to use mapping(with the questionnaireHash and participant address) to check instead of iterating to check it in smart contract.

Circuit Breaker
In Survey.sol, createQuestionnaire() function has used the haltInEmergency modifier, which means if some emergency is happened (e.g. we want to upgrade the contract to a new version), the contract state will be stopped to allow people to create questionnaire.
