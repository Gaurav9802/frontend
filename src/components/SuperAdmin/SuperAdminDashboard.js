import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Shared/FormStyles.css'; // Standard styling
import '../Dashboard/Dashboard.css'; // Reuse premium dashboard styles
import { FaUserShield, FaMoneyBillWave, FaChartLine, FaBell } from 'react-icons/fa';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({ admins: 0, plans: 0, revenue: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch stats logic here (for now placeholder)
        setStats({ admins: 5, plans: 3, revenue: 15000 });
    }, []);

    const adminStats = [
        {
            title: 'Total Admins',
            count: stats.admins,
            icon: <FaUserShield />,
            trend: '+2 new',
            trendUp: true,
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            title: 'Active Subscription Plans',
            count: stats.plans,
            icon: <FaChartLine />,
            trend: 'Stable',
            trendUp: true,
            color: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)'
        },
        {
            title: 'Total Revenue (INR)',
            count: `₹${stats.revenue.toLocaleString()}`,
            icon: <FaMoneyBillWave />,
            trend: '+12%',
            trendUp: true,
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        }
    ];

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <div className="dashboard-header-modern">
                <div>
                    <h2 className="welcome-text">SuperAdmin Overview</h2>
                    <p className="welcome-subtext">Manage your platform administration and revenue here.</p>
                </div>
                <div className="header-actions">
                    <button className="icon-btn">
                        <FaBell />
                        <span className="badge">1</span>
                    </button>
                    <div className="user-profile-preview">
                        <div className="avatar" style={{ background: '#1e293b' }}>S</div>
                        <span>SuperAdmin</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {adminStats.map((item, index) => (
                    <div className="stat-card" key={index}>
                        <div className="stat-icon-wrapper" style={{ background: item.color }}>
                            {item.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-title">{item.title}</span>
                            <h3 className="stat-count">{item.count}</h3>
                            <div className="stat-trend trend-up">
                                <span>{item.trend}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions / Recent Admins */}
            <div className="dashboard-content-grid">
                {/* Recent Activity Window - Reused for recent admins or logs */}
                <div className="content-card activity-card">
                    <div className="card-header-flex">
                        <h3>Platform Activity</h3>
                        <button className="view-all-btn">View All</button>
                    </div>
                    <ul className="activity-list">
                        <li className="activity-item">
                            <div className="activity-indicator client" style={{ background: '#22c55e' }}></div>
                            <div className="activity-details">
                                <p className="activity-text">New Admin "John Doe" registered.</p>
                                <span className="activity-time">2 hours ago</span>
                            </div>
                        </li>
                        <li className="activity-item">
                            <div className="activity-indicator payment" style={{ background: '#3b82f6' }}></div>
                            <div className="activity-details">
                                <p className="activity-text">New Plan "Yearly Pro" created.</p>
                                <span className="activity-time">5 hours ago</span>
                            </div>
                        </li>
                        <li className="activity-item">
                            <div className="activity-indicator project" style={{ background: '#ef4444' }}></div>
                            <div className="activity-details">
                                <p className="activity-text">Admin "Jane Smith" suspended.</p>
                                <span className="activity-time">1 day ago</span>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Quick Actions */}
                <div className="content-card actions-card">
                    <div className="card-header-flex">
                        <h3>Quick Administration</h3>
                    </div>
                    <div className="actions-grid">
                        <button className="action-btn" onClick={() => navigate('/super-admin/admins')}>
                            <div className="action-icon c-blue"><FaUserShield /></div>
                            <span>Manage Admins</span>
                        </button>
                        <button className="action-btn" onClick={() => navigate('/super-admin/plans')}>
                            <div className="action-icon c-purple"><FaMoneyBillWave /></div>
                            <span>Manage Plans</span>
                        </button>
                        <button className="action-btn" onClick={() => navigate('/super-admin/website-settings')}>
                            <div className="action-icon c-green"><FaChartLine /></div>
                            <span>Website Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
