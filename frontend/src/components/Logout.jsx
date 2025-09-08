import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../auth';

function LogoutButton() {
  const navigate = useNavigate();

  const username = localStorage.getItem("visible_name") || "Користувач";

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("username"); 
    localStorage.removeItem("visible_name");
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
