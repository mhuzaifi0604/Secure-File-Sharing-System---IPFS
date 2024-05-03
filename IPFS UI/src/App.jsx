import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './Components/Home'
import Upload from './Components/Upload'
import Groups from './Components/Groups'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/groups/:groupname" element={<Groups />} />
      </Routes>
    </Router>
  )
}

export default App
