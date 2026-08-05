import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";



const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await api.get("/userinfo/me");

        setUsername(response.data.username);
      } catch (error) {
        console.error(error);

        localStorage.removeItem("token");
        navigate("/");
      }
    };

    getUserInfo();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  


  return (
    
    <div className="dashboard">
      <img
        src={assets.dashboardbg}
        alt="Dashboard background"
        className="dashboardbg"
      />
      <div className="dashboard-overlay">
      <h1 className="usergreeting">Welcome {username}</h1>

      <button onClick={logout} className="logout">
        Logout
      </button>
    </div>
    </div>
  )
}

export default Dashboard;