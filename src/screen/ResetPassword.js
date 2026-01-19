import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Login.css';

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: '❌ Passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('http://localhost:5151/api/user/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: '✅ ' + data.message });
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setMessage({ type: 'error', text: '❌ ' + (data.message || 'Failed to reset password') });
            }
        } catch (err) {
            setMessage({ type: 'error', text: '❌ Server error. Please try again.' });
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Reset Password 🔑</h2>
                <p className="login-subtitle">Enter your new password below</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Resetting...' : 'Set New Password'}
                    </button>
                </form>

                {message && (
                    <div className={`message ${message.type === 'error' ? 'error-msg' : 'success-msg'}`} style={{ marginTop: '1rem', padding: '10px', borderRadius: '6px', backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#ef4444' : '#16a34a' }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
