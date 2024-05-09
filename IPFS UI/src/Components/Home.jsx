import React, {useState, useContext} from 'react'
import {IPFS} from '../context/IPFScontext'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import '../Styles/Home.css'
import axios from 'axios'

const Home = () => {
  
  
  const {ConnectWallet, accounts, inputValue, setInputValue, systemaccount, set_system_account, txHash, RegisterUser, getExistingGroups} = useContext(IPFS)
  const navigate = useNavigate();
  // const [accounts, setAccounts] = useState([])
  const [error, seterror] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const approve = confirm("Registering with IPFS system witll cost '1 ETH'. Do You want to continue?")
    //   if(!approve){
    //     return
    //   }else if(approve){
        // setRegisterTrigger();
        const result  = await RegisterUser()
        await axios.post('http://localhost:3000/register', {
        data: {user: inputValue, system: systemaccount, txHash: txHash}
      }).then(async(response) => {
        await getExistingGroups()
        console.log("User Registered Successfully: ", response.data, " Result: ", result)
        setTimeout(() => {
          result === 'User Registered' && navigate('/upload')
        }, 2000);
      }).catch(err => {
        console.log("Error Registering User: ", err)
      })
    // }
  };

  return (
    <div className='container'>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit} id="form">
        <h1 id='head'>Secure File Sharing !!</h1>
        <div style={{display: 'flex', flexDirection: 'column', width: '100%', justifyItems: 'center', alignItems: 'center'}}>
          <h3 style={{width: '90%', display: 'flex', textAlign: 'start', color: 'white'}}>User: </h3>
                <select
                style={{width: '90%', height: '30px', borderRadius: '5px'}}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter your public key"
                >
                <option value="default value" style={{color: 'dimgrey'}}>Select Login Account</option>
                {accounts.map((account, index) => {
                  return <option key={index} value={account} disabled = {account === systemaccount}>{account}</option>
                })
                }
                </select>
        </div>
            <div style={{display: 'flex', flexDirection: 'column', width: '100%', justifyItems: 'center', alignItems: 'center'}}>
            <h3 style={{width: '90%', display: 'flex', textAlign: 'start', color: 'white'}}>Meta: </h3>
              <select
              style={{width: '90%', height: '30px', borderRadius: '5px'}}
                value={systemaccount}
                onChange={(e) => set_system_account(e.target.value)}
                placeholder="Enter your public key"
              >
                <option value="default value" style={{color: 'dimgrey'}}>Select System Account</option>
              {accounts.map((account, index) => {
                return <option key={index} value={account} disabled={account===inputValue}>{account}</option>
              })
              }
              </select>
            </div>
        <div style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center', alignContent: 'center', gap: '10px', marginTop: '20px'}}>
          <button type="submit" id="submit-button" className='submit-button'>Login</button>
          <button onClick={ConnectWallet} className='submit-button'>
          Connect Wallet
                </button>
        </div>
      </form>
    </div>
  )
}

export default Home