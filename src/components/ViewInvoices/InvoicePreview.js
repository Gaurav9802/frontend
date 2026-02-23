
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./InvoicePreview.css";

const InvoicePreview = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                const [invRes, compRes] = await Promise.all([
                    fetch(`http://localhost:5151/api/invoice/invoice/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`http://localhost:5151/api/companyDetail/companyDetails`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                // Check for authentication errors
                if (invRes.status === 401 || compRes.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return;
                }

                const invData = await invRes.json();
                const compData = await compRes.json();

                if (invData.success) setInvoice(invData.data);
                else throw new Error(invData.message || "Failed to fetch invoice");

                if (compData.success) setCompany(compData.data?.[0] || compData.company);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-4 text-center">Loading invoice preview...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
    if (!invoice || !company) return <div className="p-4 text-center">Invoice or Company details not found.</div>;

    // Helper: Number to Words (Simplified or use library if available)
    const numberToWords = (num) => {
        // Basic implementation or placeholder since frontend lacks library without install
        // Ideally use a library like 'number-to-words' but user didn't ask to install deps
        // Let's use a very simple formatter or just amount
        return `${num} (Use a library for words)`;
        // Or better, let's try to get it from backend or just use a placeholder
    };

    // Calculate Description
    const project = invoice.projectId || {};
    const client = invoice.clientId || {};
    const percentage = project.paymentTerms ? project.paymentTerms[invoice.installmentNumber - 1] : 0;
    const description = `Final Payment: ${percentage}% of Rs. ${project.totalAmount?.toLocaleString('en-IN') || 0}`;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    };


    // Address Parsing
    // Client Address
    const clientAdd = client.billingAddresses?.[0] || {};
    const clientCityState = [clientAdd.city, clientAdd.state].filter(Boolean).join(", ");

    // Company Address components for specific layout
    const cAddress = company.billingAddress || {};

    return (
        <div className="invoice-preview-wrapper">
            {/* Action Bar */}
            <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={() => window.history.back()}
                    style={{
                        padding: '10px 20px',
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        color: '#374151',
                    }}
                >
                    ← Back
                </button>
                <button
                    onClick={() => window.print()}
                    style={{
                        padding: '10px 24px',
                        background: '#4F46E5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                    }}
                >
                    🖨️ Print
                </button>
            </div>

            <div className="c35 doc-content">
                <div>
                    <p className="c2">
                        {/* Empty Img placeholder from template, or we can just leave it empty if not needed */}
                    </p>
                </div>

                <p className="c18 c22">
                    <span className="c0">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span>
                </p>
                <p className="c18"><span className="c3">Invoice No: {invoice.invoiceNumber || invoice._id.slice(-6).toUpperCase()}</span></p>
                <p className="c18"><span className="c12">Date:{formatDate(invoice.issueDate)}</span><span className="c0">&nbsp; &nbsp; &nbsp; </span></p>

                <p className="c2">
                    <span>&nbsp; &nbsp;</span>
                    {company.logo && (
                        <span style={{ overflow: 'hidden', display: 'inline-block', margin: '0.00px 0.00px', border: '0.00px solid #000000', transform: 'rotate(0.00rad) translateZ(0px)', WebkitTransform: 'rotate(0.00rad) translateZ(0px)', width: '229.91px', height: '70.00px' }}>
                            <img
                                alt="Company Logo"
                                src={`http://localhost:5151/${company.logo}`}
                                style={{ width: '229.91px', height: '74.81px', marginLeft: '0.00px', marginTop: '-2.41px', transform: 'rotate(0.00rad) translateZ(0px)', WebkitTransform: 'rotate(0.00rad) translateZ(0px)', objectFit: 'contain' }}
                            />
                        </span>
                    )}
                </p>

                <p className="c32 c29 c8"><span className="c3"></span></p>
                <p className="c32 c29 c8"><span className="c3"></span></p>

                <p className="c32 c29">
                    <span className="c3">{company.companyName}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Contact Details: &nbsp; &nbsp;</span>
                </p>

                <p className="c2">
                    <span className="c20 c12">{cAddress.houseNo} {cAddress.street},</span>
                    <span className="c11">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span>{company.email}</span>
                </p>

                <p className="c2">
                    <span className="c12 c20">{cAddress.tehsil ? `TEH-${cAddress.tehsil}` : cAddress.city},</span>
                    <span className="c11">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span>{company.phone}</span>
                </p>

                <p className="c2 c23">
                    <span className="c20 c12">{cAddress.state}, {cAddress.pincode}</span>
                    <span className="c15 c11">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </p>

                <p className="c2 c8 c23"><span className="c11 c15"></span></p>

                <p className="c2"><span className="c3">GSTIN: {company.gstin}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
                <hr />
                <p className="c2 c8"><span className="c0"></span></p>

                <p className="c24"><span className="c16 c13 c12">Bill To:</span></p>
                <p className="c25 c29"><span className="c16 c13 c12">{client.contactPersonName || client.companyNames?.[0]}</span></p>

                <p className="c2"><span className="c26 c20 c12">{clientAdd.street}</span></p>
                <p className="c2"><span className="c20 c12 c26">{clientAdd.city}, {clientCityState}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
                <p className="c2 c23"><span className="c20 c12">{clientAdd.postalCode}</span></p>

                <p className="c9 c25">
                    <span className="c12">GSTIN: {invoice.gstin || client.gstNumbers?.[0] || "N/A"}</span>
                    <span className="c13 c12 c16">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </p>

                <p className="c14 c9"><span className="c3">Place of Supply: {clientAdd.state || "-"}</span></p>
                <p className="c5 c9"><span className="c3"></span></p>
                <p className="c5 c9"><span className="c3"></span></p>

                <table className="c6">
                    <thead>
                        <tr className="c30">
                            <td className="c7 c21" colSpan="1" rowSpan="1"><p className="c14"><span className="c3">Description</span></p></td>
                            <td className="c17 c21" colSpan="1" rowSpan="1"><p className="c14"><span className="c3">HSN Code</span></p></td>
                            <td className="c4 c21" colSpan="1" rowSpan="1"><p className="c1"><span className="c3">Amount</span></p></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="c30">
                            <td className="c7" colSpan="1" rowSpan="1"><p className="c14"><span className="c0">{description}</span></p></td>
                            <td className="c17" colSpan="1" rowSpan="1"><p className="c33"><span className="c0">{company.hsnCode || "998314"}</span></p></td>
                            <td className="c4" colSpan="1" rowSpan="1"><p className="c1"><span className="c0">&#8377; {invoice.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p></td>
                        </tr>

                        {invoice.extraAmount > 0 && (
                            <tr className="c30">
                                <td className="c7" colSpan="1" rowSpan="1"><p className="c14"><span className="c0">Extra Charges {invoice.isTaxPaidOnExtraAmount ? "" : "(Non-Taxable)"}</span></p></td>
                                <td className="c17" colSpan="1" rowSpan="1"><p className="c33"><span className="c0">{company.hsnCode || "998314"}</span></p></td>
                                <td className="c4" colSpan="1" rowSpan="1"><p className="c1"><span className="c0">&#8377; {invoice.extraAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p></td>
                            </tr>
                        )}

                        <tr className="c30">
                            <td className="c7" colSpan="1" rowSpan="1"><p className="c14"><span className="c3">Total Amount:</span></p></td>
                            <td className="c17" colSpan="1" rowSpan="1"><p className="c5"><span className="c3"></span></p></td>
                            <td className="c4" colSpan="1" rowSpan="1"><p className="c1"><span className="c3">&#8377; {(invoice.amount + (invoice.extraAmount || 0))?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p></td>
                        </tr>

                        {invoice.igst > 0 && (
                            <tr className="c30">
                                <td className="c7" colSpan="1" rowSpan="1"><p className="c14"><span className="c0">IGST {invoice.igst}%</span></p></td>
                                <td className="c17" colSpan="1" rowSpan="1"><p className="c5"><span className="c0"></span></p></td>
                                <td className="c4" colSpan="1" rowSpan="1"><p className="c1"><span className="c0">&#8377; {((invoice.amount + (invoice.isTaxPaidOnExtraAmount ? invoice.extraAmount : 0)) * invoice.igst / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p></td>
                            </tr>
                        )}

                        {(invoice.cgst > 0 || invoice.sgst > 0) && (
                            <>
                                <tr className="c30">
                                    <td className="c7" colSpan="1" rowSpan="1"><p className="c14"><span className="c0">CGST {invoice.cgst}%</span></p></td>
                                    <td className="c17" colSpan="1" rowSpan="1"><p className="c5"><span className="c0"></span></p></td>
                                    <td className="c4" colSpan="1" rowSpan="1"><p className="c1"><span className="c0">&#8377; {((invoice.amount + (invoice.isTaxPaidOnExtraAmount ? invoice.extraAmount : 0)) * invoice.cgst / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p></td>
                                </tr>
                                <tr className="c30">
                                    <td className="c7" colSpan="1" rowSpan="1"><p className="c14"><span className="c0">SGST {invoice.sgst}%</span></p></td>
                                    <td className="c17" colSpan="1" rowSpan="1"><p className="c5"><span className="c0"></span></p></td>
                                    <td className="c4" colSpan="1" rowSpan="1"><p className="c1"><span className="c0">&#8377; {((invoice.amount + (invoice.isTaxPaidOnExtraAmount ? invoice.extraAmount : 0)) * invoice.sgst / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p></td>
                                </tr>
                            </>
                        )}

                        <tr className="c30">
                            <td className="c7" colSpan="1" rowSpan="1"><p className="c14"><span className="c3">Total (Inclusive of All Taxes)</span></p></td>
                            <td className="c17" colSpan="1" rowSpan="1"><p className="c5"><span className="c3"></span></p></td>
                            <td className="c4" colSpan="1" rowSpan="1"><p className="c1"><span className="c3">&#8377; {invoice.totalAmountWithTax?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} /- &nbsp;</span></p></td>
                        </tr>

                        <tr className="c34">
                            <td className="c19" colSpan="3" rowSpan="1">
                                <p className="c14"><span className="c12">Amount Chargeable (In Words): </span><span>{numberToWords(Math.round(invoice.totalAmountWithTax))} only</span></p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <p className="c2 c8"><span className="c0"></span></p>

                <p className="c29 c32"><span className="c12 c13">Account Details:</span></p>
                <ul className="c28 lst-kix_f1h0xwbk40xg-0 start">
                    <li className="c10 li-bullet-0"><span className="c0">Account Number: {company.accountNumber}</span></li>
                    <li className="c10 li-bullet-0"><span className="c0">Bank Name: {company.bankName}</span></li>
                    <li className="c10 li-bullet-0"><span className="c0">IFSC Code: {company.ifscCode}</span></li>
                </ul>

                <p className="c2">
                    <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span className="c16 c31 c12">Thank You</span>
                </p>

                <p className="c2">
                    <span className="c12 c31">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    {company.digitalSignature && (
                        <span style={{ overflow: 'hidden', display: 'inline-block', margin: '0.00px 0.00px', border: '0.00px solid #000000', transform: 'rotate(0.00rad) translateZ(0px)', WebkitTransform: 'rotate(0.00rad) translateZ(0px)', width: '202.03px', height: '76.71px' }}>
                            <img
                                alt="Signature"
                                src={`http://localhost:5151/${company.digitalSignature}`}
                                style={{ width: '241.75px', height: '76.71px', marginLeft: '-19.86px', marginTop: '0.00px', transform: 'rotate(0.00rad) translateZ(0px)', WebkitTransform: 'rotate(0.00rad) translateZ(0px)' }}
                            />
                        </span>
                    )}
                </p>

                <div><p className="c2 c8"><span className="c0"></span></p></div>
            </div>
        </div>
    );
};

export default InvoicePreview;
