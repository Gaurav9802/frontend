import React, { useState } from 'react';
import '../Shared/FormStyles.css'; // Use Shared Professional Styles
import { useNavigate } from 'react-router-dom';

const initialForm = {
  title: '',
  amount: '',
  paymentMethod: 'bank',
  description: '',
  expenseDate: '',
};

const AddExpense = () => {
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('http://localhost:5151/api/expense/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Expense recorded successfully!' });
        setFormData(initialForm);
      } else {
        setMessage({ type: 'error', text: data.message || '❌ Failed to add expense.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Server error. Please try again later.' });
    }

    setSubmitting(false);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/expenses')}>← Back to Expenses</button>
        <h2>Add Expense</h2>
      </div>

      <form className="form-main" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Title</label>
            <input
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              className="form-control"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Payment Method</label>
            <select
              className="form-control"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              className="form-control"
              type="date"
              name="expenseDate"
              value={formData.expenseDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Saving...' : 'Add Expense'}
        </button>
        {message && <div className={`message ${message.type === 'success' ? 'success' : 'error'}`}>{message.text}</div>}
      </form>
    </div>
  );
};

export default AddExpense;
