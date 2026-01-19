import React, { useState, useEffect } from 'react';
import './EditProject.css'
import { useNavigate, useParams } from 'react-router-dom';

const EditProject = () => {
  const [clients, setClients] = useState([]);
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
    paymentTerms: [50, 50],
  });
  const [message, setMessage] = useState(null);

  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
    fetchProject();
    // eslint-disable-next-line
  }, [projectId]);

  const fetchClients = async () => {
    try {
      const res = await fetch('http://localhost:5151/api/client/clients');
      const json = await res.json();
      if (json.success) setClients(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProject = async () => {
    try {
      const res = await fetch(`http://localhost:5151/api/project/projects-details/${projectId}`);
      const json = await res.json();
      if (json.success) {
        const p = json.data;
        setFormData({
           clientId: p.clientId || '', 
          name: p.name || '',
          description: p.description || '',
          status: p.status || 'pending',
          projectType: p.projectType || 'e-commerce',
          startDate: p.startDate ? p.startDate.slice(0, 10) : '',
          endDate: p.endDate ? p.endDate.slice(0, 10) : '',
          totalAmount: p.totalAmount || '',
          paymentTermCount: p.paymentTermCount || 2,
          paymentTerms: p.paymentTerms && p.paymentTerms.length > 0 ? p.paymentTerms : [50, 50],
        });
      } else {
        setMessage({ type: 'error', text: '❌ Failed to load project.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Error fetching project.' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('paymentTerms')) {
      const idx = +name.split('-')[1];
      const terms = [...formData.paymentTerms];
      terms[idx] = Number(value);  // convert input to number
      setFormData({ ...formData, paymentTerms: terms });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePaymentCount = (e) => {
    const count = Number(e.target.value);
    const terms = count === 2 ? [50, 50] : [40, 30, 30];
    setFormData({ ...formData, paymentTermCount: count, paymentTerms: terms });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate payment terms count and sum
    const terms = formData.paymentTerms.map(Number);
    const count = terms.length;
    const sum = terms.reduce((a, b) => a + b, 0);

    if ((count !== 2 && count !== 3) || sum !== 100) {
      setMessage({ type: 'error', text: '❌ Payment terms must have exactly 2 or 3 values that add up to 100%' });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5151/api/project/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentTerms: terms,         // ensure sending numbers
          totalAmount: Number(formData.totalAmount),
          startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Project updated!' });
        setTimeout(() => navigate('/projects'), 1500);
      } else {
        setMessage({ type: 'error', text: json.message || '❌ Failed to update project.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: '❌ Server error.' });
    }
  };

  return (
    <div className="add-client-container">
      <div className="add-client-header">
        <button className="back-btn" onClick={() => navigate('/projects')}>
          ← Back to Projects
        </button>
        <h2>Edit Project</h2>
      </div>

      <form className="add-client-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Client:</label>
            <select name="clientId" value={formData.clientId} onChange={handleChange} required>
              <option value="">-- Select Client --</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>
                  {c.contactPersonName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Project Name:</label>
            <input name="name" type="text" value={formData.name} onChange={handleChange} required />
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
            <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>End Date:</label>
            <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
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
            <input name="totalAmount" type="number" value={formData.totalAmount} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Term Count:</label>
            <select name="paymentTermCount" value={formData.paymentTermCount} onChange={handlePaymentCount}>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          {formData.paymentTerms.map((t, i) => (
            <div className="form-group" key={i}>
              <label>Payment {i + 1} (%):</label>
              <input
                name={`paymentTerms-${i}`}
                type="number"
                value={t}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>
          ))}
        </div>

        <button className="submit-btn" type="submit">Update Project</button>
        {message && (
          <div className={`message ${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default EditProject;
