import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../auth';

function LogoutButton() {
  const navigate = useNavigate();

  // Example: username from localStorage (adjust as needed)
  const username = localStorage.getItem("username") || "Користувач";

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("username"); // clear username too
    navigate("/login");
  };

  return (
    <div className="logout-section">
      <span className="logout-greeting">Привіт, {username}!</span>
      <button onClick={handleLogout} className="logout-btn">
        Вийти
      </button>
    </div>
  );
}

export default LogoutButton;
