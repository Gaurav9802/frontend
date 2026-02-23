
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CompanySettings.css';

const CompanySettings = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [companyId, setCompanyId] = useState(null);
    const { token } = useAuth(); // Assuming context provides token, or get from localStorage

    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        phone: '',
        gstin: '',
        hsnCode: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        // Address
        houseNo: '',
        street: '',
        tehsil: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [files, setFiles] = useState({
        logo: null,
        digitalSignature: null
    });

    const [previews, setPreviews] = useState({
        logo: null,
        digitalSignature: null
    });

    useEffect(() => {
        fetchCompanyDetails();
    }, []);

    const fetchCompanyDetails = async () => {
        try {
            const res = await fetch('http://localhost:5151/api/companyDetail/companyDetails');
            const data = await res.json();

            if (data.success && data.data && data.data.length > 0) {
                const company = data.data[0];
                setCompanyId(company._id);
                setFormData({
                    companyName: company.companyName || '',
                    email: company.email || '',
                    phone: company.phone || '',
                    gstin: company.gstin || '',
                    hsnCode: company.hsnCode || '',
                    accountNumber: company.accountNumber || '',
                    bankName: company.bankName || '',
                    ifscCode: company.ifscCode || '',
                    houseNo: company.billingAddress?.houseNo || '',
                    street: company.billingAddress?.street || '',
                    tehsil: company.billingAddress?.tehsil || '',
                    city: company.billingAddress?.city || '',
                    state: company.billingAddress?.state || '',
                    pincode: company.billingAddress?.pincode || ''
                });

                // Set previews for existing images
                if (company.logo) {
                    setPreviews(prev => ({ ...prev, logo: `http://localhost:5151/${company.logo}` }));
                }
                if (company.digitalSignature) {
                    setPreviews(prev => ({ ...prev, digitalSignature: `http://localhost:5151/${company.digitalSignature}` }));
                }
            }
        } catch (err) {
            console.error('Error fetching company details:', err);
            setMessage({ type: 'error', text: 'Failed to load company details.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [field]: file }));
            // Create local preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const data = new FormData();

            // Append standard fields
            Object.keys(formData).forEach(key => {
                // Determine if it's a nested address field (backend expects billingAddress object or dot notation?)
                // Looking at companyController.js (step 263), it reconstructs billingAddress from req.body['billingAddress.houseNo'] etc, 
                // BUT updateDetails uses destructuring which might be safer with dot notation if using FormData.
                // Let's check updateDetails logic again. It does:
                // const { billingAddress, ...updateData } = req.body; 
                // It expects billingAddress to be an OBJECT in req.body.
                // But FormData sends strings. Handling nested objects in FormData is tricky for Multer.
                // However, usually one sends 'billingAddress.houseNo' key.

                if (['houseNo', 'street', 'tehsil', 'city', 'state', 'pincode'].includes(key)) {
                    // We'll append these as billingAddress[field] to match what backend might parse, 
                    // OR we send them individually and backend needs to handle it.
                    // The updateDetails controller expects `req.body` to contain properties.
                    // Let's send them flat and update backend if needed, or reconstruct on backend.
                    // Wait, updateDetails: `if (billingAddress) { ... }` 
                    // It expects `req.body.billingAddress` to be present.
                    // With FormData, passing `billingAddress[houseNo]` usually works if using `body-parser` extended,
                    // but here we are using `multer`. Multer populates `req.body`.
                    data.append(`billingAddress[${key}]`, formData[key]);
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Append Files
            if (files.logo) data.append('logo', files.logo);
            if (files.digitalSignature) data.append('digitalSignature', files.digitalSignature);

            const authToken = localStorage.getItem('token');
            const url = companyId
                ? `http://localhost:5151/api/companyDetail/companyDetails/${companyId}`
                : 'http://localhost:5151/api/companyDetail/companyDetails'; // Fallback if creating via POST

            const method = companyId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                    // No Content-Type header; fetch adds it with boundary for FormData
                },
                body: data
            });

            const result = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
                fetchCompanyDetails(); // Refresh
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to update settings.' });
            }

        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'An error occurred while saving.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="company-settings-container">Loading...</div>;

    return (
        <div className="company-settings-container">
            <div className="settings-card">
                <div className="settings-header">
                    <h2 className="settings-title">Company Settings & Branding</h2>
                    <p style={{ color: '#666' }}>Manage your invoice branding and company details</p>
                </div>

                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="section-label">Branding Assets</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Company Logo</label>
                            <div className="file-upload-box" onClick={() => document.getElementById('logo-upload').click()}>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'logo')}
                                    hidden
                                />
                                <span>Click to upload new logo</span>
                            </div>
                            {previews.logo && (
                                <div className="preview-container">
                                    <p className="form-label">Current / Preview:</p>
                                    <img src={previews.logo} alt="Logo Preview" className="preview-image" />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Digital Signature</label>
                            <div className="file-upload-box" onClick={() => document.getElementById('sig-upload').click()}>
                                <input
                                    id="sig-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'digitalSignature')}
                                    hidden
                                />
                                <span>Click to upload signature</span>
                            </div>
                            {previews.digitalSignature && (
                                <div className="preview-container">
                                    <p className="form-label">Current / Preview:</p>
                                    <img src={previews.digitalSignature} alt="Signature Preview" className="preview-image" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="section-label" style={{ marginTop: '2rem' }}>Company Information</div>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label className="form-label">Registered Company Name</label>
                            <input
                                className="form-input"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                className="form-input"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                className="form-input"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">GSTIN</label>
                            <input
                                className="form-input"
                                name="gstin"
                                value={formData.gstin}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Default HSN Code</label>
                            <input
                                className="form-input"
                                name="hsnCode"
                                value={formData.hsnCode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="section-label" style={{ marginTop: '2rem' }}>Registered Address</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">House No / Building</label>
                            <input
                                className="form-input"
                                name="houseNo"
                                value={formData.houseNo}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Street / Colony</label>
                            <input
                                className="form-input"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input
                                className="form-input"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tehsil</label>
                            <input
                                className="form-input"
                                name="tehsil"
                                value={formData.tehsil}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">State</label>
                            <input
                                className="form-input"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Pincode</label>
                            <input
                                className="form-input"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="section-label" style={{ marginTop: '2rem' }}>Bank Details</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Bank Name</label>
                            <input
                                className="form-input"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Account Number</label>
                            <input
                                className="form-input"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">IFSC Code</label>
                            <input
                                className="form-input"
                                name="ifscCode"
                                value={formData.ifscCode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanySettings;
