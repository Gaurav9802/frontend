import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
    const { token, role, loading } = useAuth();

    // Check localStorage as fallback to handle fast transitions where context might lag
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const activeToken = token || storedToken;
    const activeRole = role || storedRole;

    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!activeToken) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && activeRole !== requiredRole) {
        // If user doesn't have the required role, redirect to dashboard or 403 page
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
