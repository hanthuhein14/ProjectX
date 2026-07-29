import React, { useState } from 'react'
import './Loginpopup.css'
import {useNavigate} from 'react-router-dom'
import api from "../../api/axios";

const Loginpopup = ({ setShowLogin,setShowSignup }) => {
  const navigate=useNavigate();

  const [email,setEmail]=useState("");
  const[password,setPassword]=useState("");

  const handleLogin=async(e)=>{
    e.preventDefault();
    try{
      const response=await api.post("/login",{
        email:email,
        password:password
      });
      localStorage.setItem(
        "token",
        response.data.access_token
      );
      setShowLogin(false);
      navigate("/dashboard");
    }
    catch(error){
      console.log(error);
      alert("Invalid email or password");
    }
  };
  return (
    <div className='login-popup'>
      <form className='login-popup-container' onSubmit={handleLogin}>

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
            value={email} onChange={(e)=>setEmail(e.target.value)}
          />

          <input 
            type="password" 
            placeholder="Enter your password"
            required
            value={password} onChange={(e)=>setPassword(e.target.value)}
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