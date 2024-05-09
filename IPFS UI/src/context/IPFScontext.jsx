import React, { useEffect, useState, useCallback, useReducer } from 'react'
import { decodeBytes32String, ethers, parseEther } from 'ethers'
import Web3 from 'web3'
// import IPFS from './Ethcontext'
import { actions, reducer, initialState } from './state'
import { contractABI, contractAddress } from '../utils/constants'

const { ethereum } = window
export const IPFS = React.createContext({});


const getEthereumcontract = async () => {
  const provider = new ethers.BrowserProvider(ethereum)
  const signer = await provider.getSigner()
  const ipfsContract = new ethers.Contract(contractAddress, contractABI, provider)

  return ipfsContract
}


export const IPFSProvider = ({ children }) => {
  const [emittedData, setEmittedData] = useState(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  const [accounts, setAccounts] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [systemaccount, set_system_account] = useState('')
  const [group_data, setgroupdata] = useState(null)
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    private_key: '',
    public_key: '',
  });
  const [group_accs, set_group_accs] = useState({})
  const [txHash, setTxHash] = useState('')
  const [loading, setloading] = useState(false)

  const [existingGroupsincontract, setexistingGroups] = useState(null);

  const ConnectWallet = () => {
    if (ethereum) {
      ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          setAccounts(accounts)
        })
        .catch(err => {
          console.log(err)
          seterror("Install MetaMask Please!!")
        })
    }
  }

  const RegisterUser = async () => {
    const web3 = new Web3(ethereum);
    let decodedData;
    try {
      if (!ethereum) {
        return alert("Install MetaMask Please!!")
      }

      const data = web3.eth.abi.encodeFunctionCall({
        name: 'registerUser',
        type: 'function',
        inputs: [{
          type: 'address',
          name: '_to'
        }, {
          type: 'uint256',
          name: '_value'
        }]
      }, [inputValue, ethers.parseEther('1')]);

      console.log("Data: ", data)

      const transaction = await ethereum.request({
        method: 'eth_sendTransaction', params: [{
          from: inputValue,
          to: contractAddress,
          data: data,
          value: ethers.parseEther('1').toString(16)
        }]
      })

      const receipt = await web3.eth.getTransactionReceipt(transaction);
      console.log("Reciept: ", receipt)

      for (const item of contractABI) {
        if (item.type === 'event' && item.name === 'Register') {
          try {
            decodedData = await web3.eth.abi.decodeLog(
              item.inputs,
              receipt.logs[0].data,
              receipt.logs[0].topics.slice(1)
            );
            setEmittedData(decodedData);
            // Update the state with the decoded data
            // setEmitter(decodedData);
            // Exit the loop after setting emitters
            return "User Registered"
          } catch (error) {
            console.log("Error Decoding Data: ", error);
          }
        }
      }
      console.log("Loading - Transaction: ", transaction)
    } catch (error) {
      console.error("Error Sending Transaction: ", error)
    }

  }

  const CreateGroups = async (public_key, private_key) => {
    console.log("This is Group Creation Function!")
    const web3 = new Web3(ethereum);
    let decodedData;
    try {
      if (!ethereum) {
        return alert("Install MetaMask Please!!")
      }
      const data = web3.eth.abi.encodeFunctionCall({
        name: 'createGroup',
        type: 'function',
        inputs: [{
          type: 'string',
          name: 'groupName'
        }, {
          type: 'string',
          name: 'groupDescription'
        }, {
          type: 'address',
          name: 'userAccount'
        }, {
          type: 'address',
          name: 'system_account'
        }, {
          type: 'string',
          name: 'privateKey'
        }, {
          type: 'string',
          name: 'publicKey'
        }]
      }, [formData.group_name, formData.description, group_accs.useraccount, group_accs.systemaccount, private_key, public_key]);

      console.log("Data: ", data)

      const transaction = await ethereum.request({
        method: 'eth_sendTransaction', params: [{
          from: inputValue,
          to: contractAddress,
          data: data,
          value: ethers.parseEther('1').toString(16),
        }]
      })

      const receipt = await web3.eth.getTransactionReceipt(transaction);
      console.log("Reciept: ", receipt)

      for (const item of contractABI) {
        if (item.type === 'event' && item.name === 'GroupCreated') {
          try {
            decodedData = await web3.eth.abi.decodeLog(
              item.inputs,
              receipt.logs[0].data,
              receipt.logs[0].topics.slice(1)
            );
            console.log("group created in contract: ", decodedData)
            // setgroupdata(decodedData);
            return decodedData
          } catch (error) {
            console.log("Error Decoding Data: ", error);
          }
        }
      }
      console.log("Loading - Transaction: ", transaction)
    } catch (error) {
      console.error("Error Sending Transaction: ", error)
    }
    console.log("Decoded group data: ", decodedData)
  }

  const AddFilesToGroup = async (groupname, names, paths) => {
    console.log("Groupname:", groupname, "Names: ", names, "Paths: ", paths)
    let decodedFiles;
    const web3 = new Web3(ethereum);
    if (!ethereum) {
      return alert("Install MetaMask Please!!")
    }
    const data = web3.eth.abi.encodeFunctionCall({
      name: 'addFilesToGroup',
      type: 'function',
      inputs: [{
        type: 'string',
        name: 'groupname'
      }, {
        type: 'string',
        name: 'names'
      }, {
        type: 'string',
        name: 'paths'
      }]
    }, [groupname, names, paths]);

    const transaction = await ethereum.request({
      method: 'eth_sendTransaction', params: [{
        from: inputValue,
        to: contractAddress,
        data: data,
        // value: ethers.parseEther('1').toString(16),
        gas: '500000'
      }]
    })

    const receipt = await web3.eth.getTransactionReceipt(transaction);

    for (const item of contractABI) {
      if (item.type === 'event' && item.name === 'AddFilesToGroup') {
        try {
          console.log("Getting files event and decoding it")
          decodedFiles = await web3.eth.abi.decodeLog(
            item.inputs,
            receipt.logs[0].data,
            receipt.logs[0].topics.slice(1)
          );
          console.log("Files Returned From Contract: ", decodedFiles[0][7], decodedFiles[0][8])
          // setgroupdata(decodedFiles);
          return {names: decodedFiles[0][7], paths: decodedFiles[0][8]}
        } catch (error) {
          console.log("Error Decoding Data: ", error);
        }
      }
    }
  }
  const addmembers = async (groupname, member) => {
    console.log("Adding Memebers to group in contract")
    console.log("Groupname: ", groupname, "Member: ", member)
    const web3 = new Web3(ethereum);
    if (!ethereum) {
      return alert("Install MetaMask Please!!")
    } else {
      let decodedFiles;
      console.log("in else")
      try {
        const data = web3.eth.abi.encodeFunctionCall({
          name: 'addMemberstoGroup',
          type: 'function',
          inputs: [{
            type: 'string',
            name: 'groupname'
          }, {
            type: 'string',
            name: 'member'
          }]
        }, [groupname, member]);
        console.log("Got data: ", data)
        const transaction = await ethereum.request({
          method: 'eth_sendTransaction', params: [{
            from: inputValue,
            to: contractAddress,
            data: data,
            // value: ethers.parseEther('1').toString(16),
            gas: '500000'
          }]
        })

        const receipt = await web3.eth.getTransactionReceipt(transaction);
        console.log("Reciept for retrieving group after adding member: ", receipt)
        for (const item of contractABI) {
          console.log("in abi check")
          if (item.type === 'event' && item.name === 'AddFilesToGroup') {
            console.log("in event check")
            try {
              decodedFiles = await web3.eth.abi.decodeLog(
                item.inputs,
                receipt.logs[0].data,
                receipt.logs[0].topics.slice(1)
              );
              console.log("Returning Group After adding Member", decodedFiles)
              // setgroupdata(decodedFiles);
              return decodedFiles
            } catch (error) {
              console.log("Error Decoding Data: ", error);
            }
          }
        }
      } catch (error) {
        console.error("Error Sending Transaction: ", error)
      }
    }

  }

  const getfilesbygroupname = async (groupname) => {
    console.log("Getting Group Files from contract")
    const web3 = new Web3(ethereum);
    const ipfscontract = new web3.eth.Contract(contractABI, contractAddress)
    const functionAbi = contractABI.find((item) => item.name === 'getGroupFiles')
    const encodedCall = web3.eth.abi.encodeFunctionCall(functionAbi, [groupname])
    ipfscontract.methods.getGroupFiles(groupname).call({ from: inputValue }).then((result) => {
      console.log("Group Files: ", result)
      return result
    }).catch((error) => {
      console.log("Error Fetching Group Files: ", error)
    })
  }
  const getExistingGroups = async () => {
    console.log("Getting Existing Users from contract")
    const web3 = new Web3(ethereum);
    const ipfscontract = new web3.eth.Contract(contractABI, contractAddress)
    const functionAbi = contractABI.find((item) => item.name === 'getGroups')
    // const encodedCall = web3.eth.abi.encodeFunctionCall(functionAbi)
    ipfscontract.methods.getGroups().call({ from: inputValue }).then((result) => {
      setexistingGroups(result)
      return result
    }).catch((error) => {
      console.log("Error Fetching Groups: ", error)
    })
  }

  const deleteAllGroups = async () => {
    const web3 = new Web3(ethereum);
    const ipfscontract = new web3.eth.Contract(contractABI, contractAddress)
    ipfscontract.methods.deleteGroups().call({ from: inputValue }).then((result) => {
      console.log("Groups Deleted: ", result)
    }).catch((error) => {
      console.log("Error Deleting Groups: ", error)
    })
  }
  return (
    <IPFS.Provider value={{
      ConnectWallet,
      accounts,
      inputValue,
      setInputValue,
      systemaccount,
      set_system_account,
      txHash,
      RegisterUser,
      emittedData,
      CreateGroups,
      group_data,
      formData,
      setFormData,
      group_accs,
      set_group_accs,
      existingGroupsincontract,
      getExistingGroups,
      deleteAllGroups,
      AddFilesToGroup,
      addmembers,
      getfilesbygroupname
    }}
    >
      {children}
    </IPFS.Provider>
  )
}