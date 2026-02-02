import React from 'react';
import './Dashboard.css';
import { FaUserFriends, FaBriefcase, FaFileInvoiceDollar, FaMoneyBillWave, FaPlus, FaArrowUp, FaArrowDown, FaBell } from 'react-icons/fa';

const stats = [
  {
    title: 'Total Clients',
    count: '24',
    icon: <FaUserFriends />,
    trend: '+12%',
    trendUp: true,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: 'Active Projects',
    count: '12',
    icon: <FaBriefcase />,
    trend: '+5%',
    trendUp: true,
    color: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)'
  },
  {
    title: 'Unpaid Invoices',
    count: '05',
    icon: <FaFileInvoiceDollar />,
    trend: '-2%',
    trendUp: false,
    color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'
  },
  {
    title: 'Total Revenue',
    count: '$45,200',
    icon: <FaMoneyBillWave />,
    trend: '+18%',
    trendUp: true,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  }
];

const recentActivity = [
  { id: 1, text: 'New invoice generated for Google.', time: '2 mins ago', type: 'invoice' },
  { id: 2, text: 'Project "HyperTool AI" marked as completed.', time: '1 hour ago', type: 'project' },
  { id: 3, text: 'New client "TechSolutions" added.', time: '3 hours ago', type: 'client' },
  { id: 4, text: 'Payment of $5,000 received from Amazon.', time: '5 hours ago', type: 'payment' },
];

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header-modern">
        <div>
          <h2 className="welcome-text">Overview</h2>
          <p className="welcome-subtext">Here's what's happening with your business today.</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn">
            <FaBell />
            <span className="badge">3</span>
          </button>
          <div className="user-profile-preview">
            <div className="avatar">A</div>
            <span>Admin</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon-wrapper" style={{ background: item.color }}>
              {item.icon}
            </div>
            <div className="stat-info">
              <span className="stat-title">{item.title}</span>
              <h3 className="stat-count">{item.count}</h3>
              <div className={`stat-trend ${item.trendUp ? 'trend-up' : 'trend-down'}`}>
                {item.trendUp ? <FaArrowUp /> : <FaArrowDown />}
                <span>{item.trend} last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid (Recent Activity & Quick Actions) */}
      <div className="dashboard-content-grid">
        {/* Recent Activity Window */}
        <div className="content-card activity-card">
          <div className="card-header-flex">
            <h3>Recent Activity</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <ul className="activity-list">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="activity-item">
                <div className={`activity-indicator ${activity.type}`}></div>
                <div className="activity-details">
                  <p className="activity-text">{activity.text}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions Window */}
        <div className="content-card actions-card">
          <div className="card-header-flex">
            <h3>Quick Actions</h3>
          </div>
          <div className="actions-grid">
            <button className="action-btn">
              <div className="action-icon c-blue"><FaPlus /></div>
              <span>New Invoice</span>
            </button>
            <button className="action-btn">
              <div className="action-icon c-green"><FaPlus /></div>
              <span>Add Client</span>
            </button>
            <button className="action-btn">
              <div className="action-icon c-purple"><FaPlus /></div>
              <span>Create Project</span>
            </button>
            <button className="action-btn">
              <div className="action-icon c-orange"><FaPlus /></div>
              <span>Log Expense</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
