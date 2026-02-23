import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Shared/FormStyles.css'; // Use Shared Professional Styles

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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:5151/api/client/clients', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success) setClients(data.data);
      });
  }, [navigate]);

  useEffect(() => {
    if (formData.clientId) {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      fetch(`http://localhost:5151/api/project/projects-client/${formData.clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          return res.json();
        })
        .then(data => {
          if (data && data.success) setProjects(data.data);
        });
    } else setProjects([]);
  }, [formData.clientId, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setMessage({ type: 'error', text: '❌ Please login to continue.' });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const res = await fetch('http://localhost:5151/api/followUp/followUps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: formData.clientId,
          projectId: formData.projectId,
          status: formData.status,
          followUpHistory: [{
            date: formData.date,
            nextFollowUpDate: formData.nextFollowUpDate,
            reason: formData.reason,
            notes: formData.notes
          }]
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        setMessage({ type: 'error', text: '❌ Session expired. Please login again.' });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

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
        setTimeout(() => navigate('/followups'), 1500);
      } else {
        setMessage({ type: 'error', text: data.message || '❌ Failed to add follow‑up.' });
      }
    } catch {
      setMessage({ type: 'error', text: '❌ Server error. Try again later.' });
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2>Add Follow‑Up</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-main">
        <div className="form-row">
          <div className="form-group">
            <label>Client</label>
            <select
              className="form-control"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
            >
              <option value="">Select client</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.contactPersonName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Project</label>
            <select
              className="form-control"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              required
            >
              <option value="">Select project</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select
              className="form-control"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="inprogress">In Progress</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              className="form-control"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Next Follow‑Up</label>
            <input
              className="form-control"
              type="date"
              name="nextFollowUpDate"
              value={formData.nextFollowUpDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Reason</label>
            <input
              className="form-control"
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Reason (optional)"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Notes</label>
          <textarea
            className="form-control"
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notes (optional)"
          />
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
