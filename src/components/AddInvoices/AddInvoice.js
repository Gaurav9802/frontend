import React, { useEffect, useState } from 'react';
import './AddInvoice.css';
import { useNavigate } from 'react-router-dom';

const initialFormData = {
  clientId: '',
  projectId: '',
  issueDate: '',
  dueDate: '',
  cgst: '0',
  sgst: '0',
  igst: '0',
  installmentNumber: '',
  notes: '',
  paymentStatus: 'unpaid',
  gstin: '',
  extraAmount: '', // ✅ NEW
  isTaxPaidOnExtraAmount: false, // ✅ NEW
  companyDetails: {
    companyName: '',
    gstin: '',
    email: '',
    phone: '',
    hsnCode: '',
    billingAddress: {
      houseNo: '',
      street: '',
      tehsil: '',
      city: '',
      state: '',
      pincode: '',
    },
  },
};

const AddInvoice = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [clients, setClients] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSameState, setIsSameState] = useState(true);
  const [clientGSTNumbers, setClientGSTNumbers] = useState([]);
  const [selectedGSTIN, setSelectedGSTIN] = useState('');
  const navigate = useNavigate();

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
            companyDetails: {
              companyName: company.companyName,
              gstin: company.gstin,
              email: company.email,
              phone: company.phone,
              hsnCode: company.hsnCode,
              billingAddress: company.billingAddress,
            },
          }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

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
          setClientGSTNumbers(client.gstNumbers || []);

          // ... rest of logic remains the same ...
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

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5151/api/invoice/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          cgst,
          sgst,
          igst,
          extraAmount,
          isTaxPaidOnExtraAmount: formData.isTaxPaidOnExtraAmount,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Invoice created successfully!' });
        setFormData(initialFormData);
        setSelectedGSTIN('');
        setClientGSTNumbers([]);
      } else {
        setMessage({ type: 'error', text: data.message || '❌ Failed to create invoice.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Server error. Please try later.' });
    }

    setSubmitting(false);
  };

  return (
    <div className="add-invoice-container">
      <div className="add-invoice-header">
        <button className="back-btn" onClick={() => navigate('/invoices')}>← Back</button>
        <h2>Create Invoice</h2>
      </div>

      <form className="add-invoice-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Client</label>
            <select name="clientId" value={formData.clientId} onChange={handleChange} required>
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.contactPersonName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>GSTIN (Client)</label>
            <select name="gstin" value={selectedGSTIN} onChange={handleGSTINChange}>
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

          <div className="form-group">
            <label>Project</label>
            <select name="projectId" value={formData.projectId} onChange={handleChange} required>
              <option value="">Select Project</option>
              {filteredProjects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Issue Date</label>
            <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Installment #</label>
            <select name="installmentNumber" value={formData.installmentNumber} onChange={handleChange} required>
              <option value="">Select</option>
              {installments.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {isSameState ? (
            <>
              <div className="form-group">
                <label>CGST (%)</label>
                <input type="number" name="cgst" value={formData.cgst} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>SGST (%)</label>
                <input type="number" name="sgst" value={formData.sgst} onChange={handleChange} />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>IGST (%)</label>
              <input type="number" name="igst" value={formData.igst} onChange={handleChange} />
            </div>
          )}
        </div>

        {/* ✅ Extra Amount + Checkbox */}
        <div className="form-row">
          <div className="form-group">
            <label>Extra Amount (₹)</label>
            <input
              type="number"
              name="extraAmount"
              value={formData.extraAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
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

        <h4>Company Details</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Company</label>
            <input name="companyName" value={formData.companyDetails.companyName} readOnly />
          </div>
          <div className="form-group">
            <label>GSTIN</label>
            <input name="gstin" value={formData.companyDetails.gstin} readOnly />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input name="city" value={formData.companyDetails.billingAddress.city} readOnly />
          </div>
          <div className="form-group">
            <label>State</label>
            <input name="state" value={formData.companyDetails.billingAddress.state} readOnly />
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} />
        </div>

        <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Create Invoice'}</button>

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
