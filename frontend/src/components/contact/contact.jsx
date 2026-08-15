import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import "./contact.css";

const Contact = ({ setShowLogin }) => {
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReviews = async () => {
    try {
      const response = await api.get("/reviews/");
      setReviews(response.data);
    } catch (err) {
      setError("Unable to load reviews.");
    }
  };

  useEffect(() => {
    loadReviews();

    if (localStorage.getItem("token")) {
      api.get("/userinfo/me")
        .then((response) => setCurrentUser(response.data))
        .catch(() => setCurrentUser(null));
    }
  }, []);

  const resetReviewForm = () => {
    setRating(5);
    setComment("");
    setEditingReviewId(null);
    setOpenMenuId(null);
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setShowLogin(true);
      return;
    }

    try {
      const payload = {
        rating: Number(rating),
        comment
      };

      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, payload);
      } else {
        await api.post("/reviews/", payload);
      }

      resetReviewForm();
      setMessage(editingReviewId ? "Review updated successfully." : "Review submitted successfully.");
      loadReviews();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to submit review.");
    }
  };

  const startEditReview = (review) => {
    setRating(review.rating);
    setComment(review.comment);
    setEditingReviewId(review.review_id);
    setOpenMenuId(null);
  };

  const deleteReview = async (reviewId) => {
    const confirmed = window.confirm("Delete this review?");

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await api.delete(`/reviews/${reviewId}`);
      setMessage("Review deleted successfully.");
      resetReviewForm();
      loadReviews();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to delete review.");
    }
  };

  return (
    <section id="Contact" className="contact-section">
      <div className="contact-content">
        <div className="contact-info">
          <p className="contact-label">Get in touch</p>
          <h1>Contact Us</h1>
          <p className="contact-text">
            Have a question about travel plans, tickets, or destinations? Reach
            out anytime and we will help you plan your next trip.
          </p>
        </div>

        <div className="contact-card">
          <a href="mailto:wke9818@gamil.com" className="contact-item">
            <span className="contact-icon">@</span>
            <div>
              <p>Email</p>
              <strong>wke9818@gamil.com</strong>
            </div>
          </a>

          <a href="tel:0979797979" className="contact-item">
            <span className="contact-icon">☎</span>
            <div>
              <p>Phone</p>
              <strong>0979797979</strong>
            </div>
          </a>
        </div>
      </div>

      <div className="review-section">
        <div className="review-heading">
          <p>Community</p>
          <h2>Reviews</h2>
        </div>

        <form className="review-form" onSubmit={submitReview}>
          <label>
            Rating
            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>
          </label>

          <label>
            Review
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share your travel experience"
              required
            ></textarea>
          </label>

          {message && <p className="review-success">{message}</p>}
          {error && <p className="review-error">{error}</p>}

          <button type="submit">
            {editingReviewId ? "Update Review" : "Submit Review"}
          </button>

          {editingReviewId && (
            <button
              type="button"
              className="review-cancel"
              onClick={resetReviewForm}
            >
              Cancel
            </button>
          )}
        </form>

        <div className="review-list">
          {reviews.length === 0 ? (
            <p className="review-empty">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <article className="review-card" key={review.review_id}>
                <div className="review-card-header">
                  <h3>{review.user.username}</h3>
                  <div className="review-card-actions">
                    <span>{review.rating}/5</span>

                    {currentUser?.id === review.user.id && (
                      <div className="review-menu-wrap">
                        <button
                          className="review-menu-button"
                          type="button"
                          onClick={() => setOpenMenuId(
                            openMenuId === review.review_id ? null : review.review_id
                          )}
                        >
                          ⋯
                        </button>

                        {openMenuId === review.review_id && (
                          <div className="review-menu">
                            <button type="button" onClick={() => startEditReview(review)}>
                              Edit
                            </button>
                            <button type="button" onClick={() => deleteReview(review.review_id)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p>{review.comment}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
