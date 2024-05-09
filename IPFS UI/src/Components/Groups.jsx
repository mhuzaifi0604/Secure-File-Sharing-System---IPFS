import React, { useState, useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {IPFS} from '../context/IPFScontext'
import axios from 'axios'
import '../Styles/Groups.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import {saveAs} from 'file-saver'


const Groups = () => {
  const {accounts, AddFilesToGroup,addmembers, inputValue, getfilesbygroupname} = useContext(IPFS)
  const data = useLocation().state.group // Getting the group data from the location state
  console.log("names: ", data.names)
  const [state, setstate] = useState(data)
  const [selectedFiles, setSelectedFile] = useState([]);
  // console.log("State: ", state, "accounts: ", accounts)
  useEffect(() => {
    console.log("Files from Group: ", getfilesbygroupname(state.name))
  }, [state.name])

  const [checkedItems, setCheckedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckboxChange = (event) => {
    const item = event.target.value;
    if (event.target.checked) {
      setCheckedItems([...checkedItems, item]);
    } else {
      const updatedCheckedItems = checkedItems.filter((checkedItem) => checkedItem !== item);
      setCheckedItems(updatedCheckedItems);
    }
  };

  const handleAddSelected = async() => {
    setSelectedItems([...selectedItems, ...checkedItems]);
    setCheckedItems([]);
    try {
      await axios.post('http://localhost:3000/addMembers', { data: { members: [...selectedItems, ...checkedItems], groupname: state.name } })
      .then(response => {
        console.log("Members Added in group: ", response.data)
        for(let i = 0; i < response.data.Group.members.length; i++){
          addmembers(response.data.Group.name, response.data.Group.members[i])
        }
      })
    } catch (error) {
      console.error("Error Adding Members: ", error) 
    }
  };

  const handleFileChange = async (event) => {
    event.preventDefault();
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        let fileData = {};
        fileData.filename = file.name;
        fileData.fileContent = reader.result;
        setSelectedFile((prev) => [...prev, fileData])
      }
      reader.onerror = () => {
        console.log('Error: ', reader.error)
      }
    }
  };

  const removeFile = (e, filename) => {
    e.preventDefault();
    const index = selectedFiles.findIndex(file => file.filename === filename);
    if(index !== -1){
      selectedFiles.splice(index, 1);
      setSelectedFile([...selectedFiles])
    }
  }

  const uploadFiles = async () => {
    await axios.post('http://localhost:3000/uploadFiles', { data: { files: selectedFiles, groupname: state.name } })
    .then((res) => {
      console.log(res.data)
      setstate(prevState => ({
        ...prevState,
        Files: res.data.Group.Files
      }));
      setSelectedFile([]) // Clearing the selected files
      var names = [], paths = [];
      res.data.Group.Files.forEach(file => {
        console.log("in files loop: ", file.name, file.path)
        names.push(file.name)
        paths.push(file.path)
      })
      for(let i = 0 ; i < names.length; i++){
        console.log(AddFilesToGroup(res.data.Group.name, names[i], paths[i]))
      }
    })
    .catch((err) => {
      console.log(err)
    });
  }

  const retrieveFiles = async (filename, filepath) => {
    console.log("Retrieving file " + filename + " from IPFS Server...")
      await axios.get('http://localhost:3000/retrieveFiles', {
        params: { filename: filename, filepath: filepath, groupname: state.name},
        responseType: 'blob'
      }).then((res) => {
        console.log("File Retrieved: ", res.data)
        const blob = new Blob([res.data]);
        saveAs(blob, filename);
      }
      ).catch((err) => {
        console.log(err)
      })
    }

  const customDisplay = () => {
    var styles = {};
    selectedFiles.length > 0 ? styles.display = 'block' : styles.display = 'none';
    styles.gap = '10px';
    return styles;
  };


  return (
    <div className='container'>
      <div style={{backgroundColor: 'black', width: '100%', height: 'fit-content', padding: '2px', borderRadius: '10px', boxShadow: '2px 2px 5px black', opacity: '93%'}}>
        <h1>
          Group's Name: {state.name}
        </h1>
        <h2 className='description'>{state.description}</h2>
        <p><strong>Owner:</strong> <i>{state.owner}</i></p>
        <p><strong>System Account:</strong> <i>{state.system_account}</i></p>
        <hr style={{ width: '90%' }} />
        <div className='divider'>
          <div style={{display: 'block', width: '50%', backgroundColor: '#151515', borderRadius: '5px', border: '1px solid teal', opacity: '100%'}}>
            <div className='sharedFiles'>
              {
                state.names.length > 0 ? (
                  <div style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <p><strong>Files Shared</strong></p>
                    <hr style={{width: '90%'}}/>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {state.names.map((name, index) => (
                        <div key={index}>
                          <p className='filenames' style={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
                            <span>{name} </span>
                            <button className='downloadFiles' onClick={() => retrieveFiles(name, state.paths[index])}><FontAwesomeIcon icon={faDownload} /></button>
                          </p>
                        </div>
                      ))
                      }
                    </div>
                    <hr style={{width: '90%'}}/>
                  </div>
                ) :
                    <p><strong>No Files Shared</strong></p>
              }
            </div>
            <form className='fileuploadform'>
              <input type="file" id="file" className="input-file" onChange={handleFileChange} multiple />
              <label htmlFor="file" className="file-label">
                {/* Customized button text */}
                Choose File
              </label>
              {/* Button to trigger file upload */}
              <button type='button' onClick={uploadFiles} className="upload-button">Upload</button>
            </form>
            <div>
              <br />
              <p className='selectedfiles'>Selected Files</p>
              <hr style={{ width: '90%' }} />
              <br />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {selectedFiles.map((file, index) => (
                  <div key={index}>
                    <p className='filenames' style={customDisplay()}>
                      <span>{file.filename} </span>
                      <button className='removeFiles' onClick={(e) => removeFile(e, file.filename)}>❌</button>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div  style={{display: 'block', width: '50%', backgroundColor: '#151515', color: 'black', height: '100%', borderRadius: '5px', border: '1px solid teal', color: 'white'}}>
            {inputValue.toUpperCase() === state.owner.toUpperCase() && <div style={{display: 'flex', flexDirection: 'column', gap: '5px', justifyItems: 'center', alignItems: 'center'}}>
            <p>Add Memebers</p>
              <hr style={{width: '90%'}}/>
              {accounts.map((item, index) => (
            <div key={index}>
              {(item.toLowerCase() !== state.owner.toLowerCase() && item.toLowerCase() !== state.system_account.toLowerCase() && !state.members.includes(item.toLowerCase())) && (
                    <React.Fragment>
            <input
              type="checkbox"
              value={item}
              checked={checkedItems.includes(item)}
              onChange={handleCheckboxChange}
            />
            <label>{item}</label>
                    </React.Fragment>
              )}
            </div>
                    ))}
                    <button onClick={handleAddSelected} className='submit'>Add Selected</button>
                    { state.members.length > 0  &&  <div>
            <p><strong>Group Members</strong></p>
            <hr style={{width: '90%'}}/>
            <ul>
              {state.members.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
                    </div>}
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Groups