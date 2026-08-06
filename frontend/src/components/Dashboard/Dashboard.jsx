
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";

const Dashboard = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
    <section className="dashboard">

      <img
        src={assets.dashboardbg}
        alt="Dashboard background"
        className="dashboard-bg"
      />

      <div className="dashboard-overlay"></div>

      <div className="dashboard-content">
        <p className="welcome-text">
          Welcome back
        </p>

        <h1 className="usergreeting">
          {username}
        </h1>
      </div>

      {/* Menu button */}
      <div className="menu-container">
        <button
          className="menu-button"
          onClick={() => setMenuOpen(true)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Right sidebar */}
      <div className={`side-menu ${menuOpen ? "open" : ""}`}>

        <div className="side-menu-header">
          <h2>Menu</h2>

          <button
            className="close-button"
            onClick={() => setMenuOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="side-menu-options">

          <button onClick={() => navigate("/profile")}>
            <span>👤</span>
            Profile
          </button>

          <button onClick={() => navigate("/purchased-status")}>
            <span>✈️</span>
            Purchased Status
          </button>

          <button onClick={() => navigate("/purchase-history")}>
            <span>🕘</span>
            Purchase History
          </button>

        </div>

        <button
          onClick={logout}
          className="sidebar-logout"
        >
          <span>↪</span>
          Logout
        </button>

      </div>

      {/* Dark background when sidebar is open */}
      {menuOpen && (
        <div
          className="menu-backdrop"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

    </section>
  );
};

export default Dashboard;

