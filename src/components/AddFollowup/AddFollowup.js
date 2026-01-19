import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddFollowup.css'

const AddFollowUp = () => {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    status: 'inprogress',
    date: '',
    nextFollowUpDate: '',
    reason: '',
    notes: '',
  });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5151/api/client/clients')
      .then(res => res.json()).then(data => {
        if (data.success) setClients(data.data);
      });
  }, []);

  useEffect(() => {
    if (formData.clientId) {
      fetch(`http://localhost:5151/api/project/projects-client/${formData.clientId}`)
        .then(res => res.json()).then(data => {
          if (data.success) setProjects(data.data);
        });
    } else setProjects([]);
  }, [formData.clientId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5151/api/followUp/followUps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Follow‑Up added successfully!' });
        setFormData({
          clientId: '',
          projectId: '',
          status: 'inprogress',
          date: '',
          nextFollowUpDate: '',
          reason: '',
          notes: '',
        });
      } else {
        setMessage({ type: 'error', text: data.message || '❌ Failed to add follow‑up.' });
      }
    } catch {
      setMessage({ type: 'error', text: '❌ Server error. Try again later.' });
    }
  };

  return (
    <div className="add-client-container">
      <div className="add-client-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2>Add Follow‑Up</h2>
      </div>

      <form onSubmit={handleSubmit} className="add-client-form">
        <div className="form-row">
          <div className="form-group">
            <label>Client:</label>
            <select name="clientId" value={formData.clientId} onChange={handleChange} required>
              <option value="">Select client</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.contactPersonName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Project:</label>
            <select name="projectId" value={formData.projectId} onChange={handleChange} required>
              <option value="">Select project</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status:</label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="inprogress">In Progress</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date:</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Next Follow‑Up:</label>
            <input type="date" name="nextFollowUpDate" value={formData.nextFollowUpDate} onChange={handleChange}/>
          </div>

          <div className="form-group">
            <label>Reason:</label>
            <input type="text" name="reason" value={formData.reason} onChange={handleChange} placeholder="Reason"/>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Notes:</label>
          <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} placeholder="Notes"/>
        </div>

        <button type="submit" className="submit-btn">Add Follow‑Up</button>

        {message && (
          <div className={`message ${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddFollowUp;
