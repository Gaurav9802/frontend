// src/components/Sidebar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar-container">
      <aside className="sidebar">
        <h1 className="sidebar-title">Portfolio</h1>
        <nav className="sidebar-nav">
          <Link to='/' className="sidebar-link">Dashboard</Link>
          <Link to='/clients' className="sidebar-link">Clients</Link>
          <Link to='/projects' className='sidebar-link' > Projects</Link>
          <Link to='/invoices' className='sidebar-link' > Invoices</Link>
          <Link to='/followups' className='sidebar-link' > Followup</Link>
          <Link to="/expenses" className="sidebar-link">
            Expenses
          </Link>
          <Link to="/change-password" className="sidebar-link">
            Change Password 🔒
          </Link>

          {role === 'superadmin' && (
            <Link to="/admins" className="sidebar-link admin-only">
              Manage Admins
            </Link>
          )}

          <button onClick={handleLogout} className="sidebar-link logout-btn">
            Logout
          </button>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
