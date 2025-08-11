import React from 'react';
import { NavLink } from 'react-router-dom';

function Nav({ username }) {
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
     
    </nav>
  );
}

export default Nav;