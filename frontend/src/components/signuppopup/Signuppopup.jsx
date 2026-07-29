import React, { useState } from 'react'
import './Signuppopup.css'
import api from "../../api/axios";

const Signuppopup = ({ setShowSignup, setShowLogin }) => {

  const[username,setName]=useState("");
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup=async(e)=>{
    e.preventDefault();

    console.log("signup clicked");

    if(password !== confirmPassword){
      alert("Passwords do not match");
      return;
  }
    try{
      const response=await api.post(
        "/userinfo/",
        {
          username,
          email,
          password
          
        }
      );
      alert("Account created successfully");
    }
    catch (error) {
      console.log(error);
      console.log(error.response?.status);
      console.log(error.response?.data);
    
      alert(error.response?.data?.detail || "Signup failed");
    }
  }
  return (
    <div className="signup-popup">

      <form className="signup-popup-container" onSubmit={handleSignup}>

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
            value={username}
            onChange={(e)=>setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e)=>setEmail(e.target.value)}
            value={email}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            required
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}
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