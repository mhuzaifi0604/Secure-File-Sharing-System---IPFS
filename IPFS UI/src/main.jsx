import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { IPFSProvider } from './context/IPFScontext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <IPFSProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </IPFSProvider>,
)
