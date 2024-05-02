import React, {useEffect, useState} from 'react'
import {ethers} from 'ethers'

import { contractABI, contractAddress } from '../utils/constants'
const {ethereum} = window
export const IPFS = React.createContext();
const getEthereumcontract = () => {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = provider.getSigner()
    const ipfsContract = new ethers.Contract(contractAddress, contractABI, signer)
    
    return ipfsContract
}


export const IPFSProvider = ({children}) => {

    const [accounts, setAccounts] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [systemaccount, set_system_account] = useState('')
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
        try {
            if(!ethereum){
                return alert("Install MetaMask Please!!")   
            }
            const ipfscontract = getEthereumcontract();
            await ethereum.request({method: 'eth_sendTransaction', params: [{
                from: inputValue,
                to: systemaccount, 
                gas: BigInt("30000").toString(16),
                gasPrice: BigInt("5000000000").toString(16),
                value: ethers.parseEther('1').toString(16)
            }]
            })
            const transaction = await ipfscontract.registerUser(systemaccount, ethers.parseEther('1').toString(16))
            setloading(true)
            console.log("Loading - Transaction Hash: ", transaction.hash)
            setTxHash(transaction.hash)
            const receipt = await transaction.wait()
            setloading(false)
            console.log("Success: ", receipt)
        } catch (error) {
            console.error("Error Sending Transaction: ", error)
        }
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
            RegisterUser
            }}
        >
            {children}
        </IPFS.Provider>
    )
}