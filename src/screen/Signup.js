import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Signup.css";

const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact: ""
    });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // If email changes, reset verification
        if (e.target.name === 'email') {
            setOtpSent(false);
            setOtpVerified(false);
            setOtp("");
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setError("Please enter your email address first.");
            return;
        }

        setError("");
        setOtpLoading(true);

        try {
            const response = await fetch("http://localhost:5151/api/otp/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (response.ok) {
                setOtpSent(true);
                alert("OTP sent to your email!");
            } else {
                setError(data.message || "Failed to send OTP.");
            }
        } catch (err) {
            setError("Server error sending OTP.");
            console.error(err);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:5151/api/otp/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                setOtpVerified(true);
                alert("Email verified successfully!");
            } else {
                setError(data.message || "Invalid OTP.");
            }
        } catch (err) {
            setError("Server error verifying OTP.");
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otpVerified) {
            setError("Please verify your email address first.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5151/api/leads/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    contact: formData.contact
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
            } else {
                setError(data.message || "Submission failed");
            }
        } catch (err) {
            setError("Server error. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2 className="signup-title">Get Started</h2>
                <p className="signup-subtitle">Fill in your details to get started</p>

                {error && <div className="error-message">{error}</div>}

                {submitted ? (
                    <div className="success-message" style={{ textAlign: 'center', padding: '20px' }}>
                        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Thank You!</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Our team will connect with you shortly.</p>
                        <button
                            className="signup-btn"
                            onClick={() => navigate('/')}
                            style={{ marginTop: '20px' }}
                        >
                            Return to Home
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                    style={{ flex: 1 }}
                                    disabled={otpVerified}
                                />
                                {!otpVerified && (
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={otpLoading || !formData.email}
                                        className="verify-btn"
                                        style={{
                                            padding: '0 15px',
                                            fontSize: '0.8rem',
                                            background: '#333',
                                            color: '#fff',
                                            border: '1px solid #555',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {otpLoading ? "Sending..." : (otpSent ? "Resend" : "Verify")}
                                    </button>
                                )}
                                {otpVerified && (
                                    <span style={{ display: 'flex', alignItems: 'center', color: '#4caf50' }}>✓</span>
                                )}
                            </div>
                        </div>

                        {otpSent && !otpVerified && (
                            <div className="form-group">
                                <label>Verification Code</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        className="verify-btn"
                                        style={{
                                            padding: '0 15px',
                                            fontSize: '0.8rem',
                                            background: '#4caf50',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Contact Number</label>
                            <input
                                type="tel"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                placeholder="+91 9876543210"
                                required
                            />
                        </div>

                        <button type="submit" className="signup-btn" disabled={loading || !otpVerified}>
                            {loading ? "Submitting..." : "Get Started"}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default Signup;
