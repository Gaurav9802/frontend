import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SharedComponents.css';
import ThankYouPopup from './ThankYouPopup';

const LandingFooter = () => {
    const navigate = useNavigate();

    // Newsletter State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const handleSendOtp = async () => {
        if (!email) return alert("Please enter email");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return alert("Invalid email");

        setOtpLoading(true);
        try {
            const res = await fetch('http://localhost:5151/api/otp/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setOtpSent(true);
                // alert("OTP sent to " + email);
            } else {
                alert("Failed to send OTp");
            }
        } catch (err) {
            console.error(err);
            alert("Error sending OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return alert("Enter OTP");
        setOtpLoading(true);
        try {
            // 1. Verify OTP
            const resVerify = await fetch('http://localhost:5151/api/otp/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            if (!resVerify.ok) {
                alert("Invalid OTP");
                setOtpLoading(false);
                return;
            }

            // 2. Determine if it is purely a subscription or lead (here we subscribe)
            const resSub = await fetch('http://localhost:5151/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (resSub.ok) {
                setOtpVerified(true);
                setShowPopup(true);
                setEmail('');
                setOtp('');
                setTimeout(() => {
                    setOtpSent(false); // Reset form after success
                    setOtpVerified(false);
                }, 3000);
            } else {
                const d = await resSub.json();
                alert(d.message || "Subscription failed");
            }

        } catch (err) {
            console.error(err);
            alert("Error verifying");
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <footer className="landing-footer">
            <div className="footer-orb"></div>
            <div className="footer-content">
                <div className="footer-section brand">
                    <div className="logo-section" style={{ marginBottom: '20px' }} onClick={() => navigate('/')}>
                        <img src="/logo-bw.png" alt="Hypertool Logo" className="logo-img" />
                        <h1 className="logo-text">HYPERTOOL</h1>
                    </div>
                    <p style={{ textAlign: 'left', maxWidth: '250px', marginBottom: '20px' }}>
                        Streamlining business workflows for modern teams. Secure, fast, and beautiful.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-link">𝕏</a>
                        <a href="#" className="social-link">in</a>
                        <a href="#" className="social-link">ig</a>
                    </div>
                </div>

                <div className="footer-section links">
                    <strong>Product</strong>
                    <a href="/#features">Features</a>
                    <a href="/#pricing">Pricing</a>
                    <a href="/#faqs">FAQs</a>
                    <a href="/#testimonials">Testimonials</a>
                </div>

                <div className="footer-section links">
                    <strong>Company</strong>
                    <a href="#">About Us</a>
                    <a href="#">Careers</a>
                    <a href="/contact-us" onClick={(e) => { e.preventDefault(); navigate('/contact-us'); }}>Contact</a>
                </div>

                <div className="footer-section contact-info">
                    <strong>Contact Us</strong>
                    <p>
                        Plot No. 5B, Sector - 15A<br />
                        Faridabad, HR 121007
                    </p>
                    <p style={{ marginTop: '10px' }}>
                        <a href="mailto:info@hypertonic.co.in">info@hypertonic.co.in</a><br />
                        <a href="tel:+919650301229">+91 9650301229</a>
                    </p>
                </div>

                <div className="footer-section newsletter">
                    <strong>Stay Updated</strong>
                    <p style={{ fontSize: '13px', marginBottom: '15px' }}>Join our newsletter for latest updates.</p>
                    {/* Newsletter Form Logic */}
                    <div className="newsletter-form-container">
                        {!otpSent && !otpVerified && (
                            <div className="newsletter-form">
                                <input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button className="newsletter-btn" onClick={handleSendOtp} disabled={otpLoading}>
                                    {otpLoading ? '...' : 'Join'}
                                </button>
                            </div>
                        )}

                        {otpSent && !otpVerified && (
                            <div className="newsletter-form">
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    style={{ textAlign: 'center' }}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                <button className="newsletter-btn" onClick={handleVerifyOtp} disabled={otpLoading}>
                                    {otpLoading ? '...' : 'Verify'}
                                </button>
                            </div>
                        )}

                        {otpVerified && (
                            <div style={{ color: '#4ade80', fontSize: '14px', marginTop: '10px' }}>
                                ✓ Subscribed Successfully!
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Powered by Hypertonic IT Solutions PVT LTD. All rights reserved. <span style={{ opacity: 0.3, fontSize: '10px' }}>v1.1</span></p>
            </div>

            <ThankYouPopup
                isOpen={showPopup}
                onClose={() => setShowPopup(false)}
                title="Subscribed!"
                message="Thank you for subscribing to our newsletter. We'll keep you updated."
            />
        </footer>
    );
};

export default LandingFooter;
