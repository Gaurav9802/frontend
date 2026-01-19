import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../screen/Login.css';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: '❌ New passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5151/api/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: '✅ ' + data.message });
                setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => navigate('/dashboard'), 2000);
            } else {
                setMessage({ type: 'error', text: '❌ ' + (data.message || 'Failed to change password') });
            }
        } catch (err) {
            setMessage({ type: 'error', text: '❌ Server error' });
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Change Password 🔐</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        minLength={6}
                    />
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={6}
                    />
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" className="login-btn" style={{ backgroundColor: 'var(--secondary-color)' }} onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>

            {message && (
                <div className={`message ${message.type === 'error' ? 'error-msg' : 'success-msg'}`} style={{ marginTop: '1rem', padding: '10px', borderRadius: '6px', backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#ef4444' : '#16a34a' }}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default ChangePassword;
