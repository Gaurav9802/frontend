import React, { useState } from 'react';
import './AddClient.css';
import { useNavigate } from 'react-router-dom';

const AddClient = () => {
  const navigate = useNavigate();

  const initialState = {
    contactPersonName: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    billingAddresses: [
      {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      },
    ],
    gstNumbers: [''],
    companyNames: [''],
  };

  const [formData, setFormData] = useState(initialState);
  const [message, setMessage] = useState(null);

  // Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // UX State
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [postalLoading, setPostalLoading] = useState(false);

  /* =========================
     INPUT HANDLERS
  ========================== */

  const fetchPincodeDetails = async (pincode, type) => {
    if (pincode.length !== 6) return;
    setPostalLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        const { District, State } = data[0].PostOffice[0];

        if (type === 'address') {
          setFormData(prev => {
            const newData = {
              ...prev,
              address: { ...prev.address, city: District, state: State }
            };
            // If syncing, update billing too
            if (sameAsBilling) {
              newData.billingAddresses[0].city = District;
              newData.billingAddresses[0].state = State;
            }
            return newData;
          });
        } else if (type === 'billing') {
          setFormData(prev => ({
            ...prev,
            billingAddresses: [{ ...prev.billingAddresses[0], city: District, state: State }]
          }));
        }
      }
    } catch (err) {
      console.error("Pincode fetch error", err);
    }
    setPostalLoading(false);
  };

  const handleChange = (e, section) => {
    const { name, value } = e.target;

    if (section === 'address') {
      setFormData((prev) => {
        const newAddress = { ...prev.address, [name]: value };
        const newState = { ...prev, address: newAddress };

        // Sync if enabled
        if (sameAsBilling) {
          newState.billingAddresses = [{ ...newAddress }];
        }
        return newState;
      });

      if (name === 'postalCode' && value.length === 6) {
        fetchPincodeDetails(value, 'address');
      }
      return;
    }

    if (section === 'billing') {
      setFormData((prev) => ({
        ...prev,
        billingAddresses: [
          { ...prev.billingAddresses[0], [name]: value },
        ],
      }));

      if (name === 'postalCode' && value.length === 6) {
        fetchPincodeDetails(value, 'billing');
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSameAsBilling = (e) => {
    const isChecked = e.target.checked;
    setSameAsBilling(isChecked);
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        billingAddresses: [{ ...prev.address }]
      }));
    }
  };

  const handleArrayChange = (e, key) => {
    let val = e.target.value;

    // Auto-capitalize GST
    if (key === 'gstNumbers') {
      val = val.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [key]: [val],
    }));

    // Auto-fetch GST Details if it's the GST field
    if (key === 'gstNumbers') {
      const val = e.target.value;
      if (val.length === 15) {
        fetchGstDetails(val);
      }
    }
  };

  /* =========================
     VERIFICATION HANDLERS
  ========================== */
  const sendOtp = async () => {
    if (!formData.email) {
      setMessage({ type: 'error', text: 'Please enter an email first.' });
      return;
    }
    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5151/api/client/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setMessage({ type: 'success', text: '✅ OTP sent to email!' });
      } else {
        setMessage({ type: 'error', text: '❌ ' + data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Failed to send OTP.' });
    }
    setVerifying(false);
  };

  const verifyOtp = async () => {
    if (!otp) return;
    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5151/api/client/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEmailVerified(true);
        setOtpSent(false);
        setMessage({ type: 'success', text: '✅ Email verified successfully!' });
      } else {
        setMessage({ type: 'error', text: '❌ ' + data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Failed to verify OTP.' });
    }
    setVerifying(false);
  };

  const resetVerification = () => {
    setIsEmailVerified(false);
    setOtpSent(false);
    setOtp('');
    setMessage(null);
  };

  const fetchGstDetails = async (gstNumber) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5151/api/client/gst-details/${gstNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Auto-populate Company Name
        setFormData(prev => ({
          ...prev,
          companyNames: [data.data.legalName]
        }));
        setMessage({ type: 'success', text: '✅ Company name fetched from GST!' });
      }
    } catch (err) {
      console.error("GST Fetch error", err);
    }
  };

  /* =========================
     VALIDATION
  ========================== */
  const validateForm = () => {
    // 1. GST Validation (15 alphanumeric characters)
    // Regex: 2 digits, 5 letters, 4 digits, 1 letter, 1 alphanumeric, 1 Z, 1 alphanumeric
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    for (const gst of formData.gstNumbers) {
      if (gst && !gstRegex.test(gst)) {
        return '❌ Invalid GST Number format. It should be 15 alphanumeric characters (e.g., 22AAAAA0000A1Z5).';
      }
    }

    // 2. Postal Code Validation (6 digits for India)
    const postalRegex = /^[0-9]{6}$/;
    if (formData.address.postalCode && !postalRegex.test(formData.address.postalCode)) {
      return '❌ Invalid Postal Code. It should be 6 digits.';
    }

    if (formData.billingAddresses[0].postalCode && !postalRegex.test(formData.billingAddresses[0].postalCode)) {
      return '❌ Invalid Billing Postal Code.';
    }

    return null;
  };

  /* =========================
     SUBMIT HANDLER
  ========================== */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Run Validation
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setMessage({
        type: 'error',
        text: '❌ You are not logged in. Please login again.',
      });
      return;
    }

    try {
      const res = await fetch('http://localhost:5151/api/client/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add client');
      }

      setMessage({
        type: 'success',
        text: '✅ Client added successfully! Redirecting...',
      });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/clients');
      }, 1500);

      setFormData(initialState);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || '❌ Server error. Please try again.',
      });
    }
  };

  /* =========================
     JSX
  ========================== */

  return (
    <div className="add-client-container">
      <div className="add-client-header">
        <button className="back-btn" onClick={() => navigate('/clients')}>
          ← Back to Clients
        </button>
        <h2>Add New Client</h2>
      </div>

      <form onSubmit={handleSubmit} className="add-client-form">
        <div className="form-row">
          <div className="form-group">
            <label>Contact Person Name</label>
            <input
              name="contactPersonName"
              value={formData.contactPersonName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Email {isEmailVerified && '✅ Verified'}</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isEmailVerified}
                style={{ flex: 1 }}
              />
              {!isEmailVerified && !otpSent && (
                <button type="button" onClick={sendOtp} className="verify-btn" disabled={verifying}>
                  {verifying ? 'Sending...' : 'Verify'}
                </button>
              )}
              {isEmailVerified && (
                <button type="button" onClick={resetVerification} className="verify-btn" style={{ backgroundColor: '#7f8c8d' }}>
                  Change
                </button>
              )}
            </div>

            {otpSent && !isEmailVerified && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ width: '150px' }}
                />
                <button type="button" onClick={verifyOtp} className="verify-btn" disabled={verifying}>
                  Confirm OTP
                </button>
                <button
                  type="button"
                  onClick={sendOtp}
                  className="verify-btn"
                  disabled={verifying}
                  style={{ backgroundColor: 'transparent', color: '#2f80ed', border: '1px solid #2f80ed' }}
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={resetVerification}
                  className="verify-btn"
                  style={{ backgroundColor: '#e74c3c', marginLeft: 'auto' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <h4>Address</h4>
        <div className="form-row">
          <input
            name="postalCode"
            placeholder="Postal Code"
            value={formData.address.postalCode}
            onChange={(e) => handleChange(e, 'address')}
          />
          <input
            name="street"
            placeholder="Street"
            value={formData.address.street}
            onChange={(e) => handleChange(e, 'address')}
          />
        </div>

        <div className="form-row">
          <input
            name="city"
            placeholder="City"
            value={formData.address.city}
            onChange={(e) => handleChange(e, 'address')}
          />
          <input
            name="state"
            placeholder="State"
            value={formData.address.state}
            onChange={(e) => handleChange(e, 'address')}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', marginBottom: '10px' }}>
          <h4 style={{ margin: 0 }}>Billing Address</h4>
          <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#555', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              style={{ width: '18px', height: '18px', margin: 0, cursor: 'pointer' }}
            />
            Same as Address
          </label>
        </div>

        <div className="form-row">
          <input
            name="postalCode"
            placeholder="Postal Code"
            value={formData.billingAddresses[0].postalCode}
            onChange={(e) => handleChange(e, 'billing')}
            disabled={sameAsBilling}
          />
          <input
            name="street"
            placeholder="Street"
            value={formData.billingAddresses[0].street}
            onChange={(e) => handleChange(e, 'billing')}
            disabled={sameAsBilling}
          />
        </div>

        <div className="form-row">
          <input
            name="city"
            placeholder="City"
            value={formData.billingAddresses[0].city}
            onChange={(e) => handleChange(e, 'billing')}
            disabled={sameAsBilling}
          />
          <input
            name="state"
            placeholder="State"
            value={formData.billingAddresses[0].state}
            onChange={(e) => handleChange(e, 'billing')}
            disabled={sameAsBilling}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>GST Number</label>
            <input
              value={formData.gstNumbers[0]}
              onChange={(e) => handleArrayChange(e, 'gstNumbers')}
              placeholder="Ex: 22AAAAA0000A1Z5"
            />
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <input
              value={formData.companyNames[0]} // Ensure this accesses the first element
              onChange={(e) => handleArrayChange(e, 'companyNames')}
              placeholder="Auto-filled from GST"
            />
          </div>
        </div>

        {/* Helper for Postal Code Loading */}
        {postalLoading && (
          <div className="loading-indicator">
            ⌛ Fetching City & State...
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={!isEmailVerified}>
          {isEmailVerified ? 'Add Client' : 'Verify Email to Proceed'}
        </button>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddClient;
