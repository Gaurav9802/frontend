import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaChartLine } from "react-icons/fa";
import './Login.css';

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
            const res = await fetch('http://localhost:5151/api/users/forgot-password', {
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
                <div className="brand-header">
                    <div className="brand-logo">
                        <img src="/hypertool-logo.png" alt="HyperTool Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                    </div>
                    <h2 className="brand-name">HyperTool</h2>
                </div>

                <h2 className="login-title">Forgot Password 🔒</h2>
                <p className="login-subtitle">Enter your email to receive a reset link</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your registered email"
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>

                    <div className="forgot-password-link" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <span onClick={() => navigate('/login')} style={{ fontSize: '0.95rem' }}>
                            ← Back to Login
                        </span>
                    </div>
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

export default ForgotPassword;
