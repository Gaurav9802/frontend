import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing Login styles for consistency

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('http://localhost:5151/api/user/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: '✅ ' + data.message });
            } else {
                setMessage({ type: 'error', text: '❌ ' + (data.message || 'Failed to send link') });
            }
        } catch (err) {
            setMessage({ type: 'error', text: '❌ Server error. Please try again.' });
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Forgot Password 🔒</h2>
                <p className="login-subtitle">Enter your email to receive a reset link</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@portfolio.com"
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>

                {message && (
                    <div className={`message ${message.type === 'error' ? 'error-msg' : 'success-msg'}`} style={{ marginTop: '1rem', padding: '10px', borderRadius: '6px', backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#ef4444' : '#16a34a' }}>
                        {message.text}
                    </div>
                )}

                <div className="login-footer">
                    <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 500 }}>
                        ← Back to Login
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
