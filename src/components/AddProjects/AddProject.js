import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProject.css';
import { FiArrowLeft, FiPlus, FiTrash2, FiAlertCircle } from 'react-icons/fi';

const AddProject = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    description: '',
    status: 'pending',
    projectType: 'e-commerce',
    startDate: '',
    endDate: '',
    totalAmount: '',
    paymentTerms: [50, 50] // Default to 2 terms
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5151/api/client/clients?rowsPerPage=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClients(data.data);
        }
      })
      .catch(err => console.error("Error fetching clients:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTermChange = (index, value) => {
    const newTerms = [...formData.paymentTerms];
    newTerms[index] = Number(value);
    setFormData(prev => ({ ...prev, paymentTerms: newTerms }));
  };

  const addTerm = () => {
    setFormData(prev => ({ ...prev, paymentTerms: [...prev.paymentTerms, 0] }));
  };

  const removeTerm = (index) => {
    if (formData.paymentTerms.length <= 1) return;
    const newTerms = formData.paymentTerms.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, paymentTerms: newTerms }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const totalPercent = formData.paymentTerms.reduce((a, b) => a + b, 0);
    if (totalPercent !== 100) {
      setErrorMsg(`Payment terms must sum to 100% (Current: ${totalPercent}%)`);
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5151/api/project/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          totalAmount: Number(formData.totalAmount),
          paymentTermCount: formData.paymentTerms.length
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        navigate('/projects');
      } else {
        setErrorMsg(data.message || 'Failed to create project.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAmount = (percent) => {
    if (!formData.totalAmount) return 0;
    return (formData.totalAmount * percent / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  };

  const totalPercent = formData.paymentTerms.reduce((a, b) => a + b, 0);

  return (
    <div className="ap-container">
      <div className="ap-header">
        <button className="ap-back-btn" onClick={() => navigate('/projects')}>
          <FiArrowLeft /> Cancel
        </button>
        <h1>New Project</h1>
        <div className="ap-header-spacer"></div>
      </div>

      <div className="ap-content">
        <form onSubmit={handleSubmit} className="ap-form">

          {errorMsg && (
            <div className="ap-alert error">
              <FiAlertCircle /> {errorMsg}
            </div>
          )}

          {/* General Information */}
          <section className="ap-section">
            <h3 className="ap-section-title">General Information</h3>
            <div className="ap-grid">
              <div className="ap-form-group span-2">
                <label>Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Website Redesign"
                  required
                  autoFocus
                />
              </div>

              <div className="ap-form-group">
                <label>Client</label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.contactPersonName}</option>
                  ))}
                </select>
              </div>

              <div className="ap-form-group">
                <label>Project Type</label>
                <select name="projectType" value={formData.projectType} onChange={handleChange}>
                  <option value="e-commerce">E-Commerce</option>
                  <option value="static">Static Website</option>
                  <option value="dynamic">Dynamic App</option>
                  <option value="software">Software</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              <div className="ap-form-group span-2">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Project scope and details..."
                  rows="3"
                />
              </div>
            </div>
          </section>

          {/* Timeline & Budget */}
          <section className="ap-section">
            <h3 className="ap-section-title">Timeline & Budget</h3>
            <div className="ap-grid">
              <div className="ap-form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ap-form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ap-form-group">
                <label>Total Budget (INR)</label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="ap-form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
            </div>
          </section>

          {/* Payment Schedule */}
          <section className="ap-section">
            <div className="ap-section-header">
              <h3 className="ap-section-title">Payment Schedule</h3>
              <span className={`ap-total-badge ${totalPercent === 100 ? 'valid' : 'invalid'}`}>
                Total: {totalPercent}%
              </span>
            </div>

            <div className="ap-terms-list">
              {formData.paymentTerms.map((term, index) => (
                <div key={index} className="ap-term-row">
                  <div className="ap-term-index">{index + 1}</div>
                  <div className="ap-term-input">
                    <label>Percentage</label>
                    <div className="input-suffix-wrapper">
                      <input
                        type="number"
                        value={term}
                        onChange={(e) => handleTermChange(index, e.target.value)}
                        min="0"
                        max="100"
                      />
                      <span className="suffix">%</span>
                    </div>
                  </div>
                  <div className="ap-term-value">
                    <label>Amount</label>
                    <div className="value-display">{calculateAmount(term)}</div>
                  </div>
                  <button
                    type="button"
                    className="ap-remove-btn"
                    onClick={() => removeTerm(index)}
                    disabled={formData.paymentTerms.length === 1}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="ap-add-term-btn" onClick={addTerm}>
              <FiPlus /> Add Milestone
            </button>
          </section>

          <div className="ap-footer">
            <button type="submit" className="ap-submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProject;
