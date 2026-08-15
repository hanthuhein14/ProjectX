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
import Aboutus from './components/aboutus/aboutus.jsx'
import Profile from "./components/Dashboard/profile/profile.jsx";
import PopularDestination from './components/Populardistination/pd.jsx'
import Contact from './components/contact/contact.jsx'
import AdminDashboard from './components/Admin/AdminDashboard.jsx'
import AdminProtectedRoute from './components/protectedroute/AdminProtectedRoute.jsx'
import BookingStatus from './components/BookingStatus/BookingStatus.jsx'
import Transaction from './components/Transaction/Transaction.jsx'
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
              <PopularDestination setShowLogin={setShowLogin}/>
              <Feature/>
              <Aboutus/>
              <Contact setShowLogin={setShowLogin}/>
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
         <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/booking-status"
          element={
            <ProtectedRoute>
              <BookingStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transaction/:planId"
          element={
            <ProtectedRoute>
              <Transaction />
            </ProtectedRoute>
          }
        />

</Routes>
      
      
    </>
  )
}

export default App
