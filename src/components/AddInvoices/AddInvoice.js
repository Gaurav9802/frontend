import React, { useEffect, useState } from 'react';
import './AddInvoice.css';
import { useNavigate } from 'react-router-dom';

const initialFormData = {
  clientId: '',
  projectId: '',
  issueDate: '',


  cgst: '0',
  sgst: '0',
  igst: '0',
  installmentNumber: '',
  notes: '',
  paymentStatus: 'unpaid',
  gstin: '',
  hsnCode: '',
  signatureLabel: 'Authorized Signatory',
  extraAmount: '',
  isTaxPaidOnExtraAmount: false,
  companyDetails: {
    companyName: '',
    gstin: '',
    email: '',
    phone: '',
    hsnCode: '',
    logo: '',
    digitalSignature: '',
    billingAddress: {
      houseNo: '',
      city: '',
      state: '',
      pincode: '',
    },
    bankDetails: {
      accountName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    },
  },
  invoiceNumber: '', // Optional custom invoice number
};

const AddInvoice = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [clients, setClients] = useState([]);
  const [allProjects, setAllProjects] = useState([]); // kept for potential use or remove if sure
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSameState, setIsSameState] = useState(true);
  const [clientGSTNumbers, setClientGSTNumbers] = useState([]);
  const [selectedGSTIN, setSelectedGSTIN] = useState('');
  const [selectedClientDetails, setSelectedClientDetails] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const navigate = useNavigate();



  const getAssetUrl = (path) => {
    if (!path) return '';
    const cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('http')) return cleanPath;
    if (cleanPath.includes('uploads/')) {
      const relative = cleanPath.split('uploads/').pop();
      return `http://localhost:5151/uploads/${relative}`;
    }
    return `http://localhost:5151/uploads/${cleanPath}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [cRes, pRes, coRes] = await Promise.all([
          fetch('http://localhost:5151/api/client/clients', { headers }),
          fetch('http://localhost:5151/api/project/projects', { headers }),
          fetch('http://localhost:5151/api/companyDetail/companyDetails', { headers }),
        ]);

        const cJson = await cRes.json();
        const pJson = await pRes.json();
        const coJson = await coRes.json();

        if (cJson.success) setClients(cJson.data);
        if (pJson.success) setAllProjects(pJson.data);

        if (coJson.data && coJson.data.length) {
          const company = coJson.data[0];
          setFormData((prev) => ({
            ...prev,
            hsnCode: company.hsnCode || '',
            companyDetails: {
              ...prev.companyDetails,
              companyName: company.companyName || '',
              gstin: company.gstin || '',
              email: company.email || '',
              phone: company.phone || '',
              logo: company.logo || '',
              digitalSignature: company.digitalSignature || '',
              billingAddress: {
                houseNo: company.billingAddress?.houseNo || '',
                city: company.billingAddress?.city || '',
                state: company.billingAddress?.state || '',
                pincode: company.billingAddress?.pincode || '',
              },
              bankDetails: {
                accountName: company.companyName || '',
                accountNumber: company.accountNumber || '',
                ifscCode: company.ifscCode || '',
                bankName: company.bankName || '',
              },
            }
          }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // ✅ Load last used company details from local storage
  useEffect(() => {
    const savedDetails = localStorage.getItem('lastInvoiceCompanyDetails');
    if (savedDetails) {
      try {
        const parsed = JSON.parse(savedDetails);
        setFormData(prev => ({
          ...prev,
          companyDetails: {
            ...prev.companyDetails,
            ...parsed
          }
        }));
      } catch (e) {
        console.error("Error parsing saved company details", e);
      }
    }
  }, []);

  // ✅ Recalculate isSameState dynamicallly when client or company state changes
  useEffect(() => {
    if (selectedClientDetails?.billingAddresses?.[0]?.state) {
      const clientState = selectedClientDetails.billingAddresses[0].state.trim().toLowerCase();
      const companyState = formData.companyDetails.billingAddress.state?.trim().toLowerCase();

      setIsSameState(clientState === companyState);
    }
  }, [selectedClientDetails, formData.companyDetails.billingAddress.state]);

  const handleChange = async (e, section = null) => {
    const { name, value } = e.target;
    const newValue = e.target.type === 'checkbox' ? e.target.checked : value;

    if (name === 'clientId') {
      setFormData((prev) => ({
        ...prev,
        clientId: newValue,
        projectId: '',
        installmentNumber: '',
        cgst: '0',
        sgst: '0',
        igst: '0',
        gstin: '',
      }));
      setSelectedGSTIN('');
      setSelectedClientDetails(null);

      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const resProjects = await fetch(`http://localhost:5151/api/project/projects-client/${newValue}`, { headers });
        const dataProjects = await resProjects.json();
        if (dataProjects.success) {
          setFilteredProjects(dataProjects.data);
        }

        const resClient = await fetch(`http://localhost:5151/api/client/clients/${newValue}`, { headers });
        const dataClient = await resClient.json();

        if (dataClient.success) {
          const client = dataClient.data;
          setSelectedClientDetails(client);
          setClientGSTNumbers(client.gstNumbers || []);

          const defaultGSTIN = client.gstNumbers?.[0] || '';
          setSelectedGSTIN(defaultGSTIN);

          setFormData((prev) => ({
            ...prev,
            gstin: defaultGSTIN,
          }));

          const clientState = client.billingAddresses?.[0]?.state?.trim().toLowerCase();
          const companyState = formData.companyDetails.billingAddress?.state?.trim().toLowerCase();
          const sameState = clientState && companyState && clientState === companyState;
          setIsSameState(sameState);
        }
      } catch (err) {
        console.error('Error fetching client info:', err);
      }
    } else if (name === 'projectId') {
      const project = filteredProjects.find((p) => p._id === newValue);
      if (project) {
        const terms = Array.from({ length: project.paymentTermCount }, (_, i) => i + 1);
        setInstallments(terms);
      }
      setFormData((prev) => ({ ...prev, projectId: newValue, installmentNumber: '' }));
    } else if (section === 'company') {
      setFormData((prev) => ({
        ...prev,
        companyDetails: { ...prev.companyDetails, [name]: newValue },
      }));
    } else if (section === 'billing') {
      setFormData((prev) => ({
        ...prev,
        companyDetails: {
          ...prev.companyDetails,
          billingAddress: { ...prev.companyDetails.billingAddress, [name]: newValue },
        },
      }));
    } else if (section === 'bank') {
      setFormData((prev) => ({
        ...prev,
        companyDetails: {
          ...prev.companyDetails,
          bankDetails: { ...prev.companyDetails.bankDetails, [name]: newValue },
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleGSTINChange = (e) => {
    const gstinValue = e.target.value;
    setSelectedGSTIN(gstinValue);
    setFormData((prev) => ({
      ...prev,
      gstin: gstinValue,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'logo') setLogoFile(files[0]);
      if (name === 'digitalSignature') setSignatureFile(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const cgst = parseFloat(formData.cgst);
    const sgst = parseFloat(formData.sgst);
    const igst = parseFloat(formData.igst);
    const extraAmount = parseFloat(formData.extraAmount) || 0;

    if (!((cgst > 0 && sgst > 0 && igst === 0) || (igst > 0 && cgst === 0 && sgst === 0) || (cgst === 0 && sgst === 0 && igst === 0))) {
      setMessage({ type: 'error', text: 'Only IGST or both CGST+SGST are allowed.' });
      setSubmitting(false);
      return;
    }

    // Check if Client and Company GSTIN are identical
    const clientGstin = formData.gstin?.trim().toUpperCase();
    const companyGstin = formData.companyDetails.gstin?.trim().toUpperCase();

    if (clientGstin && companyGstin && clientGstin === companyGstin) {
      setMessage({ type: 'error', text: 'Client and Company GSTIN cannot be the same.' });
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'companyDetails') {
          // If GSTIN is empty, exclude tax fields and force dueDate = issueDate
          if (!formData.gstin) {
            if (['cgst', 'sgst', 'igst'].includes(key)) return;

          }
          formDataToSend.append(key, formData[key]);
        }
      });

      // Explicitly zero out taxes if no GSTIN
      if (!formData.gstin) {
        formDataToSend.append('cgst', 0);
        formDataToSend.append('sgst', 0);
        formDataToSend.append('igst', 0);
      }

      const cd = formData.companyDetails;
      formDataToSend.append('companyName', cd.companyName);
      formDataToSend.append('companyEmail', cd.email);
      formDataToSend.append('companyPhone', cd.phone);
      formDataToSend.append('companyGstin', cd.gstin);

      formDataToSend.append('companyHouseNo', cd.billingAddress.houseNo || '');
      formDataToSend.append('companyCity', cd.billingAddress.city || '');
      formDataToSend.append('companyState', cd.billingAddress.state || '');
      formDataToSend.append('companyPincode', cd.billingAddress.pincode || '');

      // Bank Details
      formDataToSend.append('companyAccountName', cd.bankDetails.accountName || '');
      formDataToSend.append('companyAccountNumber', cd.bankDetails.accountNumber || '');
      formDataToSend.append('companyIfscCode', cd.bankDetails.ifscCode || '');
      formDataToSend.append('companyBankName', cd.bankDetails.bankName || '');

      if (logoFile) formDataToSend.append('logo', logoFile);
      if (signatureFile) formDataToSend.append('digitalSignature', signatureFile);

      const res = await fetch('http://localhost:5151/api/invoice/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Invoice created successfully!' });

        // Save company overrides to last details
        localStorage.setItem('lastInvoiceCompanyDetails', JSON.stringify(formData.companyDetails));

        setFormData(initialFormData);
        // Clear local inputs but re-apply company details immediately for next use? No, wait.
        // If we reset form, it will be empty again.
        // Re-apply saved details to the NEW empty form so the user can immediately benefit for the NEXT invoice.
        setFormData(prev => ({
          ...initialFormData,
          companyDetails: formData.companyDetails // keep the ones just used
        }));
        setLogoFile(null);
        setSignatureFile(null);
        setSelectedGSTIN('');
        setClientGSTNumbers([]);
      } else {
        setMessage({ type: 'error', text: data.message || '❌ Failed to create invoice.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: '❌ Server error. Please try later.' });
    }

    setSubmitting(false);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/invoices')}>← Back to Invoices</button>
        <h2>Create Invoice</h2>
      </div>

      <form className="form-main" onSubmit={handleSubmit}>
        <div className="form-section">
          <h4>Client & Project Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Client</label>
              <select className="form-control" name="clientId" value={formData.clientId} onChange={handleChange} required>
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>{c.contactPersonName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>GSTIN (Client)</label>
              <select className="form-control" name="gstin" value={selectedGSTIN} onChange={handleGSTINChange}>
                <option value="">Select GSTIN (optional)</option>
                {clientGSTNumbers.length > 0 ? (
                  clientGSTNumbers.map((gst, idx) => (
                    <option key={idx} value={gst}>{gst}</option>
                  ))
                ) : (
                  <option value="">No GSTIN available</option>
                )}
              </select>
            </div>
          </div>

          {selectedClientDetails && (
            <div className="client-details-card">
              <h4>Client Information</h4>
              <div className="details-grid">
                <div><strong>Company:</strong> {selectedClientDetails.companyNames?.[0] || 'N/A'}</div>
                <div><strong>Phone:</strong> {selectedClientDetails.phone}</div>
                <div><strong>Email:</strong> {selectedClientDetails.email}</div>
                <div>
                  <strong>Billing Address:</strong>{' '}
                  {selectedClientDetails.billingAddresses?.[0] ?
                    `${selectedClientDetails.billingAddresses[0].street}, ${selectedClientDetails.billingAddresses[0].city}, ${selectedClientDetails.billingAddresses[0].state}`
                    : 'N/A'}
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Project</label>
              <select className="form-control" name="projectId" value={formData.projectId} onChange={handleChange} required>
                <option value="">Select Project</option>
                {filteredProjects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Installment #</label>
              <select className="form-control" name="installmentNumber" value={formData.installmentNumber} onChange={handleChange} required>
                <option value="">Select</option>
                {installments.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Company Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input
                className="form-control"
                name="companyName"
                value={formData.companyDetails.companyName}
                onChange={(e) => handleChange(e, 'company')}
              />
            </div>
            <div className="form-group">
              <label>Company GSTIN</label>
              <input
                className="form-control"
                name="gstin"
                value={formData.companyDetails.gstin}
                onChange={(e) => handleChange(e, 'company')}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-control"
                name="email"
                value={formData.companyDetails.email}
                onChange={(e) => handleChange(e, 'company')}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                className="form-control"
                name="phone"
                value={formData.companyDetails.phone}
                onChange={(e) => handleChange(e, 'company')}
              />
            </div>
          </div>

          <div className="form-row full-width">
            <div className="form-group">
              <label>Address</label>
              <input
                className="form-control"
                name="houseNo"
                value={formData.companyDetails.billingAddress.houseNo}
                onChange={(e) => handleChange(e, 'billing')}
              />
            </div>
          </div>

          <div className="form-row three-col">
            <div className="form-group">
              <label>City</label>
              <input
                className="form-control"
                name="city"
                value={formData.companyDetails.billingAddress.city}
                onChange={(e) => handleChange(e, 'billing')}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                className="form-control"
                name="state"
                value={formData.companyDetails.billingAddress.state}
                onChange={(e) => handleChange(e, 'billing')}
              />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input
                className="form-control"
                name="pincode"
                value={formData.companyDetails.billingAddress.pincode}
                onChange={(e) => handleChange(e, 'billing')}
              />
            </div>
          </div>

          {/* BANK DETAILS MERGED */}
          <h4 className="sub-header">Bank Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Account Name</label>
              <input
                className="form-control"
                name="accountName"
                value={formData.companyDetails.bankDetails.accountName}
                onChange={(e) => handleChange(e, 'bank')}
                placeholder="e.g. My Company Pvt Ltd"
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                className="form-control"
                name="accountNumber"
                value={formData.companyDetails.bankDetails.accountNumber}
                onChange={(e) => handleChange(e, 'bank')}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>IFSC Code</label>
              <input
                className="form-control"
                name="ifscCode"
                value={formData.companyDetails.bankDetails.ifscCode}
                onChange={(e) => handleChange(e, 'bank')}
              />
            </div>
            <div className="form-group">
              <label>Bank Name</label>
              <input
                className="form-control"
                name="bankName"
                value={formData.companyDetails.bankDetails.bankName}
                onChange={(e) => handleChange(e, 'bank')}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Financial Details</h4>
          {formData.gstin && (
            <>
              <div className="form-row">
                {isSameState ? (
                  <>
                    <div className="form-group">
                      <label>CGST (%)</label>
                      <input className="form-control" type="number" name="cgst" value={formData.cgst} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>SGST (%)</label>
                      <input className="form-control" type="number" name="sgst" value={formData.sgst} onChange={handleChange} />
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label>IGST (%)</label>
                    <input className="form-control" type="number" name="igst" value={formData.igst} onChange={handleChange} />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>HSN Code</label>
              <input
                className="form-control"
                type="text"
                name="hsnCode"
                value={formData.hsnCode}
                onChange={handleChange}
                placeholder="e.g. 998314"
              />
            </div>
            <div className="form-group">
              <label>Extra Amount (₹)</label>
              <input
                className="form-control"
                type="number"
                name="extraAmount"
                value={formData.extraAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="form-row full-width">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isTaxPaidOnExtraAmount"
                  checked={formData.isTaxPaidOnExtraAmount}
                  onChange={handleChange}
                />
                Tax applied on Extra Amount
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Invoice Configuration</h4>

          <h5 className="sub-header">Assets</h5>
          <div className="assets-grid">
            <div className="asset-card">
              <label>Company Logo</label>
              {formData.companyDetails.logo ? (
                <img
                  src={getAssetUrl(formData.companyDetails.logo)}
                  alt="Company Logo"
                  className="asset-image"
                />
              ) : <p className="no-asset">No Logo Available</p>}

            </div>

            <div className="asset-card">
              <label>Digital Signature</label>
              {formData.companyDetails.digitalSignature ? (
                <img
                  src={getAssetUrl(formData.companyDetails.digitalSignature)}
                  alt="Signature"
                  className="asset-image"
                />
              ) : <p className="no-asset">No Signature Available</p>}
              <div className="file-input-wrapper">
                <label>Change Signature:</label>
                <input type="file" name="digitalSignature" onChange={handleFileChange} />
              </div>

              <div className="signature-input-group mt-4">
                <label>Signature Label</label>
                <input
                  type="text"
                  name="signatureLabel"
                  value={formData.signatureLabel}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Authorized Signatory"
                />
              </div>
            </div>
          </div>

          <h5 className="sub-header mt-6">Details</h5>
          <div className="form-row">
            <div className="form-group">
              <label>Invoice Number (Optional)</label>
              <input
                className="form-control"
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                placeholder="Auto-generated (e.g. HT...)"
              />
            </div>
            <div className="form-group">
              <label>Issue Date</label>
              <input className="form-control" type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required />
            </div>

          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea className="form-control" name="notes" value={formData.notes} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? 'Submitting...' : 'Create Invoice'}</button>

        {message && (
          <div className={`message ${message.type === 'error' ? 'error' : 'success'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};
export default AddInvoice;
