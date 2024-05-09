import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {IPFS} from '../context/IPFScontext'
import { ethers } from 'ethers'
import axios from 'axios';
import '../Styles/Uploads.css'

const Upload = () => {
  // const data = useLocation().state.groups // Getting the group data from the location state
  // console.log("Groups passed as state to upload: ", data)
  const {CreateGroups, formData, setFormData, set_group_accs, existingGroupsincontract, deleteAllGroups, getExistingGroups, getUserGroups, inputValue} = useContext(IPFS)
  const navigate = useNavigate();
  const [accounts_info, setaccounts_info] = useState({}); // State to store user data
  const [group_details, set_group_details] = useState({}); // State to store group data
  const [existingGroups, setExistingGroups] = useState([]); // State to store existing groups of a user
  const [contractGroups, setContractGroups] = useState([]); // State to store existing groups in contract
  const [balance, setbalance] = useState('');
  console.log("existing groups in contract: ", existingGroupsincontract)
  // const [formData, setFormData] = useState({
  //   group_name: '',
  //   description: '',
  // });
  // console.log("emittedData: ", emittedData)

  useEffect(() => {
    // Fetch data from API
    axios.get('http://localhost:3000/getUser')
      .then(response => {
        setaccounts_info(response.data)
        set_group_accs(response.data)
        updateLocalgroups()
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

      // Getting Existing Groups from contract to display in the dropdown
      getExistingGroups()
      var newArray = [];
      for(let i = 0; i < existingGroupsincontract.length; i++){
        var group = {
          name: '',
            description: '',
            prv_key: '',
            pub_key: '',
            owner: '',
            system_account: '',
            members: [],
            Files: [{
                name: '',
                path: '',
            }],
            names: [],
            paths: []
        };
        console.log("contract user addr: ", existingGroupsincontract[i]["owner"], "user addr: ", inputValue)
        console.log("type of contract fetched addr: ", typeof(existingGroupsincontract[i]["owner"]), "type of user addr: ", typeof(inputValue))
        if(existingGroupsincontract[i]["owner"].toLowerCase() === inputValue || existingGroupsincontract[i]["members"].includes(inputValue)){
          console.log("I was here!")
        group.name = existingGroupsincontract[i]["name"]
        group.description = existingGroupsincontract[i]["description"]
        group.prv_key = existingGroupsincontract[i]["prv_key"]
        group.pub_key = existingGroupsincontract[i]["pub_key"]
        group.owner = existingGroupsincontract[i]["owner"]
        group.system_account = existingGroupsincontract[i]["system_account"]
        group.members = existingGroupsincontract[i]["members"]
        group.Files = []
        group.names = existingGroupsincontract[i]["filenames"]
        group.paths = existingGroupsincontract[i]["filepaths"]
        newArray.push(group)
        }
        }
        setContractGroups(newArray)
        console.log("new Array: ", newArray)
  }, [])

  const getexistingGroups = async (useraccount) => {
    try {

      axios.get('http://localhost:3000/returnExistingGroups', {
        params: { useraccount: useraccount }
      })
        .then(res => {
          console.log("Existing Groups in then: ", res.data.Groups)
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
    console.log("existing groups in go to: ", existingGroups)
    navigate(`/groups/${e.target.value}`, { state: { group: existingGroups.find(group => group.name === e.target.value) } });
}

const updateLocalgroups = async() => {
  // const userGroups = getUserGroups()
  // console.log("User Groups: ", userGroups)
  var newArray = [];
  for(let i = 0; i < existingGroupsincontract.length; i++){
    var group = {
      name: '',
        description: '',
        prv_key: '',
        pub_key: '',
        owner: '',
        system_account: '',
        members: [],
        Files: [{
            name: '',
            path: '',
        }],
        names: [],
        paths: []
    };
    group.name = existingGroupsincontract[i]["name"]
    group.description = existingGroupsincontract[i]["description"]
    group.prv_key = existingGroupsincontract[i]["prv_key"]
    group.pub_key = existingGroupsincontract[i]["pub_key"]
    group.owner = existingGroupsincontract[i]["owner"]
    group.system_account = existingGroupsincontract[i]["system_account"]
    group.members = existingGroupsincontract[i]["members"]
    group.Files = []
    group.names = existingGroupsincontract[i]["filenames"]
    group.paths = existingGroupsincontract[i]["filepaths"]
    newArray.push(group)
    }
    
  axios.post('http://localhost:3000/updateGroups', { data: { groups: newArray } })
  .then(response => {
    console.log("Groups Updated: ", response.data)
  }).catch(error => {
    console.log("Error Updating Groups: ", error)
  }
  )
}


  const handleSubmit = async (e) => {
    e.preventDefault();
        axios.post('http://localhost:3000/createGroup', { data: { group_details: formData, accounts_info: accounts_info } })
        .then(async(response) => {
          set_group_details(response.data.Group)
          const result = await CreateGroups(response.data.Group.pub_key,response.data.Group.prv_key )
          console.log("Result: ", result)
          console.log("results name: ", result["name"], "responses name: ", response.data.Group.name)
          result["name"] === response.data.Group.name && 
          navigate(`/groups/${response.data.Group.name}`, { state: { group: response.data.Group } })
        })
        .catch(error => {
          console.log("Error Creating Group: ", error)
      })
    // }
  };
  console.log("Contract Groups: ", contractGroups)

  return (
    <div className="container">
      <div style={{backgroundColor: 'black', width: '60%', height: 'fit-content', padding: '2px', borderRadius: '10px', boxShadow: '2px 2px 5px black', opacity: '93%'}}>
        <div id='details'>
          <h1>User Details</h1>
          <p><strong>Account Id:</strong> {accounts_info.useraccount}</p>
          <p><strong>Balance:</strong> {balance}</p>
        </div>
        {contractGroups.length > 0 && <div className='existing_group_details'>
          <h3>Existing Groups</h3>
          <select name="existing_groups" id="existing_groups" onChange={gotoGroup}>
            <option value="">Select Group to get group details</option>
            {contractGroups.map(group => {
              return <option value={group.name} key={group.name}>{group.name}</option>
            })}
          </select>
        </div>}
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '10px', justifyItems: 'center', alignItems: 'center'}}>
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
          <button type="submit" className="submit">Submit</button>
        </form>
      </div>
      {/* <button 
      onClick={() => deleteAllGroups()}
      style={{width: 'max-content', height: 'max-content', padding: '5px', borderRadius: '5px', backgroundColor: 'red', border: '1px solid black', marginTop: `10px`}}
      >
        Delete all groups
      </button> */}
    </div>
  );
};

export default Upload;