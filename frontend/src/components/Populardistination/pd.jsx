import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./pd.css";

const API_BASE_URL = "http://127.0.0.1:8000";
const formatMMK = (amount) => `${Number(amount).toLocaleString()} MMK`;

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

const PopularDestination = ({ setShowLogin }) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleDestinationClick = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowLogin(true);
    }
  };

  const handleDestinationKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleDestinationClick();
    }
  };

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const response = await api.get("/plans/popular-destinations", {
          params: {
            limit: 3
          }
        });

        setDestinations(response.data);
        setError("");
      } catch (err) {
        setError("Popular destinations are unavailable right now.");
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  return (
    <section id="PopularDestination" className="popular-destination">
      <div className="popular-destination-inner">
        <div className="popular-destination-title">
          <p>Travel plans</p>
          <h1>Popular Destinations</h1>
        </div>

        {loading && (
          <div className="popular-message">Loading destinations...</div>
        )}

        {!loading && error && (
          <div className="popular-message">{error}</div>
        )}

        {!loading && !error && destinations.length === 0 && (
          <div className="popular-message">No destinations available yet.</div>
        )}

        {!loading && !error && destinations.length > 0 && (
          <div className="popular-grid">
            {destinations.map((destination) => {
              const photoUrl = getPlanPhotoUrl(destination.photo);

              return (
                <article
                  className="popular-card"
                  key={destination.destination}
                  role="button"
                  tabIndex="0"
                  onClick={handleDestinationClick}
                  onKeyDown={handleDestinationKeyDown}
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={destination.destination}
                      className="popular-card-image"
                    />
                  ) : (
                    <div className="popular-card-placeholder">
                      {destination.destination.charAt(0)}
                    </div>
                  )}

                  <div className="popular-card-body">
                    <h2>{destination.destination}</h2>

                    <div className="popular-card-details">
                      <span>{destination.total_plans} plans</span>
                      <span>{destination.total_tickets} tickets</span>
                      <span>{destination.average_rating}/5 stars</span>
                      <span>{destination.rating_count} ratings</span>
                    </div>

                    <p>
                      From <strong>{formatMMK(destination.lowest_amount)}</strong>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularDestination;
