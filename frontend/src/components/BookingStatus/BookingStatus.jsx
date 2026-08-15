import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./BookingStatus.css";

const formatMMK = (amount) => `${Number(amount).toLocaleString()} MMK`;

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected"
};

const BookingStatus = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await api.get("/bookings/me");
        setBookings(response.data);
      } catch (err) {
        setError("Unable to load booking status.");

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [navigate]);

  return (
    <main className="booking-status-page">
      <header className="booking-status-header">
        <div>
          <p>Ticket requests</p>
          <h1>Booking Status</h1>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          Back to Plans
        </button>
      </header>

      {loading && <p className="booking-status-message">Loading requests...</p>}
      {error && <p className="booking-status-error">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p className="booking-status-message">You have not requested any tickets yet.</p>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="booking-status-list">
          {bookings.map((booking) => (
            <article className="booking-status-card" key={booking.booking_id}>
              <div>
                <span className={`booking-badge ${booking.status}`}>
                  {statusLabels[booking.status] || booking.status}
                </span>
                <h2>{booking.plan.plan_name}</h2>
                <p>{booking.plan.plan_from} to {booking.plan.plan_to}</p>
                <div className="booking-voucher">
                  <span>{booking.ticket_count} tickets</span>
                  <span>{booking.payment_method}</span>
                  <strong>Total: {formatMMK(booking.total_amount)}</strong>
                </div>
              </div>

              <div className="booking-status-meta">
                <span>{formatMMK(booking.plan.amount)} each</span>
                <span>{new Date(booking.created_at).toLocaleDateString()}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default BookingStatus;
