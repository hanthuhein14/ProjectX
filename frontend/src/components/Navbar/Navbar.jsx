import React, { useState } from 'react'
import'./Navbar.css'
import { assets } from '../../assets/assets'
const Navbar = ({setShowLogin,setShowSignup}) => {
    const[menu,setMenu]=useState("Home");
  return (
    <div className='navbar'>
      <img src={assets.logo} alt="" className="logo"/>
      <ul className="navbar-menu">
        <li onClick={()=>setMenu("Home")} className={menu=="Home"?"active":""}>Home</li>
        <li onClick={()=>setMenu("Feature")} className={menu=="Feature"?"active":""}>Feature</li>
        <li onClick={()=>setMenu("About")} className={menu=="About"?"active":""}>About</li>
        <li onClick={()=>setMenu("Contact")} className={menu=="Contact"?"active":""}>Contact</li>
      </ul>
      <div className="navbar-right">
        <button className="button1" onClick={() => setShowSignup(true)}>Sign Up</button>
        <button className="button1" onClick={()=> setShowLogin(true)}>Log In</button>
      </div>
    </div>
  )
}

export default Navbar
