import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
=======
import { clearToken } from '../auth'; // <- актуальна функція для логауту
>>>>>>> 20e4b27f4010c94957c544768fdf9f85ba0fe35e

function Nav() {
  const navigate = useNavigate();

<<<<<<< HEAD
=======
  const handleLogout = () => {
    clearToken();     // видаляємо токен через auth.js
    navigate("/login"); // редірект на логін
  };

>>>>>>> 20e4b27f4010c94957c544768fdf9f85ba0fe35e
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

<<<<<<< HEAD
=======
      <div className="nav-logout">
        <button onClick={handleLogout} className="logout-btn">
          Вийти
        </button>
      </div>
>>>>>>> 20e4b27f4010c94957c544768fdf9f85ba0fe35e
    </nav>
  );
}

export default Nav;
