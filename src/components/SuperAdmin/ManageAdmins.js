
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../Shared/FormStyles.css';
import './ManageAdmins.css';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '', email: '', contact: '', password: '',
        companyName: '', address: '', city: '', state: '', postalCode: '', gstNumber: ''
    });
    const navigate = useNavigate(); // Hook
    const { logout } = useAuth();
    const [message, setMessage] = useState(null);

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [fetchingPostalData, setFetchingPostalData] = useState(false);

    // Fetch city and state from postal code
    const fetchLocationFromPostalCode = async (postalCode) => {
        if (postalCode.length !== 6) return;

        setFetchingPostalData(true);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
            const data = await response.json();

            if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
                const postOffice = data[0].PostOffice[0];
                setFormData(prev => ({
                    ...prev,
                    city: postOffice.District || '',
                    state: postOffice.State || ''
                }));
            } else {
                // Clear city and state if postal code is invalid
                setFormData(prev => ({
                    ...prev,
                    city: '',
                    state: ''
                }));
            }
        } catch (error) {
            console.error('Error fetching postal code data:', error);
        } finally {
            setFetchingPostalData(false);
        }
    };

    // Handle postal code change
    const handlePostalCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 6) {
            setFormData({ ...formData, postalCode: value });
            if (value.length === 6) {
                fetchLocationFromPostalCode(value);
            }
        }
    };

    // ... existing fetchAdmins ...
    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5151/api/superadmin/admins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                navigate('/login');
                return;
            }
            const data = await res.json();
            if (data.success) {
                setAdmins(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // OTP Handlers
    const sendOtp = async () => {
        if (!formData.email) {
            alert('Please enter an email first.');
            return;
        }
        setVerifying(true);
        try {
            // Note: Using the generic OTP route
            const res = await fetch('http://localhost:5151/api/otp/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                alert('✅ OTP sent to email!');
            } else {
                alert('❌ ' + data.message);
            }
        } catch (err) {
            alert('❌ Failed to send OTP.');
        }
        setVerifying(false);
    };

    const verifyOtp = async () => {
        if (!otp) return;
        setVerifying(true);
        try {
            const res = await fetch('http://localhost:5151/api/otp/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                setIsEmailVerified(true);
                setOtpSent(false);
                alert('✅ Email verified successfully!');
            } else {
                alert('❌ ' + data.message);
            }
        } catch (err) {
            alert('❌ Failed to verify OTP.');
        }
        setVerifying(false);
    };

    const resetVerification = () => {
        setIsEmailVerified(false);
        setOtpSent(false);
        setOtp('');
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();

        if (!isEmailVerified) {
            alert('Please verify the email first!');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5151/api/superadmin/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (res.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                navigate('/login');
                return;
            }
            const data = await res.json();
            if (res.ok) {
                setShowModal(false);
                fetchAdmins();
                setFormData({
                    name: '', email: '', contact: '', password: '',
                    companyName: '', address: '', city: '', state: '', postalCode: '', gstNumber: ''
                });
                resetVerification();
                alert('Admin added successfully & Email sent!');
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Error adding admin');
        }
    };
    // ... existing suspend/delete handlers ...
    const handleSuspend = async (id) => {
        if (!window.confirm('Are you sure you want to suspend/unsuspend this admin?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5151/api/superadmin/admins/${id}/suspend`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                navigate('/login');
                return;
            }
            if (res.ok) {
                fetchAdmins();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5151/api/superadmin/admins/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                navigate('/login');
                return;
            }
            if (res.ok) fetchAdmins();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h2 className="admin-table-title">Manage Admins</h2>
                    <button className="admin-add-btn" onClick={() => setShowModal(true)}>
                        <span>+</span>
                        Add New Admin
                    </button>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Admin Name</th>
                                <th>Email Address</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4">
                                        <div className="admin-table-loading">
                                            <div className="admin-table-spinner"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan="4">
                                        <div className="admin-table-empty">
                                            <div className="admin-table-empty-icon">👥</div>
                                            <div className="admin-table-empty-text">No admins found</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                admins.map(admin => (
                                    <tr key={admin._id}>
                                        <td className="admin-name-cell">{admin.name}</td>
                                        <td className="admin-email-cell">{admin.email}</td>
                                        <td>
                                            <span className={`admin-status-badge ${admin.isSuspended ? 'suspended' : 'active'}`}>
                                                {admin.isSuspended ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-actions-cell">
                                                <button
                                                    onClick={() => navigate(`/super-admin/admins/${admin._id}`)}
                                                    className="admin-action-btn view"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleSuspend(admin._id)}
                                                    className={`admin-action-btn ${admin.isSuspended ? 'activate' : 'suspend'}`}
                                                >
                                                    {admin.isSuspended ? 'Activate' : 'Suspend'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(admin._id)}
                                                    className="admin-action-btn delete"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-container">
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Add New Admin</h3>
                            <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleAddAdmin} autoComplete="off">
                            <div className="admin-modal-body">
                                {/* Personal Details Section */}
                                <h4 className="admin-section-header">Personal Information</h4>

                                <div className="admin-form-row">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Full Name *</label>
                                        <input
                                            className="admin-form-input"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter full name"
                                            required
                                            autoComplete="off"
                                            name="admin_name_field"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Contact Number *</label>
                                        <input
                                            className="admin-form-input"
                                            value={formData.contact}
                                            onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                            placeholder="Enter contact number"
                                            required
                                            autoComplete="off"
                                            name="admin_contact_field"
                                        />
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">
                                        Email Address *
                                        {isEmailVerified && <span className="admin-verified-badge">✓ Verified</span>}
                                    </label>
                                    <div className="admin-email-wrapper">
                                        <div className="admin-email-input-container">
                                            <input
                                                className="admin-form-input"
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="Enter email address"
                                                required
                                                disabled={isEmailVerified || otpSent}
                                                autoComplete="new-password"
                                                name="admin_email_field"
                                            />
                                        </div>
                                        {!isEmailVerified && !otpSent && (
                                            <button
                                                type="button"
                                                onClick={sendOtp}
                                                className="admin-verify-btn"
                                                disabled={verifying}
                                            >
                                                {verifying ? <span className="admin-loading"></span> : 'Verify Email'}
                                            </button>
                                        )}
                                        {isEmailVerified && (
                                            <button
                                                type="button"
                                                onClick={resetVerification}
                                                className="admin-change-btn"
                                            >
                                                Change
                                            </button>
                                        )}
                                    </div>

                                    {otpSent && !isEmailVerified && (
                                        <div className="admin-otp-container">
                                            <div className="admin-otp-wrapper">
                                                <input
                                                    className="admin-otp-input"
                                                    placeholder="Enter OTP"
                                                    value={otp}
                                                    onChange={e => setOtp(e.target.value)}
                                                    maxLength="6"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={verifyOtp}
                                                    className="admin-otp-confirm-btn"
                                                >
                                                    Confirm OTP
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={resetVerification}
                                                    className="admin-otp-cancel-btn"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">Password *</label>
                                    <input
                                        className="admin-form-input"
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Enter password (min. 6 characters)"
                                        required
                                        minLength="6"
                                        autoComplete="new-password"
                                        name="admin_password_field"
                                    />
                                </div>

                                {/* Company Details Section */}
                                <div className="admin-section-divider"></div>
                                <h4 className="admin-section-header">Company Information</h4>

                                <div className="admin-form-row">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Company Name *</label>
                                        <input
                                            className="admin-form-input"
                                            value={formData.companyName}
                                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                            placeholder="Enter company name"
                                            required
                                            autoComplete="off"
                                            name="admin_company_field"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">GST Number (Optional)</label>
                                        <input
                                            className="admin-form-input"
                                            value={formData.gstNumber}
                                            onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                                            placeholder="Enter GST number"
                                            autoComplete="off"
                                            name="admin_gst_field"
                                        />
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">Address *</label>
                                    <textarea
                                        className="admin-form-textarea"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Enter complete address"
                                        required
                                        rows="3"
                                        autoComplete="off"
                                        name="admin_address_field"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">
                                        Postal Code *
                                        {fetchingPostalData && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#667eea' }}>Fetching location...</span>}
                                    </label>
                                    <input
                                        className="admin-form-input"
                                        value={formData.postalCode}
                                        onChange={handlePostalCodeChange}
                                        placeholder="Enter 6-digit postal code"
                                        required
                                        autoComplete="off"
                                        name="admin_postal_field"
                                        maxLength="6"
                                        pattern="\d{6}"
                                    />
                                </div>

                                <div className="admin-form-row">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">City *</label>
                                        <input
                                            className="admin-form-input"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            placeholder={fetchingPostalData ? "Auto-filling..." : "Enter city"}
                                            required
                                            autoComplete="off"
                                            name="admin_city_field"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">State *</label>
                                        <input
                                            className="admin-form-input"
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                            placeholder={fetchingPostalData ? "Auto-filling..." : "Enter state"}
                                            required
                                            autoComplete="off"
                                            name="admin_state_field"
                                        />
                                    </div>
                                </div>


                            </div>

                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="admin-cancel-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-submit-btn"
                                    disabled={!isEmailVerified}
                                >
                                    {isEmailVerified ? 'Create Admin Account' : 'Please Verify Email First'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAdmins;
