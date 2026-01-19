import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css"; // We will create this for specific styles

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:5151/api/users/login-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Decode token if needed, or backend should return role/user info. 
                // The current backend returns { message, token }. 
                // We might need to decode the token to get the user ID/role, 
                // but the backend controller line 60 says: jwt.sign({ userId: user._id, role:user.role }...)
                // We'll decode it here simply or fetch profile.

                // Hack for now: we need role/user data. 
                // Option 1: Decode JWT (requires library).
                // Option 2: Ask backend to return user object.
                // Let's rely on backend change? No, let's just decode it or assume basic data.

                // wait, the plan says backend exists. 
                // I will add a quick base64 decode function to extract payload.
                const payload = JSON.parse(atob(data.token.split('.')[1]));

                login({ _id: payload.userId, email: email }, data.token, payload.role);
                navigate("/");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("Server error. Please try again.");
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Sign in to your dashboard</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@portfolio.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <span
                                onClick={() => navigate('/forgot-password')}
                                style={{ color: 'var(--primary-color)', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                                Forgot Password?
                            </span>
                        </div>
                    </div>
                    <button type="submit" className="login-btn">Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
