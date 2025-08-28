import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearToken } from '../auth'; // <- актуальна функція для логауту

function Nav() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();     // видаляємо токен через auth.js
    navigate("/login"); // редірект на логін
  };

  return (
    <nav className="main-nav underline-indicators">
      <ul className="nav-list">
        <li className="nav-item">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Керування
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/base" className={({ isActive }) => isActive ? 'active' : ''}>
            База серверів
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/monitoring" className={({ isActive }) => isActive ? 'active' : ''}>
            Моніторинг
          </NavLink>
        </li>
      </ul>

      <div className="nav-logout">
        <button onClick={handleLogout} className="logout-btn">
          Вийти
        </button>
      </div>
    </nav>
  );
}

export default Nav;
