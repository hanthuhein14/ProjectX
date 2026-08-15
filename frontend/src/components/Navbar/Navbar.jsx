import React, { useState } from 'react'
import'./Navbar.css'
import { assets } from '../../assets/assets'



const Navbar = ({setShowLogin,setShowSignup}) => {
    const[menu,setMenu]=useState("Home");
  return (
    <div className='navbar'>
      <img src={assets.logo} alt="" className="logo"/>
      <ul className="navbar-menu">
        <li onClick={()=>setMenu("Home")} className={menu=="Home"?"active":""}><a href="#home">Home</a></li>
        <li onClick={()=>setMenu("Feature")} className={menu=="Feature"?"active":""}><a href="#Feature">Feature</a></li>
        <li onClick={()=>setMenu("Popular")} className={menu=="Popular"?"active":""}><a href="#PopularDestination">Popular</a></li>
        <li onClick={()=>setMenu("About")} className={menu=="About"?"active":""}><a href="#About">About us</a></li>
        <li onClick={()=>setMenu("Contact")} className={menu=="Contact"?"active":""}><a href="#Contact">Contact</a></li>
      </ul>
      <div className="navbar-right">
        <button className="button1" onClick={() => setShowSignup(true)}>Sign Up</button>
        <button className="button1" onClick={()=> setShowLogin(true)}>Log In</button>
      </div>
    </div>
  )
}

export default Navbar
