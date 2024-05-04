import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import '../Styles/Groups.css'

const Groups = () => {
  const data = useLocation().state.group // Getting the group data from the location state
  const [state, setstate] = useState(data)
  console.log("State: ", state)
  const [selectedFiles, setSelectedFile] = useState([]);

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
        Files: res.data.Files
      }));
      setSelectedFile([]) // Clearing the selected files
    })
    .catch((err) => {
      console.log(err)
    });
  }

  const customDisplay = () => {
    var styles = {};
    selectedFiles.length > 0 ? styles.display = 'block' : styles.display = 'none';
    styles.gap = '10px';
    return styles;
  };


  return (
    <div className='container'>
      <h1>
        Group's Name: {state.name}
      </h1>
      <h2 className='description'>{state.description}</h2>
      <p><strong>Owner:</strong> <i>{state.owner}</i></p>
      <p><strong>System Account:</strong> <i>{state.system_account}</i></p>
      <hr style={{ width: '90%' }} />
      <div className='sharedFiles'>
        {
          state.Files.length > 0 ? (
            <div style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <p><strong>Files Shared</strong></p>
              <hr style={{width: '50%'}}/>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {state.Files.map((file, index) => (
                  <div key={index}>
                    <p className='filenames'>{file.name}</p>
                  </div>
                ))}
              </div>
              <hr style={{width: '50%'}}/>
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
  )
}

export default Groups