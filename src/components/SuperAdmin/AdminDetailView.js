import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminDetailView.css';

const AdminDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5151/api/superadmin/admins/${id}/details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSuspend = async () => {
        if (!window.confirm('Toggle suspension for this admin?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5151/api/superadmin/admins/${id}/suspend`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="admin-profile-loading">
                <div className="admin-profile-loading-spinner"></div>
                <div className="admin-profile-loading-text">Loading admin details...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="admin-profile-loading">
                <div className="admin-profile-loading-text">Admin not found.</div>
            </div>
        );
    }

    const { admin, subscription, stats } = data;
    const activeService = subscription.find(s => s.status === 'active') || subscription[0];

    return (
        <div className="admin-profile-container">
            {/* Header */}
            <div className="admin-profile-header">
                <button className="admin-profile-back-btn" onClick={() => navigate('/super-admin/admins')}>
                    ← Back to Admins
                </button>
                <h1 className="admin-profile-title">{admin.name}</h1>
                <p className="admin-profile-subtitle">Complete admin profile and subscription details</p>
            </div>

            {/* Profile & Subscription Grid */}
            <div className="admin-profile-grid">
                {/* Profile Information Card */}
                <div className="admin-profile-card">
                    <div className="admin-profile-card-header">
                        <div className="admin-profile-card-icon">👤</div>
                        <h3 className="admin-profile-card-title">Profile Information</h3>
                    </div>

                    <div className="admin-info-row">
                        <span className="admin-info-label">Full Name</span>
                        <span className="admin-info-value">{admin.name}</span>
                    </div>

                    <div className="admin-info-row">
                        <span className="admin-info-label">Email Address</span>
                        <span className="admin-info-value">{admin.email}</span>
                    </div>

                    <div className="admin-info-row">
                        <span className="admin-info-label">Contact Number</span>
                        <span className="admin-info-value">{admin.contact}</span>
                    </div>

                    <div className="admin-info-row">
                        <span className="admin-info-label">Account Status</span>
                        <span className={`admin-profile-status-badge ${admin.isSuspended ? 'suspended' : 'active'}`}>
                            {admin.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                    </div>

                    <button
                        onClick={handleSuspend}
                        className={`admin-profile-action-btn ${admin.isSuspended ? 'activate' : 'suspend'}`}
                    >
                        {admin.isSuspended ? '✓ Activate Account' : '⊗ Suspend Account'}
                    </button>

                    {admin.isSuspended && (
                        <div className="admin-profile-alert">
                            <span>ℹ️</span>
                            <span>This user is suspended and cannot log in until activated. This usually happens if subscription is not renewed.</span>
                        </div>
                    )}
                </div>

                {/* Subscription Card */}
                <div className="admin-profile-card">
                    <div className="admin-profile-card-header">
                        <div className="admin-profile-card-icon">📋</div>
                        <h3 className="admin-profile-card-title">Subscription Details</h3>
                    </div>

                    {activeService ? (
                        <>
                            <div className="admin-info-row">
                                <span className="admin-info-label">Plan Name</span>
                                <span className="admin-info-value">{activeService.service?.name || 'Unknown Plan'}</span>
                            </div>

                            <div className="admin-info-row">
                                <span className="admin-info-label">Plan Type</span>
                                <span className="admin-info-value">{activeService.planType}</span>
                            </div>

                            <div className="admin-info-row">
                                <span className="admin-info-label">Payment Status</span>
                                <span className="admin-info-value">{activeService.paymentStatus}</span>
                            </div>

                            <div className="admin-info-row">
                                <span className="admin-info-label">Start Date</span>
                                <span className="admin-info-value">{new Date(activeService.startDate).toLocaleDateString()}</span>
                            </div>

                            <div className="admin-info-row">
                                <span className="admin-info-label">End Date</span>
                                <span className="admin-info-value">{new Date(activeService.endDate).toLocaleDateString()}</span>
                            </div>

                            <div className="admin-info-row">
                                <span className="admin-info-label">Subscription Status</span>
                                <span className={`admin-profile-status-badge ${activeService.status === 'active' ? 'active' : 'suspended'}`}>
                                    {activeService.status.toUpperCase()}
                                </span>
                            </div>

                            {activeService.status !== 'active' && (
                                <div className="admin-profile-alert">
                                    <span>⚠️</span>
                                    <span>Subscription is not active. Create a new plan or ask admin to renew.</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="admin-profile-alert">
                            <span>ℹ️</span>
                            <span>No active subscription found for this admin.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <h3 className="admin-profile-stats-header">Admin's Data Summary</h3>
            <div className="admin-profile-stats-grid">
                <div className="admin-profile-stat-card">
                    <div className="admin-profile-stat-icon">👥</div>
                    <div className="admin-profile-stat-label">Total Clients</div>
                    <p className="admin-profile-stat-value">{stats.clients}</p>
                </div>

                <div className="admin-profile-stat-card">
                    <div className="admin-profile-stat-icon">📁</div>
                    <div className="admin-profile-stat-label">Total Projects</div>
                    <p className="admin-profile-stat-value">{stats.projects}</p>
                </div>

                <div className="admin-profile-stat-card">
                    <div className="admin-profile-stat-icon">📄</div>
                    <div className="admin-profile-stat-label">Total Invoices</div>
                    <p className="admin-profile-stat-value">{stats.invoices}</p>
                </div>
            </div>

            {/* Footer Note */}
            <div className="admin-profile-footer">
                <em>💡 To view full client lists, projects, or invoices, use the impersonation feature (coming soon).</em>
            </div>
        </div>
    );
};

export default AdminDetailView;
