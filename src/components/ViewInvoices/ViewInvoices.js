import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewInvoices.css";
import { FaEye } from "react-icons/fa";
import { MdOutgoingMail } from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const statusCycle = {
  paid: "unpaid",
  unpaid: "paid",
};

const ViewInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, rowsPerPage]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming your backend supports pagination params
      const url = `http://localhost:5151/api/invoice/all-invoices?page=${currentPage}&rowsPerPage=${rowsPerPage}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setInvoices(data.data);
        setTotalItems(data.pagination?.totalItems || data.data.length);
        setCurrentPage(data.pagination?.currentPage || currentPage);
        setRowsPerPage(data.pagination?.rowsPerPage || rowsPerPage);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        setError("Failed to fetch invoices");
      }
    } catch (err) {
      setError("Error fetching invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = async (invoice) => {
    const currentStatus = invoice.paymentStatus.toLowerCase();
    const nextStatus = statusCycle[currentStatus] || "paid";

    try {
      const response = await fetch(
        `http://localhost:5151/api/invoice/invoice/${invoice._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentStatus: nextStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setInvoices((prevInvoices) =>
          prevInvoices.map((inv) =>
            inv._id === invoice._id
              ? { ...inv, paymentStatus: nextStatus }
              : inv
          )
        );
      } else {
        alert("Failed to update status: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  // Optional: filter invoices on search term in client or project name
  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.clientId?.contactPersonName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      inv.projectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <h1>Invoices</h1>
        <div className="header-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search by client or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn-add-invoice"
            onClick={() => navigate("/add-invoices")}
          >
            + Add Invoice
          </button>
        </div>
      </div>

      {loading && <p className="loading">Loading invoices...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Amount (₹)</th>
                  <th>Installment</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const displayStatus =
                      inv.paymentStatus.charAt(0).toUpperCase() +
                      inv.paymentStatus.slice(1);
                    return (
                      <tr key={inv._id}>
                        <td className="client-name">
                          {inv.clientId?.contactPersonName || "N/A"}
                        </td>
                        <td>{inv.projectId?.name || "N/A"}</td>
                        <td
                          className={`status ${inv.paymentStatus}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleStatusClick(inv)}
                          title="Click to change status"
                        >
                          {displayStatus}
                        </td>
                        <td>{inv.amount.toFixed(2)}</td>
                        <td>{inv.installmentNumber}</td>
                        <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="icon-btn view"
                            title="View Invoice"
                            onClick={() =>
                              window.open(
                                `http://localhost:5151${inv.pdfPath}`,
                                "_blank"
                              )
                            }
                          >
                            <FaEye size={18} />
                          </button>

                          <button
                            className="icon-btn send"
                            title="Send via Gmail"
                            onClick={() =>
                              navigate("/send-invoice-gmail", {
                                state: { pdfPath: inv.pdfPath },
                              })
                            }
                          >
                            <MdOutgoingMail size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pagination-container">
            <div className="pagination">
              <span className="pagination-label">Rows per page:</span>
              <select
                className="rows-select"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="pagination-range">
                {startItem}–{endItem} of {totalItems}
              </span>
              <button
                className="pagination-icon"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                title="Previous Page"
              >
                <FiChevronLeft style={{ color: "black" }} />
              </button>
              <button
                className="pagination-icon"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                title="Next Page"
              >
                <FiChevronRight style={{ color: "black" }} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewInvoices;
