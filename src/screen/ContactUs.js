import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContactUs.css';
import ParticlesBackground from '../components/ParticlesBackground';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import ThankYouPopup from '../components/ThankYouPopup';

const ContactUs = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [showPopup, setShowPopup] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // OTP States
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!formData.email) {
            alert("Please enter your email address first.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        setOtpLoading(true);
        try {
            const response = await fetch('http://localhost:5151/api/otp/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (response.ok) {
                setOtpSent(true);
                // alert("Verification code sent to your email.");
            } else {
                alert(data.message || "Failed to send OTP.");
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Error sending verification code.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            alert("Please enter the verification code.");
            return;
        }

        setOtpLoading(true);
        try {
            const response = await fetch('http://localhost:5151/api/otp/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                setOtpVerified(true);
                // alert("Email verified successfully!");
            } else {
                alert(data.message || "Invalid OTP.");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("Error verifying code.");
        } finally {
            setOtpLoading(false);
        }
    };

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5151/api/contact/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Show Popup instead of alert
                setShowPopup(true);

                setFormData({ name: '', email: '', message: '' });
                setOtp('');
                setOtpSent(false);
                setOtpVerified(false);
            } else {
                alert(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-container">
            <LandingNavbar />
            {/* Particles Background re-used for consistency */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, opacity: 0.5 }}>
                <ParticlesBackground />
            </div>

            <div className="contact-content">
                <div className="contact-header">
                    <h1>Get in Touch</h1>
                    <p>Have questions about Hypertool? We're here to help.</p>
                </div>

                <div className="contact-grid">
                    {/* Contact Info */}
                    <div className="contact-info-card">
                        <h2>Contact Info</h2>

                        <div className="info-item">
                            <div className="info-icon">📍</div>
                            <div className="info-details">
                                <h3>Visit Us</h3>
                                <p>Plot No. 5B, Sector - 15A<br />Faridabad, HR 121007</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">📧</div>
                            <div className="info-details">
                                <h3>Email Us</h3>
                                <p><a href="mailto:info@hypertonic.co.in">info@hypertonic.co.in</a></p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">📞</div>
                            <div className="info-details">
                                <h3>Call Us</h3>
                                <p><a href="tel:+919650301229">+91 9650301229</a></p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="contact-form-card">
                        <h2>Send a Message</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="form-input"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={otpVerified}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="Your Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={otpVerified}
                                        style={{ flex: 1 }}
                                    />
                                    {!otpVerified && (
                                        <button
                                            type="button"
                                            className="verify-btn"
                                            onClick={handleSendOtp}
                                            disabled={otpLoading || !formData.email}
                                            style={{
                                                padding: '0 20px',
                                                background: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {otpLoading ? 'Sending...' : 'Verify'}
                                        </button>
                                    )}
                                    {otpVerified && (
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#28a745',
                                            padding: '0 15px',
                                            background: 'rgba(40, 167, 69, 0.1)',
                                            borderRadius: '8px',
                                            border: '1px solid #28a745'
                                        }}>
                                            ✓ Verified
                                        </span>
                                    )}
                                </div>
                            </div>

                            {otpSent && !otpVerified && (
                                <div className="form-group" style={{ animation: 'fadeInDown 0.5s ease', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                                    <label htmlFor="otp" style={{ color: '#4a90e2' }}>Check your email for the code</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            name="otp"
                                            className="form-input"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleVerifyOtp())}
                                            required
                                            style={{ flex: 1, textAlign: 'center', letterSpacing: '2px', fontSize: '1.2rem' }}
                                        />
                                        <button
                                            type="button"
                                            className="verify-btn"
                                            onClick={handleVerifyOtp}
                                            disabled={otpLoading || !otp}
                                            style={{
                                                padding: '0 25px',
                                                background: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {otpLoading ? '...' : 'Confirm'}
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#ccc', marginTop: '10px' }}>
                                        Sent to <strong>{formData.email}</strong>
                                    </p>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    className="form-textarea"
                                    placeholder={!otpVerified ? "Please verify your email above to write a message..." : "How can we help?"}
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    disabled={!otpVerified}
                                    style={{
                                        cursor: !otpVerified ? 'not-allowed' : 'text',
                                        opacity: !otpVerified ? 0.5 : 1
                                    }}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading || !otpVerified}
                                style={{ opacity: otpVerified ? 1 : 0.6, cursor: otpVerified ? 'pointer' : 'not-allowed' }}
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Back Link Removed */}
            </div>
            <LandingFooter />

            <ThankYouPopup
                isOpen={showPopup}
                onClose={() => setShowPopup(false)}
                title="Message Sent!"
                message="Thank you for contacting us. We will get back to you shortly."
            />
        </div>
    );
};

export default ContactUs;
