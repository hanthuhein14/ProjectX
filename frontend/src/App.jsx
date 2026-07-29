import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import './index.css'
import Home from './components/home/home.jsx'
import Loginpopup from './components/loginpopup/Loginpopup'
import Signuppopup from './components/signuppopup/Signuppopup'
import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard.jsx";


const App = () => {
  const [showlogin,setShowLogin]=useState(false)
  const [showSignup, setShowSignup] = useState(false)
  
  return (
    <>
{showlogin && (
  <Loginpopup
    setShowLogin={setShowLogin}
    setShowSignup={setShowSignup}
  />
)}

{showSignup && (
  <Signuppopup
    setShowSignup={setShowSignup}
    setShowLogin={setShowLogin}
  />
)}
    <div className='app'>
      
      
      <Routes>
  
  <Route 
    path="/" 
    element={
      <>
        <Navbar 
          setShowLogin={setShowLogin}
          setShowSignup={setShowSignup}
        />
        <Home />
      </>
    }
  />
  
  <Route 
    path="/dashboard" 
    element={<Dashboard />}
  />

</Routes>
    </div>
    
    </>
  )
}

export default App
