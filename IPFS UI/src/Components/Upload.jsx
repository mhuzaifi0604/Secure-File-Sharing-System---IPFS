import React, {useState} from 'react'
import './Upload.css'
const Upload = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: ''
      });
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        // You can perform form submission logic here, such as sending data to a server
        console.log(formData);
      };
  return (
    <div className='container'>
        <h2>Sexy Form</h2>
      <form className="form" onSubmit={handleSubmit}> {/* Apply the form class */}
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Create Group</button> {/* Apply the button class */}
      </form>
    </div>
  )
}

export default Upload