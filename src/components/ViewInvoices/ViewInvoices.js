import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewInvoices.css";
import {
  FiSearch,
  FiPlus,
  FiDownload,
  FiFilter,
  FiMoreHorizontal,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiEye,
  FiSend
} from "react-icons/fi";

const ViewInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const url = `http://localhost:5151/api/invoice/all-invoices?page=${currentPage}&rowsPerPage=${rowsPerPage}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setInvoices(data.data);
        setTotalItems(data.pagination?.totalItems || data.data.length);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (invoice, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5151/api/invoice/invoice/${invoice._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoices(prev => prev.map(inv => inv._id === invoice._id ? { ...inv, paymentStatus: newStatus } : inv));
        setActiveMenu(null);

        // Show success message
        const statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        alert(`✓ Invoice #${invoice.invoiceNumber || invoice._id.slice(-6).toUpperCase()} marked as ${statusText}`);
      } else {
        alert(`Failed to update status: ${data.message}`);
      }
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Error updating invoice status. Please try again.");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedInvoices(invoices.map(inv => inv._id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedInvoices.includes(id)) {
      setSelectedInvoices(selectedInvoices.filter(item => item !== id));
    } else {
      setSelectedInvoices([...selectedInvoices, id]);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5151/api/invoice/invoice/${invoiceId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInvoices(invoices.filter(inv => inv._id !== invoiceId));
        setSelectedInvoices(selectedInvoices.filter(id => id !== invoiceId));
      } else {
        alert("Failed to delete invoice: " + data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting invoice");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedInvoices.length} selected invoices?`)) return;

    const token = localStorage.getItem('token');
    try {
      await Promise.all(selectedInvoices.map(id =>
        fetch(`http://localhost:5151/api/invoice/invoice/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        })
      ));
      setInvoices(invoices.filter(inv => !selectedInvoices.includes(inv._id)));
      setSelectedInvoices([]);
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Error during bulk delete");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const s = (status || 'unpaid').toLowerCase();
    if (s === 'paid') return <span className="status-badge success"><span className="status-dot success"></span>Paid</span>;
    if (s === 'unpaid') return <span className="status-badge warning"><span className="status-dot warning"></span>Unpaid</span>;
    if (s === 'overdue') return <span className="status-badge danger"><span className="status-dot danger"></span>Overdue</span>;
    if (s === 'cancelled') return <span className="status-badge neutral"><span className="status-dot neutral"></span>Cancelled</span>;
    return <span className="status-badge neutral">{status}</span>;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{date.toLocaleDateString()}</span>
        <span className="text-xs text-gray-500">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    );
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.clientId?.contactPersonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.projectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Stats
  const totalPaid = invoices.filter(i => i.paymentStatus === 'paid').length;
  const totalUnpaid = invoices.filter(i => i.paymentStatus === 'unpaid').length;
  const totalRevenue = invoices.reduce((acc, curr) => acc + (curr.paymentStatus === 'paid' ? curr.amount : 0), 0);

  return (
    <div className="view-invoices-page">
      <div className="page-header">
        <div className="header-title">
          <h1>Invoices</h1>
          <p>Track payments and manage billing records.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <FiDownload /> Export
          </button>
          <button className="btn-primary" onClick={() => navigate("/add-invoices")}>
            <FiPlus /> Create Invoice
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon bg-indigo-100 text-indigo-600"><FiFileText /></div>
          <div className="stat-info">
            <span className="stat-label">Total Invoices</span>
            <span className="stat-value">{totalItems}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-600"><FiCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-label">Paid Invoices</span>
            <span className="stat-value">{totalPaid}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-rose-100 text-rose-600"><FiAlertCircle /></div>
          <div className="stat-info">
            <span className="stat-label">Outstanding</span>
            <span className="stat-value">{totalUnpaid}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-100 text-amber-600"><FiClock /></div>
          <div className="stat-info">
            <span className="stat-label">Revenue Collected</span>
            <span className="stat-value compact">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      <div className="content-panel">
        <div className="toolbar">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              placeholder="Search client or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-wrapper">
            <button className="btn-icon-text">
              <FiFilter /> Filter
            </button>
          </div>
        </div>

        <div className="table-container">
          {selectedInvoices.length > 0 && (
            <div className="bg-red-50 p-2 mb-2 rounded flex justify-between items-center text-red-700 border border-red-200">
              <span className="text-sm font-medium px-2">{selectedInvoices.length} selected</span>
              <button onClick={handleBulkDelete} className="text-sm bg-white border border-red-200 px-3 py-1 rounded hover:bg-red-100 text-red-600 font-medium">
                Delete Selected
              </button>
            </div>
          )}

          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={invoices.length > 0 && selectedInvoices.length === invoices.length}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Invoice ID</th>
                <th>Client</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Issued Date & Time</th>
                <th style={{ width: "50px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-5">Loading invoices...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-5 text-muted">No invoices found.</td></tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv._id} className={selectedInvoices.includes(inv._id) ? "bg-blue-50" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(inv._id)}
                        onChange={() => handleSelectOne(inv._id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <span className="id-badge">#{inv.invoiceNumber || inv._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td>
                      <span className="fw-500 text-primary-dark">
                        {inv.clientId?.contactPersonName || <i className="text-muted">Unknown</i>}
                      </span>
                    </td>
                    <td>
                      <span className="text-secondary">
                        {inv.projectId?.name || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="amount-text">{formatCurrency(inv.totalAmountWithTax || inv.amount)}</span>
                    </td>
                    <td>
                      <select
                        value={inv.paymentStatus || 'unpaid'}
                        onChange={(e) => handleStatusUpdate(inv, e.target.value)}
                        className={`status-select ${inv.paymentStatus || 'unpaid'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </td>
                    <td>
                      {formatDateTime(inv.issueDate || inv.createdAt)}
                    </td>
                    <td style={{ position: 'relative' }}>
                      <button
                        className="btn-icon-only"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === inv._id ? null : inv._id);
                        }}
                      >
                        <FiMoreHorizontal />
                      </button>
                      {activeMenu === inv._id && (
                        <div className="dropdown-menu shadow-lg" ref={menuRef} style={{ right: 0, zIndex: 50 }}>
                          <div onClick={() => navigate(`/invoice-preview/${inv._id}`)}>
                            <FiEye className="menu-icon" /> Preview Invoice
                          </div>
                          <div onClick={() => window.open(`http://localhost:5151${inv.pdfPath}`, '_blank')}>
                            <FiDownload className="menu-icon" /> Download PDF
                          </div>
                          <div onClick={() => navigate("/send-invoice-gmail", { state: { pdfPath: inv.pdfPath } })}>
                            <FiSend className="menu-icon" /> Send Email
                          </div>
                          <hr className="menu-divider" />
                          <hr className="menu-divider" />
                          <div onClick={() => handleDelete(inv._id)} className="danger-text">
                            DELETE
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <span className="text-sm text-gray-500">
            Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems}</strong> entries
          </span>
          <div className="pagination-actions">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="pagination-btn"
            >
              <FiChevronLeft /> Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="pagination-btn"
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      </div >
    </div >
  );
};

export default ViewInvoices;
