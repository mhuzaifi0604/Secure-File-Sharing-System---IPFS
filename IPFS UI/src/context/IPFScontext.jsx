import React, {useEffect, useState, useCallback, useReducer} from 'react'
import {ethers, parseEther} from 'ethers'
import Web3 from 'web3'
// import IPFS from './Ethcontext'
import {actions, reducer, initialState} from './state'
import { contractABI, contractAddress } from '../utils/constants'

const {ethereum} = window
export const IPFS = React.createContext();

const getEthereumcontract = () => {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer =  provider.getSigner()
    const ipfsContract = new ethers.Contract(contractAddress, contractABI, provider)
    
    return ipfsContract
}


export const IPFSProvider = ({children}) => {

  const [state, dispatch] = useReducer(reducer, initialState);

  // const init = useCallback(async artifact => {
  //   if(artifact){
  //     let web3;
  //     if(window.web3){
  //       web3 = new Web3(window.web3.currentProvider)
  //     }else{
  //       alert("Install MetaMask Please!!")
  //     }
  //     const accounts = await web3.eth.getAccounts()
  //     const networkID = await web3.eth.net.getId()
  //     const {abi} = artifact
  //     let address, contract;
  //     try {
  //       address =  artifact.networks[networkID].address
  //       contract = new web3.eth.Contract(abi, address)
  //     } catch (error) {
  //       console.log("Error initiating Blockchain: ", error)
  //     }
  //     dispatch({
  //       type: actions.init,
  //       data: {artifact, web3, accounts, networkID, contract}
  //     })
  //   }
  // }, [])

  // useEffect(() => {
  //   const tryInit = async () => {
  //     try {
  //       const artifact = contractABI
  //       init(artifact)
  //     } catch (error) {
  //       console.err("Error initiating Blockchain: ", error)
  //     }
  //   }
  //   tryInit()
  // }, [init])

  // useEffect(() => {
  //   const events= ['accountsChanged', 'chainChanged', 'disconnect']
  //   const handleEvent = () => {
  //     init(state.artifact)
  //   }
  //   events.forEach(event => window.ethereum.on(event, handleEvent));
  //   return () => {
  //     events.forEach(event => window.ethereum.removeListener(event, handleEvent))
  //   }
  // }, [init, state.artifact])

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
                // gas: BigInt("30000").toString(16),
                // gasPrice: BigInt("5000000000").toString(16),
                value: ethers.parseEther('1').toString(16)
            }]
            })
            const transaction = await ipfscontract.registerUser.staticCall(systemaccount, parseEther("1.1"))
            setloading(true)
            console.log("Loading - Transaction Hash: ", transaction.hash)
            setTxHash(transaction.hash)
            const receipt = await transaction.wait()
            setloading(false)
            console.log("Success: ", receipt)
            // const users = await ipfscontract.getRegisteredUsers()
            // console.log("Users: ", users)
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