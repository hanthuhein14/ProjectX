import React from 'react'
import { useNavigate } from "react-router-dom";

const Dashboard = () => {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };


  return (
    <div className="dashboard">

      <h1>Welcome</h1>

      <button onClick={logout}>
        Logout
      </button>

    </div>
  )
}

export default Dashboard;