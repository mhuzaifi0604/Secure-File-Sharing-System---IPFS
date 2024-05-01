import React, { useEffect, useState } from 'react';
import './Upload.css'; // Import your CSS file for styling
import {ethers} from 'ethers'
import axios from 'axios';

const Upload = () => {
  const [user, setUser] = useState(''); // State to store user data
  const [balance, setbalance] = useState('');
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
  });

  useEffect(() => {
    // Fetch data from API
    axios.get('http://localhost:3000/getUser')
    .then(response => {
      setUser(response.data)
      window.ethereum.request({method: 'eth_getBalance', params: [String(response.data), 'latest']})
      .then(balance => {
        setbalance(ethers.formatEther(balance))
      })
      .catch(err => {
        console.log("Error Fetching Balance: ", err)
      })
    })
    .catch(error => {
      console.log("Error Fetching User's Public Key: ", error)
    })
  }, [])


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here, e.g., send data to server
    console.log('Form submitted:', formData);
  };

  return (
    <div className="container">
      <div id='details'>
        <h1>User Details</h1>
        <p><strong>Account Id:</strong> {user}</p>
        <p><strong>Balance:</strong> {balance}</p>

      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="group_name"
          placeholder="Group Name"
          value={formData.group_name}
          onChange={handleChange}
          className="input-field"
        />
        <input
          type="textarea"
          name="description"
          placeholder="Enter Group Description"
          value={formData.description}
          onChange={handleChange}
          className="input-field"
        />
        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default Upload;