import React, { useState, useEffect } from 'react';
import '../Shared/FormStyles.css';

const SubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', priceMonth: '', priceYear: '', description: '' });

    const fetchPlans = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5151/api/superadmin/plans', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setPlans(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5151/api/superadmin/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                fetchPlans();
                setFormData({ name: '', priceMonth: '', priceYear: '', description: '' });
                alert('Plan created successfully!');
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Error creating plan');
        }
    };

    return (
        <div className="form-container" style={{ maxWidth: '1000px' }}>
            <div className="form-header">
                <h2>Subscription Plans</h2>
            </div>

            {/* Add Plan Form */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <h4>Create New Offer</h4>
                <form onSubmit={handleCreatePlan} className="form-main" style={{ marginTop: '10px' }}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Plan Name</label>
                            <input className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Pro Plan" />
                        </div>
                        <div className="form-group">
                            <label>Price (Monthly) ₹</label>
                            <input type="number" className="form-control" value={formData.priceMonth} onChange={e => setFormData({ ...formData, priceMonth: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Price (Yearly) ₹</label>
                            <input type="number" className="form-control" value={formData.priceYear} onChange={e => setFormData({ ...formData, priceYear: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea className="form-control" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="2" />
                    </div>
                    <button type="submit" className="submit-btn" style={{ width: 'auto' }}>Create Offer</button>
                </form>
            </div>

            {/* List Plans */}
            <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {plans.map(plan => (
                    <div key={plan._id} style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '20px',
                        background: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>{plan.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{plan.description || 'No description'}</p>
                        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span>Monthly: <strong>₹{plan.priceMonth}</strong></span>
                                <span>Yearly: <strong>₹{plan.priceYear}</strong></span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPlans;
