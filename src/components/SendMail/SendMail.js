import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SendMail.css';

const SendMail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pdfPath } = location.state || {};
  const [gmail, setGmail] = useState('');

  const handleSend = async () => {
    if (!gmail || !pdfPath) {
      alert("Please enter Gmail and ensure invoice path exists.");
      return;
    }

    const res = await fetch('http://localhost:5151/api/invoice/send-invoice-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gmail, pdfPath }),
    });

    const data = await res.json();
    if (data.success) {
      alert(`Invoice sent to ${gmail}`);
      navigate(-1); // go back
    } else {
      alert('Failed to send invoice');
    }
  };

  return (
    <div className="send-mail-container">
      <h2>Send Invoice by Gmail</h2>

      <div className="invoice-preview">
        <iframe
          src={`http://localhost:5151${pdfPath}`}
          width="100%"
          height="400px"
          title="Invoice Preview"
        ></iframe>
      </div>

      <input
        type="email"
        placeholder="Enter recipient Gmail"
        value={gmail}
        onChange={(e) => setGmail(e.target.value)}
        className="email-input"
      />

      <button className="send-button" onClick={handleSend}>
        Send
      </button>
    </div>
  );
};

export default SendMail;
