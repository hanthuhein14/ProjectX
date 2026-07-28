import React from 'react'
import './Signuppopup.css'

const Signuppopup = ({ setShowSignup, setShowLogin }) => {
  return (
    <div className="signup-popup">

      <form className="signup-popup-container">

        <div className="signup-popup-title">
          <h2>Create Account</h2>

          <span
            className="close"
            onClick={() => setShowSignup(false)}
          >
            ×
          </span>
        </div>


        <div className="signup-popup-inputs">

          <input
            type="text"
            placeholder="Username"
            required
          />

          <input
            type="email"
            placeholder="Email"
            required
          />

          <input
            type="password"
            placeholder="Password"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            required
          />

        </div>


        <button type="submit">
          Sign Up
        </button>


        <p className="signup-condition">
          <input type="checkbox" required />
          I agree to the terms and conditions.
        </p>


        <p className="login-text" >
          Already have an account?
          <span onClick={() => {setShowSignup(false);setShowLogin(true);}}> Login</span>
        </p>


      </form>

    </div>
  )
}

export default Signuppopup