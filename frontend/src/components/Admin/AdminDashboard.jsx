import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./Admin.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

const emptyPlan = {
  plan_name: "",
  plan_from: "",
  plan_to: "",
  amount: "",
  plan_photo: "",
  ticket_count: ""
};

const getAdminConfig = (token = localStorage.getItem("adminToken")) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

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

const getPaymentScreenshotUrl = (screenshot) => {
  if (!screenshot) {
    return "";
  }

  if (screenshot.startsWith("http://") || screenshot.startsWith("https://")) {
    return screenshot;
  }

  const cleanScreenshot = screenshot.replaceAll("\\", "/");

  if (cleanScreenshot.startsWith("/uploads/")) {
    return `${API_BASE_URL}${cleanScreenshot}`;
  }

  if (cleanScreenshot.startsWith("uploads/")) {
    return `${API_BASE_URL}/${cleanScreenshot}`;
  }

  return `${API_BASE_URL}/uploads/payment/${cleanScreenshot}`;
};

const UsageChart = ({ points }) => {
  const chartPoints = points.length > 0 ? points : [{ label: "Start", users: 0 }];
  const maxUsers = Math.max(...chartPoints.map((point) => point.users), 1);
  const width = 620;
  const height = 220;
  const padding = 34;

  const linePoints = chartPoints.map((point, index) => {
    const x =
      chartPoints.length === 1
        ? width / 2
        : padding + (index * (width - padding * 2)) / (chartPoints.length - 1);
    const y = height - padding - (point.users / maxUsers) * (height - padding * 2);

    return {
      ...point,
      x,
      y
    };
  });

  const polyline = linePoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <div className="admin-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Website usage growth chart">
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          className="chart-axis"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          className="chart-axis"
        />
        <polyline points={polyline} className="chart-line" />

        {linePoints.map((point) => (
          <g key={`${point.label}-${point.users}`}>
            <circle cx={point.x} cy={point.y} r="5" className="chart-dot" />
            <text x={point.x} y={height - 10} textAnchor="middle" className="chart-label">
              {point.label}
            </text>
            <text x={point.x} y={point.y - 12} textAnchor="middle" className="chart-value">
              {point.users}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    user_count: 0,
    plan_count: 0,
    total_tickets: 0,
    usage_growth: []
  });
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [selectedPlanPhoto, setSelectedPlanPhoto] = useState(null);
  const [planPhotoPreview, setPlanPhotoPreview] = useState("");
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const statCards = useMemo(
    () => [
      {
        label: "Users",
        value: stats.user_count
      },
      {
        label: "Plans",
        value: stats.plan_count
      },
      {
        label: "Tickets",
        value: stats.total_tickets
      }
    ],
    [stats]
  );

  const handleAdminFailure = (err) => {
    if (err.response?.status === 401) {
      setError("Admin session expired. Please login again.");
      return;
    }

    setError(err.response?.data?.detail || "Admin action failed.");
  };

  const refreshAdminSession = async () => {
    const response = await api.post("/admin/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    localStorage.setItem("adminToken", response.data.access_token);

    return response.data.access_token;
  };

  const requestWithAdminAuth = async (requestFn) => {
    try {
      return await requestFn(getAdminConfig());
    } catch (err) {
      if (err.response?.status !== 401) {
        throw err;
      }

      const newToken = await refreshAdminSession();
      return requestFn(getAdminConfig(newToken));
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [plansResponse, reviewsResponse] = await Promise.all([
        api.get("/plans/"),
        api.get("/reviews/")
      ]);
      const [usersResponse, statsResponse, bookingsResponse] = await requestWithAdminAuth(
        (config) => Promise.all([
          api.get("/admin/users", config),
          api.get("/admin/stats", config),
          api.get("/admin/bookings", config)
        ])
      );

      setPlans(plansResponse.data);
      setUsers(usersResponse.data);
      setStats(statsResponse.data);
      setBookings(bookingsResponse.data);
      setReviews(reviewsResponse.data);
    } catch (err) {
      handleAdminFailure(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    return () => {
      if (planPhotoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(planPhotoPreview);
      }
    };
  }, [planPhotoPreview]);

  const handlePlanInput = (event) => {
    const { name, value } = event.target;

    setPlanForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  };

  const handlePlanPhotoInput = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedPlanPhoto(null);
      setPlanPhotoPreview(getPlanPhotoUrl(planForm.plan_photo));
      return;
    }

    setSelectedPlanPhoto(file);
    setPlanPhotoPreview(URL.createObjectURL(file));
  };

  const resetPlanForm = () => {
    setPlanForm(emptyPlan);
    setSelectedPlanPhoto(null);
    setPlanPhotoPreview("");
    setPhotoInputKey((currentKey) => currentKey + 1);
    setEditingPlanId(null);
  };

  const uploadSelectedPlanPhoto = async () => {
    if (!selectedPlanPhoto) {
      return planForm.plan_photo || null;
    }

    const formData = new FormData();
    formData.append("plan_photo", selectedPlanPhoto);

    const response = await requestWithAdminAuth(
      (config) => api.post(
        "/plans/upload-photo",
        formData,
        config
      )
    );

    return response.data.filename;
  };

  const getPlanPayload = (photoName) => ({
    plan_name: planForm.plan_name,
    plan_from: planForm.plan_from,
    plan_to: planForm.plan_to,
    amount: Number(planForm.amount),
    plan_photo: photoName,
    ticket_count: Number(planForm.ticket_count)
  });

  const handlePlanSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const planPhoto = await uploadSelectedPlanPhoto();

      if (editingPlanId) {
        await requestWithAdminAuth(
          (config) => api.put(
            `/plans/${editingPlanId}`,
            getPlanPayload(planPhoto),
            config
          )
        );
        setMessage("Plan updated successfully.");
      } else {
        await requestWithAdminAuth(
          (config) => api.post(
            "/plans/",
            getPlanPayload(planPhoto),
            config
          )
        );
        setMessage("Plan created successfully.");
      }

      resetPlanForm();
      loadDashboard();
    } catch (err) {
      handleAdminFailure(err);
    }
  };

  const startEditPlan = (plan) => {
    setEditingPlanId(plan.plan_id);
    setPlanForm({
      plan_name: plan.plan_name,
      plan_from: plan.plan_from,
      plan_to: plan.plan_to,
      amount: String(plan.amount),
      plan_photo: plan.plan_photo || "",
      ticket_count: String(plan.ticket_count)
    });
    setSelectedPlanPhoto(null);
    setPhotoInputKey((currentKey) => currentKey + 1);
    setPlanPhotoPreview(getPlanPhotoUrl(plan.plan_photo));
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const deletePlan = async (planId) => {
    const confirmed = window.confirm("Delete this plan?");

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await requestWithAdminAuth(
        (config) => api.delete(
          `/plans/${planId}`,
          config
        )
      );
      setMessage("Plan deleted successfully.");
      loadDashboard();
    } catch (err) {
      handleAdminFailure(err);
    }
  };

  const deleteUser = async (userId) => {
    const confirmed = window.confirm("Delete this user account?");

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await requestWithAdminAuth(
        (config) => api.delete(
          `/admin/users/${userId}`,
          config
        )
      );
      setMessage("User account deleted successfully.");
      loadDashboard();
    } catch (err) {
      handleAdminFailure(err);
    }
  };

  const updateBookingStatus = async (bookingId, bookingStatus) => {
    setMessage("");
    setError("");

    try {
      await requestWithAdminAuth(
        (config) => api.put(
          `/admin/bookings/${bookingId}/${bookingStatus}`,
          {},
          config
        )
      );
      setMessage(`Booking ${bookingStatus} successfully.`);
      loadDashboard();
    } catch (err) {
      handleAdminFailure(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Control center</p>
          <h1>Admin Dashboard</h1>
        </div>

        <button className="admin-logout" onClick={logout}>
          Logout
        </button>
      </header>

      {message && <p className="admin-success">{message}</p>}
      {error && <p className="admin-error">{error}</p>}

      <section className="admin-stats">
        {statCards.map((card) => (
          <div className="admin-stat-card" key={card.label}>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </div>
        ))}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>Website Usage Growth</h2>
          <p>Cumulative user growth from current account records.</p>
        </div>

        <UsageChart points={stats.usage_growth} />
      </section>

      <section className="admin-grid-layout">
        <form className="admin-panel admin-form" onSubmit={handlePlanSubmit}>
          <div className="admin-panel-heading">
            <h2>{editingPlanId ? "Update Plan" : "Create Plan"}</h2>
            <p>Manage travel plan data shown across the website.</p>
          </div>

          <label>
            Plan name
            <input
              name="plan_name"
              value={planForm.plan_name}
              onChange={handlePlanInput}
              required
            />
          </label>

          <div className="admin-form-row">
            <label>
              From
              <input
                name="plan_from"
                value={planForm.plan_from}
                onChange={handlePlanInput}
                required
              />
            </label>

            <label>
              To
              <input
                name="plan_to"
                value={planForm.plan_to}
                onChange={handlePlanInput}
                required
              />
            </label>
          </div>

          <div className="admin-form-row">
            <label>
              Amount (MMK)
              <input
                name="amount"
                type="number"
                min="0"
                value={planForm.amount}
                onChange={handlePlanInput}
                required
              />
            </label>

            <label>
              Ticket count
              <input
                name="ticket_count"
                type="number"
                min="0"
                value={planForm.ticket_count}
                onChange={handlePlanInput}
                required
              />
            </label>
          </div>

          <div className="admin-photo-field">
            <label>
              Trip photo
              <input
                key={photoInputKey}
                type="file"
                accept="image/*"
                onChange={handlePlanPhotoInput}
              />
            </label>

            {planPhotoPreview && (
              <img
                src={planPhotoPreview}
                alt="Selected trip"
                className="admin-photo-preview"
              />
            )}

            {planForm.plan_photo && !selectedPlanPhoto && (
              <p className="admin-photo-name">Current photo: {planForm.plan_photo}</p>
            )}
          </div>

          <div className="admin-form-actions">
            <button type="submit">
              {editingPlanId ? "Update Plan" : "Create Plan"}
            </button>

            {editingPlanId && (
              <button type="button" className="admin-secondary" onClick={resetPlanForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Plans</h2>
            <p>Create, edit, and delete destination plans.</p>
          </div>

          {loading ? (
            <p className="admin-muted">Loading plans...</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Route</th>
                    <th>Amount</th>
                    <th>Tickets</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.plan_id}>
                      <td>{plan.plan_name}</td>
                      <td>{plan.plan_from} to {plan.plan_to}</td>
                      <td>{formatMMK(plan.amount)}</td>
                      <td>{plan.ticket_count}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button onClick={() => startEditPlan(plan)}>Edit</button>
                          <button className="admin-danger" onClick={() => deletePlan(plan.plan_id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>Booking Requests</h2>
          <p>Approve or reject ticket requests from users.</p>
        </div>

        {loading ? (
          <p className="admin-muted">Loading requests...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Tickets</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Screenshot</th>
                  <th>User Stars</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td>{booking.user.username}</td>
                    <td>{booking.plan.plan_name}</td>
                    <td>{booking.ticket_count}</td>
                    <td>{formatMMK(booking.total_amount)}</td>
                    <td>{booking.payment_method}</td>
                    <td>
                      {booking.payment_screenshot ? (
                        <a
                          className="admin-link"
                          href={getPaymentScreenshotUrl(booking.payment_screenshot)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        "No screenshot"
                      )}
                    </td>
                    <td>{booking.user_rating ? `${booking.user_rating}/5` : "No rating"}</td>
                    <td>
                      <span className={`admin-status-pill ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          disabled={booking.status === "approved"}
                          onClick={() => updateBookingStatus(booking.booking_id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="admin-danger"
                          disabled={booking.status === "rejected"}
                          onClick={() => updateBookingStatus(booking.booking_id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>User Reviews</h2>
          <p>All reviews submitted from the contact section.</p>
        </div>

        {loading ? (
          <p className="admin-muted">Loading reviews...</p>
        ) : (
          <div className="admin-review-grid">
            {reviews.length === 0 ? (
              <p className="admin-muted">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <article className="admin-review-card" key={review.review_id}>
                  <div>
                    <h3>{review.user.username}</h3>
                    <span>{review.rating}/5</span>
                  </div>
                  <p>{review.comment}</p>
                </article>
              ))
            )}
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>Users</h2>
          <p>View registered accounts and remove accounts when needed.</p>
        </div>

        {loading ? (
          <p className="admin-muted">Loading users...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Photo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.profile_photo || "No photo"}</td>
                    <td>
                      <button className="admin-danger" onClick={() => deleteUser(user.id)}>
                        Delete Account
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminDashboard;
