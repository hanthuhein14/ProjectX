import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import './index.css'
import Home from './components/home/home'
import Loginpopup from './components/loginpopup/Loginpopup'
import Signuppopup from './components/signuppopup/Signuppopup'


const App = () => {
  const [showlogin,setShowLogin]=useState(false)
  const [showSignup, setShowSignup] = useState(false)
  return (
    <>
    {showlogin && <Loginpopup setShowLogin={setShowLogin}/>}
    {showSignup && (<Signuppopup setShowSignup={setShowSignup}/>)}
    {showSignup && (<Signuppopup setShowSignup={setShowSignup}setShowLogin={setShowLogin}/>)}
    {showlogin && (<Loginpopup setShowLogin={setShowLogin}setShowSignup={setShowSignup}/>
)}
    <div className='app'>
      <Navbar setShowLogin={setShowLogin} setShowSignup={setShowSignup}/>
      <Home/>
      
    </div>
    </>
  )
}

export default App
