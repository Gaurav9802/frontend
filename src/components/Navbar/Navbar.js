// src/components/Navbar.js
import React from 'react';
import { HiMenu } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';  // Import the CSS file

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="menu-icon" onClick={() => toggleSidebar()}>
          <HiMenu />
        </div>
        <div className="search-bar-container">
          <input type="text" placeholder="Search anything..." className="navbar-search" />
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          {user ?
            <span className="user-greeting">Hi, {user.name}</span> :
            <span className="user-greeting">Guest</span>
          }
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
