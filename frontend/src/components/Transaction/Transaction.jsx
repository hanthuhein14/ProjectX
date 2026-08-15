import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./Transaction.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const PAYMENT_METHODS = ["Kpay", "Wavepay", "AyaPay"];

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

const Transaction = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Kpay");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [preview, setPreview] = useState("");
  const [canRatePlan, setCanRatePlan] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingMessage, setRatingMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = useMemo(() => {
    if (!plan) {
      return 0;
    }

    return plan.amount * ticketCount;
  }, [plan, ticketCount]);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const [planResponse, bookingsResponse, ratingsResponse] = await Promise.all([
          api.get(`/plans/${planId}`),
          api.get("/bookings/me"),
          api.get("/plans/ratings/me")
        ]);

        setPlan(planResponse.data);
        setCanRatePlan(
          bookingsResponse.data.some(
            (booking) => booking.plan_id === Number(planId) && booking.status === "approved"
          )
        );
        setUserRating(ratingsResponse.data[planId] || 0);
      } catch (err) {
        setError("Unable to load this plan.");
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [planId]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleTicketCount = (event) => {
    const value = Number(event.target.value);
    const nextValue = Math.max(1, Math.min(value, plan?.ticket_count || 1));

    setTicketCount(nextValue);
  };

  const handleScreenshot = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setPaymentScreenshot(null);
      setPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Payment screenshot must be an image.");
      return;
    }

    setPaymentScreenshot(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setError("");

    if (!paymentScreenshot) {
      setError("Please upload your payment screenshot.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("ticket_count", ticketCount);
      formData.append("payment_method", paymentMethod);
      formData.append("payment_screenshot", paymentScreenshot);

      await api.post(
        `/bookings/${planId}`,
        formData
      );

      navigate("/booking-status");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to submit booking request.");
    } finally {
      setSubmitting(false);
    }
  };

  const ratePlan = async (rating) => {
    setRatingMessage("");
    setError("");

    try {
      const response = await api.post(`/plans/${planId}/rating`, {
        rating
      });

      setUserRating(response.data.rating);
      setRatingMessage("Rating saved successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to save rating.");
    }
  };

  if (loading) {
    return (
      <main className="transaction-page">
        <p className="transaction-message">Loading transaction...</p>
      </main>
    );
  }

  if (!plan) {
    return (
      <main className="transaction-page">
        <p className="transaction-error">{error || "Plan not found."}</p>
      </main>
    );
  }

  const photoUrl = getPlanPhotoUrl(plan.plan_photo);

  return (
    <main className="transaction-page">
      <header className="transaction-header">
        <div>
          <p>Payment request</p>
          <h1>Transaction</h1>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </header>

      <section className="transaction-layout">
        <article className="transaction-plan">
          {photoUrl ? (
            <img src={photoUrl} alt={plan.plan_name} />
          ) : (
            <div className="transaction-placeholder">
              {plan.plan_to.charAt(0)}
            </div>
          )}

          <div className="transaction-plan-body">
            <h2>{plan.plan_name}</h2>
            <p>{plan.plan_from} to {plan.plan_to}</p>
            <span>{plan.ticket_count} tickets available</span>
            <div className="transaction-rating-summary">
              <strong>{plan.average_rating}/5 stars</strong>
              <span>{plan.rating_count} ratings</span>
            </div>
            <div className="transaction-rate-box">
              <p>{canRatePlan ? `Your rating: ${userRating || "none"}` : "Rating unlocks after admin approval"}</p>
              <div className="transaction-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={!canRatePlan}
                    className={star <= userRating ? "active" : ""}
                    onClick={() => ratePlan(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
              {ratingMessage && <span className="transaction-rating-message">{ratingMessage}</span>}
            </div>
          </div>
        </article>

        <form className="transaction-form" onSubmit={submitBooking}>
          <label>
            Payment method
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              {PAYMENT_METHODS.map((method) => (
                <option value={method} key={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ticket count
            <input
              type="number"
              min="1"
              max={plan.ticket_count}
              value={ticketCount}
              onChange={handleTicketCount}
              required
            />
          </label>

          <label>
            Payment screenshot
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshot}
              required
            />
          </label>

          {preview && (
            <img
              src={preview}
              alt="Payment screenshot preview"
              className="transaction-preview"
            />
          )}

          <div className="transaction-voucher">
            <h3>Voucher</h3>
            <div>
              <span>Price</span>
              <strong>{formatMMK(plan.amount)}</strong>
            </div>
            <div>
              <span>Tickets</span>
              <strong>{ticketCount}</strong>
            </div>
            <div>
              <span>Payment</span>
              <strong>{paymentMethod}</strong>
            </div>
            <div className="transaction-total">
              <span>Total</span>
              <strong>{formatMMK(totalAmount)}</strong>
            </div>
          </div>

          {error && <p className="transaction-error">{error}</p>}

          <button type="submit" disabled={submitting || plan.ticket_count <= 0}>
            {submitting ? "Submitting..." : "Submit For Approval"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Transaction;
