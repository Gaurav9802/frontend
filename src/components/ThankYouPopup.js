import React from 'react';
import './ThankYouPopup.css';

const ThankYouPopup = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                <h2>{title || "Thank You!"}</h2>
                <p>{message || "Your submission has been received."}</p>
                <button onClick={onClose} className="popup-btn">
                    Close
                </button>
            </div>
        </div>
    );
};

export default ThankYouPopup;
