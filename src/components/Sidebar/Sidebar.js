import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaThLarge,
  FaUserFriends,
  FaBriefcase,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaClipboardList,
  FaLock,
  FaUserShield,
  FaSignOutAlt
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaThLarge /> },
    { path: '/clients', label: 'Clients', icon: <FaUserFriends /> },
    { path: '/projects', label: 'Projects', icon: <FaBriefcase /> },
    { path: '/invoices', label: 'Invoices', icon: <FaFileInvoiceDollar /> },
    { path: '/followups', label: 'Followups', icon: <FaClipboardList /> },
    { path: '/expenses', label: 'Expenses', icon: <FaMoneyBillWave /> },
  ];

  const superAdminItems = [
    { path: '/super-admin/dashboard', label: 'Dashboard', icon: <FaThLarge /> },
    { path: '/super-admin/admins', label: 'Manage Admins', icon: <FaUserShield /> },
    { path: '/super-admin/plans', label: 'Subscription Plans', icon: <FaMoneyBillWave /> },
  ];

  const itemsToRender = role === 'superadmin' ? superAdminItems : menuItems;

  return (
    <div className="sidebar-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/hypertool-logo.png" alt="Hypertool" className="sidebar-logo" />
          <h1 className="sidebar-brand">
            {role === 'superadmin' ? 'SUPERADMIN' : 'HYPERTOOL'}
          </h1>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">MENU</p>
          {itemsToRender.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="link-icon">{item.icon}</span>
              <span className="link-text">{item.label}</span>
            </NavLink>
          ))}

          <div style={{ marginTop: 'auto' }}>
            <p className="sidebar-section-label">SETTINGS</p>
            <NavLink to="/change-password" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="link-icon"><FaLock /></span>
              <span className="link-text">Change Password</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </div >
  );
};

export default Sidebar;
