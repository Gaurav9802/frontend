import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { FaUserFriends, FaBriefcase, FaFileInvoiceDollar, FaMoneyBillWave, FaPlus, FaArrowUp, FaArrowDown, FaBell } from 'react-icons/fa';
import { config, getApiUrl, getAuthHeaders } from '../../config/api';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const url = getApiUrl(config.endpoints.dashboardStats);

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Always format stats, even if values are 0
        const formattedStats = [
          {
            title: 'Total Clients',
            count: (data.data.stats.totalClients.count || 0).toString(),
            icon: <FaUserFriends />,
            trend: `${(data.data.stats.totalClients.trend || 0) >= 0 ? '+' : ''}${data.data.stats.totalClients.trend || 0}%`,
            trendUp: data.data.stats.totalClients.trendUp,
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          },
          {
            title: 'Active Projects',
            count: (data.data.stats.activeProjects.count || 0).toString(),
            icon: <FaBriefcase />,
            trend: `${(data.data.stats.activeProjects.trend || 0) >= 0 ? '+' : ''}${data.data.stats.activeProjects.trend || 0}%`,
            trendUp: data.data.stats.activeProjects.trendUp,
            color: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)'
          },
          {
            title: 'Unpaid Invoices',
            count: (data.data.stats.unpaidInvoices.count || 0).toString().padStart(2, '0'),
            icon: <FaFileInvoiceDollar />,
            trend: `${(data.data.stats.unpaidInvoices.trend || 0) >= 0 ? '+' : ''}${data.data.stats.unpaidInvoices.trend || 0}%`,
            trendUp: data.data.stats.unpaidInvoices.trendUp,
            color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'
          },
          {
            title: 'Total Revenue',
            count: `₹${(data.data.stats.totalRevenue.amount || 0).toLocaleString('en-IN')}`,
            icon: <FaMoneyBillWave />,
            trend: `${(data.data.stats.totalRevenue.trend || 0) >= 0 ? '+' : ''}${data.data.stats.totalRevenue.trend || 0}%`,
            trendUp: data.data.stats.totalRevenue.trendUp,
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
          }
        ];

        setStats(formattedStats);
        setRecentActivity(data.data.recentActivity || []);
        setError(null); // Clear any previous errors
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
        // Set default stats with 0 values on error
        setDefaultStats();
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      // Check if it's a network error
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Cannot connect to server. Please ensure the backend is running on port 5151.');
      } else {
        setError(`Error: ${err.message}`);
      }
      // Set default stats with 0 values on error
      setDefaultStats();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultStats = () => {
    const defaultStats = [
      {
        title: 'Total Clients',
        count: '0',
        icon: <FaUserFriends />,
        trend: '+0%',
        trendUp: true,
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        title: 'Active Projects',
        count: '0',
        icon: <FaBriefcase />,
        trend: '+0%',
        trendUp: true,
        color: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)'
      },
      {
        title: 'Unpaid Invoices',
        count: '00',
        icon: <FaFileInvoiceDollar />,
        trend: '+0%',
        trendUp: true,
        color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'
      },
      {
        title: 'Total Revenue',
        count: '₹0',
        icon: <FaMoneyBillWave />,
        trend: '+0%',
        trendUp: true,
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      }
    ];
    setStats(defaultStats);
    setRecentActivity([]);
  };

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
            {recentActivity.length > 0 && <span className="badge">{Math.min(recentActivity.length, 9)}</span>}
          </button>
          <div className="user-profile-preview">
            <div className="avatar">A</div>
            <span>Admin</span>
          </div>
        </div>
      </div>

      {/* Error Message - only show if no stats are loaded */}
      {error && stats.length === 0 && !loading && (
        <div style={{
          padding: '16px',
          background: '#fee2e2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: '#64748b'
        }}>
          Loading dashboard data...
        </div>
      ) : (
        <>
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
                {recentActivity.length === 0 ? (
                  <li style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#94a3b8'
                  }}>
                    No recent activity
                  </li>
                ) : (
                  recentActivity.map((activity) => (
                    <li key={activity.id} className="activity-item">
                      <div className={`activity-indicator ${activity.type}`}></div>
                      <div className="activity-details">
                        <p className="activity-text">{activity.text}</p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Quick Actions Window */}
            <div className="content-card actions-card">
              <div className="card-header-flex">
                <h3>Quick Actions</h3>
              </div>
              <div className="actions-grid">
                <button className="action-btn" onClick={() => navigate('/add-invoices')}>
                  <div className="action-icon c-blue"><FaPlus /></div>
                  <span>New Invoice</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/add-client')}>
                  <div className="action-icon c-green"><FaPlus /></div>
                  <span>Add Client</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/add-project')}>
                  <div className="action-icon c-purple"><FaPlus /></div>
                  <span>Create Project</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/add-expense')}>
                  <div className="action-icon c-orange"><FaPlus /></div>
                  <span>Log Expense</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
