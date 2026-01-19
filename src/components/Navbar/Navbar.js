// src/components/Navbar.js
import React from 'react';
import { HiMenu } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';  // Import the CSS file

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Assuming useAuth exposes user object

  return (
    <div className="navbar">
      <div className="menu-icon" onClick={() => toggleSidebar()}>
        <HiMenu />
      </div>
      <div className="navbar-user">
        {user ?
          <span className="user-greeting">Hi, {user.name}</span> :
          <span>Guest</span>
        }
        <div className="user-avatar">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
