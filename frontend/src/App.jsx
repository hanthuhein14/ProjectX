import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import './index.css'
import Home from './components/home/home.jsx'
import Loginpopup from './components/loginpopup/Loginpopup'
import Signuppopup from './components/signuppopup/Signuppopup'
import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import ProtectedRoute from './components/protectedroute/Protectedroute.jsx'
import Feature from './components/feature/Feature.jsx'

const App = () => {
  const [showLogin,setShowLogin]=useState(false)
  const [showSignup, setShowSignup] = useState(false)
  
  return (
    <>
  
      {showLogin && (
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
  
  
      <Routes>
  
        <Route
          path="/"
          element={
            <div className="landing-page">
              <Navbar
                setShowLogin={setShowLogin}
                setShowSignup={setShowSignup}
              />
              <Home />
              <Feature/>
            </div>
          }
        />
  
  
        <Route
          path="/dashboard"
          element={
          <ProtectedRoute>
          <Dashboard />
            </ProtectedRoute>
          }
        />
  
      </Routes>
  
    </>
  )
}

export default App
