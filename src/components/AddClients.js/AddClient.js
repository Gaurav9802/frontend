import React, { useState, useEffect } from 'react';
import './AddClient.css';
import { useNavigate } from 'react-router-dom';

const AddClient = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

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

    // Auto-fetch GST Details removed - company name is now manual entry
  };



  // GST Auto-fetch disabled - company name is now manual entry
  /*
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
  */

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
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Add Client API Error:", data);
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
      console.error("Add Client Error:", error);
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
    <div className="add-client-page">
      <div className="add-client-container">

        {/* Header */}
        <div className="add-client-header">
          <h2>Add New Client</h2>
          <button className="back-button" onClick={() => navigate('/clients')}>
            Back to Clients
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-client-form">

          {/* Section 1: Contact Info */}
          <div className="form-section">
            <div className="form-section-title">Contact Information</div>
            <div className="form-grid-2">
              <div className="input-group">
                <label className="input-label">Contact Person Name</label>
                <input
                  className="input-field"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  className="input-field"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. +91 9876543210"
                />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label className="input-label">Email Address</label>
              <input
                className="input-field"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="e.g. john@company.com"
              />
            </div>
          </div>

          {/* Section 2: Business Details */}
          <div className="form-section">
            <div className="form-section-title">Business Details</div>
            <div className="form-grid-2">
              <div className="input-group">
                <label className="input-label">GST Number</label>
                <input
                  className="input-field"
                  value={formData.gstNumbers[0]}
                  onChange={(e) => handleArrayChange(e, 'gstNumbers')}
                  placeholder="Ex: 22AAAAA0000A1Z5"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Company Name</label>
                <input
                  className="input-field"
                  value={formData.companyNames[0]}
                  onChange={(e) => handleArrayChange(e, 'companyNames')}
                  placeholder="Auto-filled from GST or Enter manually"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Registered Address */}
          <div className="form-section">
            <div className="form-section-title">Registered Address</div>
            <div className="form-grid-2">
              <div className="input-group">
                <label className="input-label">Postal Code</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-field"
                    name="postalCode"
                    placeholder="110001"
                    value={formData.address.postalCode}
                    onChange={(e) => handleChange(e, 'address')}
                    maxLength="6"
                  />
                  {postalLoading && <span style={{ position: 'absolute', right: '10px', top: '12px', fontSize: '0.8rem' }}>⌛</span>}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Street / Building</label>
                <input
                  className="input-field"
                  name="street"
                  placeholder="123, Tech Park"
                  value={formData.address.street}
                  onChange={(e) => handleChange(e, 'address')}
                />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="input-group">
                <label className="input-label">City</label>
                <input
                  className="input-field"
                  name="city"
                  placeholder="New Delhi"
                  value={formData.address.city}
                  onChange={(e) => handleChange(e, 'address')}
                />
              </div>
              <div className="input-group">
                <label className="input-label">State</label>
                <input
                  className="input-field"
                  name="state"
                  placeholder="Delhi"
                  value={formData.address.state}
                  onChange={(e) => handleChange(e, 'address')}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Billing Address */}
          <div className="form-section" style={{ borderLeftColor: sameAsBilling ? '#cbd5e1' : '#3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <div className="form-section-title" style={{ marginBottom: 0 }}>Billing Address</div>
              <div className="checkbox-wrapper" style={{ margin: 0, padding: 0 }}>
                <input
                  type="checkbox"
                  id="sameBilling"
                  checked={sameAsBilling}
                  onChange={toggleSameAsBilling}
                  style={{ display: 'none' }}
                />
                <label htmlFor="sameBilling" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <div className="checkbox-custom" style={{ background: sameAsBilling ? '#3b82f6' : 'transparent', borderColor: sameAsBilling ? '#3b82f6' : '#cbd5e1' }}></div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Same as Registered Address</span>
                </label>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label className="input-label">Postal Code</label>
                <input
                  className="input-field"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={formData.billingAddresses[0].postalCode}
                  onChange={(e) => handleChange(e, 'billing')}
                  disabled={sameAsBilling}
                  maxLength="6"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Street / Building</label>
                <input
                  className="input-field"
                  name="street"
                  placeholder="Street"
                  value={formData.billingAddresses[0].street}
                  onChange={(e) => handleChange(e, 'billing')}
                  disabled={sameAsBilling}
                />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="input-group">
                <label className="input-label">City</label>
                <input
                  className="input-field"
                  name="city"
                  placeholder="City"
                  value={formData.billingAddresses[0].city}
                  onChange={(e) => handleChange(e, 'billing')}
                  disabled={sameAsBilling}
                />
              </div>
              <div className="input-group">
                <label className="input-label">State</label>
                <input
                  className="input-field"
                  name="state"
                  placeholder="State"
                  value={formData.billingAddresses[0].state}
                  onChange={(e) => handleChange(e, 'billing')}
                  disabled={sameAsBilling}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-button">
            Add Client
          </button>

          {message && (
            <div className={`status-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddClient;
