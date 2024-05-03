// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract IPFS {
    uint256 Registration;
    address payable public systemAccount;

    event Register(address indexed sender, address receiver, uint256 amount, uint256 timestamp);

    struct Groups {
        string name;
        string description;
        address prv_key;
        address pub_key;
        address owner;
        address system_account;
        address[] members;
    }
    Groups[] groups;

    struct Registered_User {
        address user;
        bytes32[] transactions; // Change string[] to bytes32[]
    }

    Registered_User[] public registeredUsers;

    function registerUser(address _to, uint256 _amount) external payable {
        require(msg.value == _amount, "Insufficient Ether sent");

        // Add the user's address to registered users
        registeredUsers.push(Registered_User(msg.sender, new bytes32[](0)));

        // Transfer amount to the specified address
        payable(_to).transfer(_amount);

        // Log the transaction hash
        registeredUsers[registeredUsers.length - 1].transactions.push(blockhash(block.number));
        

        emit Register(msg.sender, _to, _amount, block.timestamp);
    }

    function getRegisteredUsers() external view returns (Registered_User[] memory) {
        return registeredUsers;
    }
}
