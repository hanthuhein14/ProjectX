
import "./profile.css";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import React, { useEffect, useState } from "react";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: "",
    email: "",
    profile_photo: null,
  });

  const [newUsername, setNewUsername] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);


  // =========================
  // GET USER INFORMATION
  // =========================

  const getUserInfo = async () => {
    try {
      const response = await api.get("/userinfo/me");

      setUser({
        username: response.data.username,
        email: response.data.email,
        profile_photo: response.data.profile_photo,
      });

      setNewUsername(response.data.username);

    } catch (error) {
      console.error("GET USER ERROR:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };


  useEffect(() => {
    getUserInfo();
  }, [navigate]);


  // =========================
  // SELECT PHOTO
  // =========================

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    setSelectedPhoto(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };


  // =========================
  // UPDATE PHOTO
  // =========================

  const updatePhoto = async () => {
    if (!selectedPhoto) {
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("profile_photo", selectedPhoto);

      await api.put(
        "/userinfo/update",
        formData
      );

      // Get updated information from database
      const response = await api.get(
        "/userinfo/me"
      );

      setUser({
        username: response.data.username,
        email: response.data.email,
        profile_photo: response.data.profile_photo,
      });

      setSelectedPhoto(null);
      setPreview(null);

      alert("Profile photo updated successfully!");

    } catch (error) {
      console.error("PHOTO UPDATE ERROR:", error);

      alert(
        error.response?.data?.detail ||
        "Failed to update profile photo."
      );

    } finally {
      setLoading(false);
    }
  };


  // =========================
  // UPDATE USERNAME
  // =========================

  const updateUsername = async () => {
    const username = newUsername.trim();

    if (!username) {
      alert("Username cannot be empty.");
      return;
    }

    if (username === user.username) {
      alert("This is already your username.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "username",
        username
      );

      await api.put(
        "/userinfo/update",
        formData
      );

      // Get updated information
      const response = await api.get(
        "/userinfo/me"
      );

      setUser({
        username: response.data.username,
        email: response.data.email,
        profile_photo: response.data.profile_photo,
      });

      setNewUsername(response.data.username);

      alert("Username updated successfully!");

    } catch (error) {
      console.error("USERNAME UPDATE ERROR:", error);

      alert(
        error.response?.data?.detail ||
        "Failed to update username."
      );

    } finally {
      setLoading(false);
    }
  };


  // =========================
  // PROFILE PHOTO URL
  // =========================

  const profilePhotoUrl = user.profile_photo
    ? `${import.meta.env.VITE_API_URL}/uploads/profile/${user.profile_photo}`
    : null;


  // =========================
  // UI
  // =========================

  return (
    <div className="profile-page">

      <div className="profile-card">

        {/* PROFILE PHOTO */}

        <div className="profile-avatar-container">

          {preview ? (

            <img
              src={preview}
              alt="Selected profile"
              className="profile-avatar-image"
            />

          ) : profilePhotoUrl ? (

            <img
              src={profilePhotoUrl}
              alt="Profile"
              className="profile-avatar-image"
            />

          ) : (

            <div className="profile-avatar">
              {user.username
                ? user.username
                    .charAt(0)
                    .toUpperCase()
                : "?"}
            </div>

          )}


          {/* CAMERA */}

          <label className="change-photo">

            📷

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoChange}
            />

          </label>

        </div>


        {/* UPDATE PHOTO */}

        {selectedPhoto && (

          <button
            className="update-photo-button"
            onClick={updatePhoto}
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Photo"}
          </button>

        )}


        <h1>My Profile</h1>


        {/* USERNAME */}

        <div className="profile-item">

          <span className="profile-label">
            Username
          </span>

          <input
            type="text"
            value={newUsername}
            onChange={(e) =>
              setNewUsername(e.target.value)
            }
            className="username-input"
            maxLength={30}
          />

          <button
            className="update-username-button"
            onClick={updateUsername}
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Username"}
          </button>

        </div>


        {/* EMAIL */}

        <div className="profile-item">

          <span className="profile-label">
            Email
          </span>

          <span className="profile-value">
            {user.email}
          </span>

        </div>


        {/* BACK */}

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </div>

    </div>
  );
};

export default Profile;

