import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";

const API_BASE_URL = "http://127.0.0.1:8000";

const getPlanPhotoUrl = (photo) => {
  if (!photo) {
    return "";
  }

  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  const cleanPhoto = photo.replaceAll("\\", "/");

  if (cleanPhoto.startsWith("/uploads/")) {
    return `${API_BASE_URL}${cleanPhoto}`;
  }

  if (cleanPhoto.startsWith("uploads/")) {
    return `${API_BASE_URL}/${cleanPhoto}`;
  }

  return `${API_BASE_URL}/uploads/plans/${cleanPhoto}`;
};

const formatMMK = (amount) => `${Number(amount).toLocaleString()} MMK`;

const Dashboard = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [plans, setPlans] = useState([]);
  const [bookedPlanIds, setBookedPlanIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [userResponse, plansResponse, bookingsResponse] = await Promise.all([
          api.get("/userinfo/me"),
          api.get("/plans/"),
          api.get("/bookings/me")
        ]);

        setUsername(userResponse.data.username);
        setPlans(plansResponse.data);
        setBookedPlanIds(
          bookingsResponse.data
            .filter((booking) => booking.status === "pending")
            .map((booking) => booking.plan_id)
        );
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        setError("Unable to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
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
        <p className="welcome-text">Welcome back</p>
        <h1 className="usergreeting">{username}</h1>
      </div>

      <div className="dashboard-plans">
        <div className="dashboard-section-heading">
          <h2>Available Plans</h2>
          <p>Choose a trip and request admin approval for your ticket.</p>
        </div>

        {message && <p className="dashboard-success">{message}</p>}
        {error && <p className="dashboard-error">{error}</p>}

        {loading ? (
          <p className="dashboard-muted">Loading plans...</p>
        ) : (
          <div className="dashboard-plan-grid">
            {plans.map((plan) => {
              const photoUrl = getPlanPhotoUrl(plan.plan_photo);
              const alreadyRequested = bookedPlanIds.includes(plan.plan_id);

              return (
                <article className="dashboard-plan-card" key={plan.plan_id}>
                  {photoUrl ? (
                    <img src={photoUrl} alt={plan.plan_name} />
                  ) : (
                    <div className="dashboard-plan-placeholder">
                      {plan.plan_to.charAt(0)}
                    </div>
                  )}

                  <div className="dashboard-plan-body">
                    <h3>{plan.plan_name}</h3>
                    <p>{plan.plan_from} to {plan.plan_to}</p>

                    <div className="dashboard-plan-meta">
                      <span>{formatMMK(plan.amount)}</span>
                      <span>{plan.ticket_count} tickets</span>
                      <span>{plan.average_rating}/5 stars ({plan.rating_count})</span>
                    </div>

                    <div className="dashboard-plan-actions">
                      <button
                        disabled={alreadyRequested || plan.ticket_count <= 0}
                        onClick={() => navigate(`/transaction/${plan.plan_id}`)}
                      >
                        {alreadyRequested ? "Requested" : plan.ticket_count <= 0 ? "Sold Out" : "Book"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

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

      <div className={`side-menu ${menuOpen ? "open" : ""}`}>
        <div className="side-menu-header">
          <h2>Menu</h2>

          <button
            className="close-button"
            onClick={() => setMenuOpen(false)}
          >
            x
          </button>
        </div>

        <div className="side-menu-options">
          <button onClick={() => navigate("/profile")}>
            <span>Profile</span>
            Profile
          </button>

          <button onClick={() => navigate("/booking-status")}>
            <span>Status</span>
            Booking Status
          </button>
        </div>

        <button
          onClick={logout}
          className="sidebar-logout"
        >
          <span>Logout</span>
          Logout
        </button>
      </div>

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
