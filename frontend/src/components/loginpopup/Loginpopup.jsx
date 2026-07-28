import React from 'react'
import './Loginpopup.css'

const Loginpopup = ({ setShowLogin,setShowSignup }) => {
  return (
    <div className='login-popup'>
      <form className='login-popup-container'>

        <div className="login-popup-title">
          <h2>Login</h2>
          <span 
            onClick={() => setShowLogin(false)}
            className="close"
          >
            ×
          </span>
        </div>

        <div className="login-popup-inputs">
          <input 
            type="email" 
            placeholder="Enter your email"
            required
          />

          <input 
            type="password" 
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit">
          Login
        </button>

        <p className="login-popup-condition">
          <input type="checkbox" required />
          By continuing, I agree to the terms and conditions.
        </p>

        <p className="register-text">
          Don't have an account? 
          <span onClick={() => {setShowLogin(false);setShowSignup(true);}}> Sign Up</span>
        </p>

      </form>
    </div>
  )
}

export default Loginpopup