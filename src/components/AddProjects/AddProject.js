import React, { useState, useEffect } from 'react';
import './AddProject.css'; // Reusing same styles for consistency
import { useNavigate } from 'react-router-dom';

const AddProject = () => {
  const [clients, setClients] = useState([]);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    description: '',
    status: 'pending',
    projectType: 'e-commerce',
    startDate: '',
    endDate: '',
    totalAmount: '',
    paymentTermCount: 2,
    paymentTerms: [50, 50]
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5151/api/client/clients', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClients(data.data);
        }
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('paymentTerms')) {
      const index = parseInt(name.split('-')[1]);
      const updatedTerms = [...formData.paymentTerms];
      updatedTerms[index] = Number(value);
      setFormData({ ...formData, paymentTerms: updatedTerms });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePaymentTermCountChange = (e) => {
    const value = parseInt(e.target.value);
    const defaultTerms = value === 2 ? [50, 50] : [40, 30, 30];
    setFormData({ ...formData, paymentTermCount: value, paymentTerms: defaultTerms });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5151/api/project/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, totalAmount: Number(formData.totalAmount) }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Project added successfully!' });
        setFormData({
          clientId: '',
          name: '',
          description: '',
          status: 'pending',
          projectType: 'e-commerce',
          startDate: '',
          endDate: '',
          totalAmount: '',
          paymentTermCount: 2,
          paymentTerms: [50, 50]
        });
      } else {
        setMessage({ type: 'error', text: data.message || '❌ Failed to add project.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Server error. Please try again later.' });
    }
  };

  return (
    <div className="add-client-container">
      <div className="add-client-header">
        <button className="back-btn" onClick={() => navigate('/projects')}>
          ← Back to Projects
        </button>
        <h2>Add New Project</h2>
      </div>

      <form onSubmit={handleSubmit} className="add-client-form">
        <div className="form-row">
          <div className="form-group">
            <label>Client:</label>
            <select name="clientId" value={formData.clientId} onChange={handleChange} required>
              <option value="">-- Select Client --</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.contactPersonName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Project Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Description:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date:</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>End Date:</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Project Type:</label>
            <select name="projectType" value={formData.projectType} onChange={handleChange}>
              <option value="e-commerce">E-Commerce</option>
              <option value="static">Static</option>
              <option value="dynamic">Dynamic</option>
              <option value="software">Software</option>
              <option value="app">App</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Total Amount (INR):</label>
            <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Payment Term Count:</label>
            <select name="paymentTermCount" value={formData.paymentTermCount} onChange={handlePaymentTermCountChange}>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          {formData.paymentTerms.map((term, index) => (
            <div className="form-group" key={index}>
              <label>Payment {index + 1} (%):</label>
              <input
                type="number"
                name={`paymentTerms-${index}`}
                value={term}
                onChange={handleChange}
                required
              />
            </div>
          ))}
        </div>

        <button type="submit" className="submit-btn">Add Project</button>

        {message && (
          <div className={`message ${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddProject;
