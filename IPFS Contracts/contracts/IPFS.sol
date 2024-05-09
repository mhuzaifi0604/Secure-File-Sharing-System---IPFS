// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract IPFS {
    struct Groups {
        string name;
        string description;
        string prv_key;
        string pub_key;
        address owner;
        address system_account;
        string[] members;
        string []filenames;
        string []filepaths;
    }

    Groups[] groups;

    event GroupCreated(
        string name,
        string description,
        string prv_key,
        string pub_key,
        address owner,
        address system_account,
        string[] members
    );
    event Register(address indexed sender, address receiver, uint256 amount, uint256 timestamp , Registered_User[] registeredUsers);
    event AddFilesToGroup(Groups group);
    event returnusergroups(Groups[] userGroups);
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
        registeredUsers[registeredUsers.length - 1].user = msg.sender;
        registeredUsers[registeredUsers.length - 1].transactions.push(blockhash(block.number));
        
        emit Register(msg.sender, _to, _amount, block.timestamp, registeredUsers);
    }

    function getRegisteredUsers() external view returns (Registered_User[] memory) {
        return registeredUsers;
    }
    function clearRegisteredUsers() public {
        for (uint i = 0; i < registeredUsers.length; i++) {
            delete registeredUsers[i];
        }
    }
    function createGroup(
        string memory groupName,
        string memory groupDescription,
        address userAccount,
        address system_account,
        string memory privateKey,
        string memory publicKey
    ) external payable {
        Groups memory newGroup = Groups({
            name: groupName,
            description: groupDescription,
            prv_key: privateKey,
            pub_key: publicKey,
            owner: userAccount,
            system_account: system_account,
            members: new string[](0),
            filenames: new string[](0),
            filepaths: new string[](0)
        });

        groups.push(newGroup);

        emit GroupCreated(
            newGroup.name,
            newGroup.description,
            newGroup.prv_key,
            newGroup.pub_key,
            newGroup.owner,
            newGroup.system_account,
            newGroup.members
        );
    }
    function addFilesToGroup(string memory groupname, string memory names, string memory paths) public {
    uint256 groupIndex = 0;
    for (uint256 i = 0; i < groups.length; i++) {
        if (keccak256(abi.encodePacked(groups[i].name)) == keccak256(abi.encodePacked(groupname))) {
            groupIndex = i;
            break;
        }
    }
        groups[groupIndex].filenames.push(names);
        groups[groupIndex].filepaths.push(paths);
    
    emit AddFilesToGroup(groups[groupIndex]);
}

function getGroupFiles(string memory groupname) public {
    uint256 groupIndex = 0;
    for (uint256 i = 0; i < groups.length; i++) {
        if (keccak256(abi.encodePacked(groups[i].name)) == keccak256(abi.encodePacked(groupname))) {
            groupIndex = i;
            break;
        }
    }
    emit AddFilesToGroup(groups[groupIndex]);
}


    function getGroups() public view returns (Groups[] memory) {
        return groups;
    }
    function getuserGroups(address useraccount) public {
    Groups[] memory userGroups;
    for(uint256 i = 0; i < groups.length; i++) {
        if(groups[i].owner == useraccount) {
            userGroups = appendGroup(userGroups, groups[i]);
        }
        for(uint256 j = 0; j < groups[i].members.length; j++) {
            if(address(uint160(uint256(keccak256(abi.encodePacked(groups[i].members[j]))))) == useraccount) {
                userGroups = appendGroup(userGroups, groups[i]);
            }
        }
    }
    emit returnusergroups(userGroups);
}

function appendGroup(Groups[] memory arr, Groups memory group) private pure returns (Groups[] memory) {
    Groups[] memory newArr = new Groups[](arr.length + 1);
    for(uint256 i = 0; i < arr.length; i++) {
        newArr[i] = arr[i];
    }
    newArr[arr.length] = group;
    return newArr;
}
    function deleteGroups() public returns (string memory) {
        for(uint i = 0; i < groups.length; i++) {
            groups.pop();
        }
        return "All groups deleted";
    }
    function addMemberstoGroup(string memory groupname, string memory member) public {
    uint256 groupIndex = 0;
    for (uint256 i = 0; i < groups.length; i++) {
        if (keccak256(abi.encodePacked(groups[i].name)) == keccak256(abi.encodePacked(groupname))) {
            groupIndex = i;
            break;
        }
    }
    groups[groupIndex].members.push(member);
    emit AddFilesToGroup(groups[groupIndex]);
    }
}
