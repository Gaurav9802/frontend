import React, { useState, useEffect } from 'react';
import './EditClient.css';
import { useNavigate, useParams } from 'react-router-dom';

const EditClient = () => {
  const [formData, setFormData] = useState({
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
    billingAddresses: [{
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    }],
    gstNumbers: [''],
    companyNames: [''],
  });
  const [message, setMessage] = useState(null);
  const { clientId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  // Fetch the data of the client to prefill the form
  const fetchClientData = async () => {
    try {
      const response = await fetch(`http://localhost:5151/api/client/clients/${clientId}`);
      const result = await response.json();
      if (result.success) {
        setFormData(result.data);
      } else {
        setMessage({ type: 'error', text: '❌ Failed to load client data.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error fetching client data.' });
    }
  };

  const handleChange = (e, path) => {
    const { name, value } = e.target;

    if (path === 'address' || path === 'billing') {
      setFormData((prev) => ({
        ...prev,
        [path === 'address' ? 'address' : 'billingAddresses']: path === 'address'
          ? { ...prev.address, [name]: value }
          : [{ ...prev.billingAddresses[0], [name]: value }],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (e, key) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [key]: [value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5151/api/client/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Client updated successfully!' });
        setTimeout(() => navigate('/clients'), 2000); // Redirect to clients page after successful update
      } else {
        setMessage({ type: 'error', text: data.message || '❌ Failed to update client.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Server error. Please try again later.' });
    }
  };

  return (
    <div className="edit-client-container">
      {/* Header Section */}
      <div className="edit-client-header">
        <button className="back-btn" onClick={() => navigate('/clients')}>
          ← Back to Clients
        </button>
        <h2>Edit Client</h2>
      </div>

      <form onSubmit={handleSubmit} className="edit-client-form">
        <div className="form-row">
          <div className="form-group">
            <label>Contact Person Name:</label>
            <input type="text" name="contactPersonName" value={formData.contactPersonName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
        </div>

        <h4>Address</h4>
        <div className="form-row">
          <div className="form-group">
            <input name="street" placeholder="Street" value={formData.address.street} onChange={(e) => handleChange(e, 'address')} />
          </div>
          <div className="form-group">
            <input name="city" placeholder="City" value={formData.address.city} onChange={(e) => handleChange(e, 'address')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input name="state" placeholder="State" value={formData.address.state} onChange={(e) => handleChange(e, 'address')} />
          </div>
          <div className="form-group">
            <input name="postalCode" placeholder="Postal Code" value={formData.address.postalCode} onChange={(e) => handleChange(e, 'address')} />
          </div>
        </div>

        <h4>Billing Address</h4>
        <div className="form-row">
          <div className="form-group">
            <input name="street" placeholder="Street" value={formData.billingAddresses[0].street} onChange={(e) => handleChange(e, 'billing')} />
          </div>
          <div className="form-group">
            <input name="city" placeholder="City" value={formData.billingAddresses[0].city} onChange={(e) => handleChange(e, 'billing')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input name="state" placeholder="State" value={formData.billingAddresses[0].state} onChange={(e) => handleChange(e, 'billing')} />
          </div>
          <div className="form-group">
            <input name="postalCode" placeholder="Postal Code" value={formData.billingAddresses[0].postalCode} onChange={(e) => handleChange(e, 'billing')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>GST Number:</label>
            <input type="text" value={formData.gstNumbers[0]} onChange={(e) => handleArrayChange(e, 'gstNumbers')} />
          </div>
          <div className="form-group">
            <label>Company Name:</label>
            <input type="text" value={formData.companyNames[0]} onChange={(e) => handleArrayChange(e, 'companyNames')} />
          </div>
        </div>

        <button type="submit" className="submit-btn">Update Client</button>

        {message && (
          <div className={`message ${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default EditClient;
