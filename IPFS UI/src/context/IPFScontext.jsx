import React, {useEffect, useState, useCallback, useReducer} from 'react'
import {decodeBytes32String, ethers, parseEther} from 'ethers'
import Web3 from 'web3'
// import IPFS from './Ethcontext'
import {actions, reducer, initialState} from './state'
import { contractABI, contractAddress } from '../utils/constants'

const {ethereum} = window
export const IPFS = React.createContext();

const getEthereumcontract = async (account) => {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer =  await provider.getSigner()
    const ipfsContract = new ethers.Contract(contractAddress, contractABI, provider)
    
    return ipfsContract
}


export const IPFSProvider = ({children}) => {

  const [state, dispatch] = useReducer(reducer, initialState);

    const [accounts, setAccounts] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [systemaccount, set_system_account] = useState('')
    const [emitters, setEmitter] = useState(null)
    const [txHash, setTxHash] = useState('')
    const [loading, setloading] = useState(false)

    const ConnectWallet = () => {
        if(ethereum){
          ethereum.request({method: 'eth_requestAccounts'})
          .then(accounts => {
            setAccounts(accounts)
          })
          .catch(err => {
            console.log(err)
            seterror("Install MetaMask Please!!")
          })
        }
      }

      const RegisterUser = async() => {
        const web3 = new Web3(ethereum);
        let decodedData;
        try {
            if(!ethereum){
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
          
            const transaction = await ethereum.request({method: 'eth_sendTransaction', params: [{
              from: inputValue,
              to: contractAddress,
              data: data,
              value: ethers.parseEther('1').toString(16)
          }]
          })

          const receipt = await web3.eth.getTransactionReceipt(transaction);
          console.log("Reciept: ", receipt)

          for (const item of contractABI) {
            if (item.type === 'event') {
                try {
                    decodedData = await web3.eth.abi.decodeLog(
                        item.inputs,
                        receipt.logs[0].data,
                        receipt.logs[0].topics.slice(1)
                    );
                    // Update the state with the decoded data
                    setEmitter(decodedData);
                    // Exit the loop after setting emitters
                    break;
                } catch (error) {
                    console.log("Error Decoding Data: ", error);
                }
            }
        }        
            console.log("Loading - Transaction: ", transaction)
        } catch (error) {
            console.error("Error Sending Transaction: ", error)
        }
        console.log("Decoded Data: ", decodedData)
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
            }}
        >
            {children}
        </IPFS.Provider>
    )
}