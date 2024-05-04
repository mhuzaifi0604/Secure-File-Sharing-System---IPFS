import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers'
import axios from 'axios';
import '../Styles/Uploads.css'

const Upload = () => {
  const navigate = useNavigate();
  const [accounts_info, setaccounts_info] = useState({}); // State to store user data
  const [group_details, set_group_details] = useState({}); // State to store group data
  const [existingGroups, setExistingGroups] = useState([]); // State to store existing groups of a user
  const [balance, setbalance] = useState('');
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
  });

  useEffect(() => {
    // Fetch data from API
    axios.get('http://localhost:3000/getUser')
      .then(response => {
        setaccounts_info(response.data)
        window.ethereum.request({ method: 'eth_getBalance', params: [String(response.data.useraccount), 'latest'] })
          .then(balance => {
            setbalance(ethers.formatEther(balance))
            getexistingGroups(response.data.useraccount)
          })
          .catch(err => {
            console.log("Error Fetching Balance: ", err)
          })
      })
      .catch(error => {
        console.log("Error Fetching User's Public Key: ", error)
      })
  }, [])

  const getexistingGroups = async (useraccount) => {
    try {
      await axios.get('http://localhost:3000/returnExistingGroups', {
        params: { useraccount: useraccount }
      })
        .then(res => {
          console.log("Existing Groups: ", res.data.Groups)
          setExistingGroups(res.data.Groups)
        })
    } catch (error) {
      console.log("Error Fetching Existing Groups: ", error)
    }
  }


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const gotoGroup = (e) => {
    console.log("Navigating to Group: ", e.target.value)
    navigate(`/groups/${e.target.value}`, { state: { group: existingGroups.find(group => group.name === e.target.value) } });
}


  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3000/createGroup', { data: { group_details: formData, accounts_info: accounts_info } })
      .then(response => {
        set_group_details(response.data.Group)
        navigate(`/groups/${response.data.Group.name}`, { state: { group: response.data.Group } })
      })
      .catch(error => {
        console.log("Error Creating Group: ", error)
      })
  };

  return (
    <div className="container">
      <div id='details'>
        <h1>User Details</h1>
        <p><strong>Account Id:</strong> {accounts_info.useraccount}</p>
        <p><strong>Balance:</strong> {balance}</p>
      </div>
      {existingGroups.length > 0 && <div className='existing_group_details'>
        <h2>Existing Groups</h2>
        <select name="existing_groups" id="existing_groups" onChange={gotoGroup}>
          <option value="">Select Group to get group details</option>
          {existingGroups.map(group => {
            return <option value={group.name} key={group.name}>{group.name}</option>
          })}
        </select>

      </div>}
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