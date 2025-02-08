import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/signup" className="nav-link">
            Volunteer Signup
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/applications" className="nav-link admin-link">
            Applications (Admin)
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/volunteers" className="nav-link admin-link">
            Volunteer List (Admin)
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; 