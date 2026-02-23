import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SuperAdminInvoices.css';

const SuperAdminInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create Invoice State
    const [showModal, setShowModal] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [formData, setFormData] = useState({
        adminEmail: '',
        amount: '',
        description: '',
        hsnCode: '998314', // Default HSN for IT Services
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
    });
    const [creating, setCreating] = useState(false);
    const [taxPreview, setTaxPreview] = useState(null);

    const navigate = useNavigate();

    // Fetch Admins for Dropdown
    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5151/api/superadmin/admins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAdmins(data.data);
            }
        } catch (err) {
            console.error('Error fetching admins:', err);
        }
    };

    useEffect(() => {
        if (showModal && admins.length === 0) {
            fetchAdmins();
        }
    }, [showModal, admins.length]);

    // Handle Admin Selection
    const handleAdminSelect = (email) => {
        const admin = admins.find(a => a.email === email);
        if (admin) {
            setFormData(prev => ({ ...prev, adminEmail: email }));
            setSelectedAdmin(admin);
            calculateTax(formData.amount, admin);
        } else {
            setFormData(prev => ({ ...prev, adminEmail: email }));
            setSelectedAdmin(null);
            setTaxPreview(null);
        }
    };

    // Calculate Tax Preview
    const calculateTax = (amount, admin) => {
        if (!admin || !amount) {
            setTaxPreview(null);
            return;
        }

        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return;

        // Backend will assume SuperAdmin location (e.g. Haryana or Delhi). 
        // For preview, we can just show generic "Tax will be calculated based on location".
        // Or if we want to be specific, we need superadmin's state. 
        // Let's rely on backend for final calc, but here we can show "Estimated Tax: 18% (IGST or CGST+SGST)"

        let taxText = "0% (No GST)";
        let total = amt;

        if (admin.gstNumber) {
            // Simplified Logic for Preview
            taxText = "18% GST Applied";
            total = amt + (amt * 0.18);
        }

        setTaxPreview({
            taxRate: admin.gstNumber ? 18 : 0,
            text: taxText,
            subTotal: amt,
            total: total
        });
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, amount: val }));
        calculateTax(val, selectedAdmin);
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const token = localStorage.getItem('token');
            // We need to send to a new endpoint that accepts email
            const res = await fetch(`http://localhost:5151/api/superadmin/invoice/create-by-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: formData.adminEmail,
                    amount: parseFloat(formData.amount),
                    description: formData.description,
                    hsnCode: formData.hsnCode,
                    dueDate: formData.dueDate
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('✅ Invoice created & sent successfully!');
                setShowModal(false);
                setFormData({
                    adminEmail: '',
                    amount: '',
                    description: '',
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
                });
                setTaxPreview(null);
                fetchInvoices();
            } else {
                alert('❌ ' + (data.message || 'Failed to create invoice'));
            }
        } catch (err) {
            console.error('Error creating invoice:', err);
            alert('❌ Failed to create invoice');
        } finally {
            setCreating(false);
        }
    };

    const [selectedInvoices, setSelectedInvoices] = useState([]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedInvoices(invoices.map(i => i._id));
        } else {
            setSelectedInvoices([]);
        }
    };

    const handleSelectInvoice = (id) => {
        if (selectedInvoices.includes(id)) {
            setSelectedInvoices(selectedInvoices.filter(i => i !== id));
        } else {
            setSelectedInvoices([...selectedInvoices, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedInvoices.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedInvoices.length} invoices?`)) return;

        try {
            const token = localStorage.getItem('token');
            const deletePromises = selectedInvoices.map(id =>
                fetch(`http://localhost:5151/api/superadmin/invoices/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })
            );

            await Promise.all(deletePromises);
            alert('Selected invoices deleted successfully');
            setSelectedInvoices([]);
            fetchInvoices();
        } catch (err) {
            console.error('Error deleting invoices:', err);
            alert('Error deleting invoices');
        }
    };

    const handleDeleteInvoice = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5151/api/superadmin/invoices/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                alert('Invoice deleted successfully');
                fetchInvoices();
            } else {
                alert(data.message || 'Failed to delete invoice');
            }
        } catch (err) {
            console.error('Error deleting invoice:', err);
            alert('Error deleting invoice');
        }
    };

    const handleStatusChange = async (invoiceId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5151/api/superadmin/invoices/${invoiceId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                alert('Invoice status updated successfully');
                fetchInvoices(); // Refresh the list
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Error updating invoice status:', err);
            alert('Error updating invoice status');
        }
    };


    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5151/api/superadmin/invoices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setInvoices(data.data);
            }
        } catch (err) {
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);



    return (
        <div className="invoices-page">
            <div className="invoices-header">
                <div className="invoices-title">
                    <h2>Sent Invoices</h2>
                    <p>Track all invoices sent to admins/clients.</p>
                </div>
                <button
                    className="create-invoice-btn"
                    onClick={() => setShowModal(true)}
                >
                    <span>+</span> Create New Invoice
                </button>
            </div>

            <div className="invoices-table-container">
                {loading ? (
                    <div className="loading-container">
                        <div className="admin-table-spinner"></div>
                        <p>Loading invoices...</p>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📄</span>
                        <h3>No invoices found</h3>
                        <p>Invoices sent to admins will appear here.</p>
                    </div>
                ) : (
                    <>
                        {selectedInvoices.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="admin-btn-primary"
                                style={{ backgroundColor: '#dc2626', marginBottom: '1rem' }}
                            >
                                Delete Selected ({selectedInvoices.length})
                            </button>
                        )}
                        <table className="invoices-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={invoices.length > 0 && selectedInvoices.length === invoices.length}
                                        />
                                    </th>
                                    <th>Invoice No.</th>
                                    <th>Admin Name</th>
                                    <th>Amount</th>
                                    <th>Issued Date</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Download</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv._id}>
                                        <td data-label="Select">
                                            <input
                                                type="checkbox"
                                                checked={selectedInvoices.includes(inv._id)}
                                                onChange={() => handleSelectInvoice(inv._id)}
                                            />
                                        </td>
                                        <td data-label="Invoice No." className="invoice-number-cell">{inv.invoiceNumber}</td>
                                        <td data-label="Admin Name">
                                            <div>{inv.adminId?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.adminId?.email}</div>
                                        </td>
                                        <td data-label="Amount"><strong>₹{inv.amount.toLocaleString()}</strong></td>
                                        <td data-label="Issued Date">
                                            <div>{new Date(inv.issueDate).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                {new Date(inv.issueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td data-label="Due Date">
                                            <div>{new Date(inv.dueDate).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                {new Date(inv.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td data-label="Status">
                                            <select
                                                value={inv.status}
                                                onChange={(e) => handleStatusChange(inv._id, e.target.value)}
                                                className={`status-select ${inv.status}`}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid',
                                                    borderColor: inv.status === 'paid' ? '#a7f3d0' : '#fecaca',
                                                    backgroundColor: inv.status === 'paid' ? '#d1fae5' : '#fee2e2',
                                                    color: inv.status === 'paid' ? '#065f46' : '#991b1b',
                                                    fontSize: '0.8125rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    outline: 'none'
                                                }}
                                            >
                                                <option value="paid">Paid</option>
                                                <option value="unpaid">Unpaid</option>
                                            </select>
                                        </td>
                                        <td data-label="Download">
                                            {inv.pdfPath && (
                                                <a
                                                    href={`http://localhost:5151${inv.pdfPath}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="download-link"
                                                >
                                                    <span>⬇</span> PDF
                                                </a>
                                            )}
                                        </td>
                                        <td data-label="Action">
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteInvoice(inv._id)}

                                                title="Delete Invoice"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
            {/* Create Invoice Modal */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-container">
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Create New Invoice</h3>
                            <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateInvoice}>
                            <div className="admin-modal-body">

                                <div className="admin-form-group">
                                    <label className="admin-form-label">Select Client</label>
                                    <select
                                        className="admin-form-input"
                                        value={formData.adminEmail}
                                        onChange={(e) => handleAdminSelect(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select a Client --</option>
                                        {admins.map(admin => (
                                            <option key={admin._id} value={admin.email}>
                                                {admin.companyName ? `${admin.companyName} (${admin.name})` : admin.name}
                                            </option>
                                        ))}
                                    </select>

                                    {selectedAdmin && (
                                        <div style={{
                                            marginTop: '1rem',
                                            fontSize: '0.9rem',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            padding: '1rem'
                                        }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '0.95rem' }}>Client Details</h4>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: '#64748b' }}>
                                                <div>
                                                    <span style={{ fontWeight: '600', color: '#475569' }}>Company:</span> {selectedAdmin.companyName || 'N/A'}
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: '600', color: '#475569' }}>Contact:</span> {selectedAdmin.name}
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: '600', color: '#475569' }}>Email:</span> {selectedAdmin.email}
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: '600', color: '#475569' }}>State:</span> {selectedAdmin.state || 'N/A'}
                                                </div>
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <span style={{ fontWeight: '600', color: '#475569' }}>Address:</span> {selectedAdmin.address || 'N/A'}, {selectedAdmin.city || ''}
                                                </div>
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <span style={{ fontWeight: '600', color: '#475569' }}>GSTIN:</span>
                                                    <span style={{
                                                        marginLeft: '0.5rem',
                                                        fontWeight: '600',
                                                        color: selectedAdmin.gstNumber ? '#059669' : '#d97706'
                                                    }}>
                                                        {selectedAdmin.gstNumber || 'Unregistered / Tax Exempt'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">HSN Code</label>
                                    <input
                                        type="text"
                                        className="admin-form-input"
                                        value={formData.hsnCode}
                                        onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                        placeholder="Enter HSN Code (default: 998314)"
                                        required
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">Description / Items</label>
                                    <textarea
                                        className="admin-form-input"
                                        style={{ minHeight: '80px', resize: 'vertical' }}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter invoice details (e.g. Web Development Services - Jan 2024)"
                                        required
                                    />
                                </div>

                                <div className="admin-form-row">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="admin-form-input"
                                            value={formData.amount}
                                            onChange={handleAmountChange}
                                            placeholder="0.00"
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Due Date</label>
                                        <input
                                            type="date"
                                            className="admin-form-input"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Tax Preview Box */}
                                {taxPreview && (
                                    <div style={{
                                        background: '#f1f5f9',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span>Subtotal:</span>
                                            <strong>₹{taxPreview.subTotal.toLocaleString()}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b' }}>
                                            <span>Tax ({taxPreview.text}):</span>
                                            <span>+ ₹{(taxPreview.total - taxPreview.subTotal).toLocaleString()}</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            borderTop: '1px solid #cbd5e1',
                                            paddingTop: '0.5rem',
                                            color: '#1e293b',
                                            fontSize: '1.1rem'
                                        }}>
                                            <strong>Total:</strong>
                                            <strong>₹{taxPreview.total.toLocaleString()}</strong>
                                        </div>
                                    </div>
                                )}

                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="admin-submit-btn" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create Invoice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminInvoices;
