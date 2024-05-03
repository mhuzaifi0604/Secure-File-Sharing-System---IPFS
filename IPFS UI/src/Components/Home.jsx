import React, {useState, useContext} from 'react'
import {IPFS} from '../context/IPFScontext'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import '../Styles/Home.css'
import axios from 'axios'

const Home = () => {
  const {ConnectWallet, accounts, inputValue, setInputValue, systemaccount, set_system_account, txHash, RegisterUser} = useContext(IPFS)
  const navigate = useNavigate();
  // const [accounts, setAccounts] = useState([])
  const [error, seterror] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    const approve = confirm("Registering with IPFS system witll cost '1 ETH'. Do You want to continue?")
      if(!approve){
        return
      }else if(approve){
        RegisterUser()
        axios.post('http://localhost:3000/register', {
        data: {user: inputValue, system: systemaccount, txHash: txHash}
      }).then(response => {
        console.log("User Registered Successfully: ", response.data)
        navigate('/upload')
      }).catch(err => {
        console.log("Error Registering User: ", err)
      })
    }
  };

  return (
    <div className='container'>
      <button onClick={ConnectWallet} id='submit-button'>
        Connect Wallet
      </button>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit} id="form">
            <h3>User Id: </h3>
            <select
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your public key"
            >
            <option value="default value">Select Your Account</option>
            {accounts.map((account, index) => {
              return <option key={index} value={account} disabled = {account === systemaccount}>{account}</option>
            })
            }
            </select>
            <select
              value={systemaccount}
              onChange={(e) => set_system_account(e.target.value)}
              placeholder="Enter your public key"
            >
              <option value="default value">Select System Account</option>
            {accounts.map((account, index) => {
              return <option key={index} value={account} disabled={account===inputValue}>{account}</option>
            })
            }
            </select>
        <button type="submit" id="submit-button">Register</button>
      </form>
    </div>
  )
}

export default Home