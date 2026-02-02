import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SharedComponents.css'; // Ensure this file is imported

const LandingNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Check if we are on the landing page to enable smooth scrolling
    const isLandingPage = location.pathname === '/';

    const handleNavigation = (sectionId) => {
        setIsMenuOpen(false);
        if (isLandingPage) {
            // If on landing page, scroll to section
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // If not on landing page, navigate to landing page with hash
            navigate(`/#${sectionId}`);
            // Note: You might need a useEffect in LandingPage to handle initial hash scrolling
        }
    };

    return (
        <header className="landing-header">
            <div className="logo-section" onClick={() => navigate('/')}>
                <img src="/hypertool-logo.png" alt="Hypertool Logo" className="logo-img" />
                <h1 className="logo-text">HYPERTOOL</h1>
            </div>
            <nav className={`landing-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
                <a href="#features" onClick={(e) => { e.preventDefault(); handleNavigation('features'); }}>Features</a>
                <a href="#pricing" onClick={(e) => { e.preventDefault(); handleNavigation('pricing'); }}>Pricing</a>
                <a href="/contact-us" onClick={(e) => { e.preventDefault(); navigate('/contact-us'); setIsMenuOpen(false); }}>Contact</a>
                <button className="login-btn-nav" onClick={() => { navigate('/login'); setIsMenuOpen(false); }}>
                    Login
                </button>
            </nav>
            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
            </button>
        </header>
    );
};

export default LandingNavbar;
