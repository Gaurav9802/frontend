import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaChartLine, FaEye, FaEyeSlash } from "react-icons/fa";
import { config, getApiUrl } from "../config/api";
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(getApiUrl(config.endpoints.login), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login successful, token received:", data.token);
                // Manual JWT decode to avoid atob errors with url-safe chars
                try {
                    const base64Url = data.token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const payload = JSON.parse(jsonPayload);
                    console.log("Decoded payload:", payload);

                    login({ _id: payload.userId, email: email }, data.token, payload.role);
                    console.log("Navigating to dashboard...");
                    navigate("/dashboard");
                } catch (parseError) {
                    console.error("Token parsing error:", parseError);
                    setError("Login failed: Invalid token format.");
                }
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message || "Server error. Please try again.");
        }
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

                <h3 className="login-title">Welcome Back</h3>
                <p className="login-subtitle">Enter your credentials to access the admin panel</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form" autoComplete="off">

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                autoComplete="new-password"
                                name="email_field_no_fill"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                autoComplete="new-password"
                                name="password_field_no_fill"
                            />
                            <div
                                className="password-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                        <div className="forgot-password-link">
                            <span onClick={() => navigate('/forgot-password')}>
                                Forgot Password?
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="login-btn">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
