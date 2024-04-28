import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'
import axios from 'axios'

const Home = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/register', {
        data: inputValue
        });
      console.log(response.data);
      navigate('/upload')
    } catch (error) {
      console.log("Error Registering User: ", error)
    }
  };

  return (
    <div className='container'>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="id" className='label'>
            <h3>User Id: </h3>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your public key"
              className="input-field"
            />
        </label>
        <button type="submit" className="submit-button">Register</button>
      </form>
    </div>
  )
}

export default Home