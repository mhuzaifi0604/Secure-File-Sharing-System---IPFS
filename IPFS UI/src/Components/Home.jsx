import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import './Home.css'
import axios from 'axios'

const Home = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [systemaccount, set_system_account] = useState('')
  const [accounts, setAccounts] = useState([])
  const [error, seterror] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const approve = confirm("Registering with IPFS system witll cost '1 ETH'. Do You want to continue?")
      if(!approve){
        return
      }else if(approve){
        window.ethereum.request({method: 'eth_sendTransaction', params: [{
          from: inputValue,
          to: systemaccount, 
          gas: BigInt("30000").toString(16),
          gasPrice: BigInt("5000000000").toString(16),
          value: ethers.parseEther('1').toString(16)
        }]
      })
        .then (txHash => {
          console.log("Transaction Hash: ", txHash)
          axios.post('http://localhost:3000/register', {
          data: {user: inputValue, system: systemaccount, txHash: txHash}
        });
        setTimeout(() => {
          navigate('/upload')
        }, 3000);
        
        })
        .catch(err => {
          console.log("Error Sending Transaction: ", err)
        })
      }
    } catch (error) {
      console.log("Error Registering User: ", error)
    }
  };

  const ConnectWallet = () => {
    if(window.ethereum){
      window.ethereum.request({method: 'eth_requestAccounts'})
      .then(accounts => {
        setAccounts(accounts)
      })
      .catch(err => {
        console.log(err)
        seterror("Install MetaMask Please!!")
      })
    }
  }
  const setselectedaccount = (e) => {
    setInputValue(e.target.value)
  }

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
              return <option key={index} value={account} disabled={account===systemaccount}>{account}</option>
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