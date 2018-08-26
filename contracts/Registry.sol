pragma solidity 0.4.24;

import "./Ownable.sol";

/// @title Registry Smart Contract
/// @author Anson Lau
/// @notice This contract is for upgrading the smart contract 
///         to a new version

contract Registry is Ownable {
    // Current smart contract address
    address public backendContract;

    // Store all previous version contract address
    address [] previousBackends;
    
    // assign the admin right to the contract creator
    constructor() public {
        owner = msg.sender;
    }

    /// @notice all storage will not be carrying out to the new contract 
    /// @dev call this function to update after you deployed the new version 
    /// @param newBackend the latest deployed contract address
    /// @return True if contract address is changed
    function changeBackend(address newBackend) public onlyOwner returns (bool) {
        if(newBackend != backendContract) {
            previousBackends.push(backendContract);
            backendContract = newBackend;
            return true;
        }
        return false;
    }
}