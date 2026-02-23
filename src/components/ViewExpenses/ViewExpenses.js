import React, { useEffect, useState } from "react";
import "./ViewExpenses.css";
import {
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiSearch,
  FiDollarSign,
  FiTrendingDown,
  FiCalendar
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const endpoints = {
  monthly: "/api/expense/expenses",
  quarterly: "/api/expense/quarterly-expenses",
  yearly: "/api/expense/yearly-expenses",
};

const ViewExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchExpenses = async (type) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(
        `http://localhost:5151${endpoints[type]}?page=${currentPage}&rowsPerPage=${rowsPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setTotalExpense(data.totalExpense ?? 0);
        setExpenses(data.data ?? []);
        setTotalItems(data.pagination?.totalItems || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.currentPage || 1);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpenses([]);
      setTotalExpense(0);
    }
    setSelected([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses(filter);
  }, [filter, currentPage, rowsPerPage]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.length === expenses.length ? [] : expenses.map((e) => e._id)
    );
  };

  const deleteSelected = async () => {
    if (!selected.length) return alert("No expenses selected");
    if (!window.confirm("Delete selected expenses?")) return;

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch("http://localhost:5151/api/expense/expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ expenseIds: selected }),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const result = await res.json();
      if (result.success) {
        setSelected([]);
        fetchExpenses(filter);
      } else {
        alert("Deletion failed: " + (result.message || ""));
      }
    } catch (err) {
      console.error(err);
      alert("Error while deleting.");
    }
  };

  const deleteSingle = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch("http://localhost:5151/api/expense/expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ expenseIds: [id] }),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const result = await res.json();
      if (result.success) {
        fetchExpenses(filter);
      } else {
        alert("Failed to delete: " + (result.message || ""));
      }
    } catch (err) {
      console.error(err);
      alert("Error while deleting.");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const getPaymentMethodBadge = (method) => {
    const methodLower = (method || 'bank').toLowerCase();
    return <span className={`category-badge ${methodLower}`}>{method}</span>;
  };

  const filteredExpenses = expenses.filter(exp =>
    exp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="view-expenses-page">
      <div className="page-header">
        <div className="header-title">
          <h1>Expenses</h1>
          <p>Track and manage your business expenses.</p>
        </div>
        <div className="header-actions">
          <div className="filter-tabs">
            {["monthly", "quarterly", "yearly"].map((type) => (
              <button
                key={type}
                className="filter-btn"
                onClick={() => {
                  setFilter(type);
                  setCurrentPage(1);
                }}
                disabled={filter === type}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={() => navigate("/add-expense")}>
            <FiPlus /> Add Expense
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon bg-indigo-100 text-indigo-600"><FiDollarSign /></div>
          <div className="stat-info">
            <span className="stat-label">Total {filter.charAt(0).toUpperCase() + filter.slice(1)} Expenses</span>
            <span className="stat-value compact">{formatCurrency(totalExpense)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-600"><FiTrendingDown /></div>
          <div className="stat-info">
            <span className="stat-label">Total Entries</span>
            <span className="stat-value">{totalItems}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-100 text-amber-600"><FiCalendar /></div>
          <div className="stat-info">
            <span className="stat-label">Period</span>
            <span className="stat-value" style={{ fontSize: '18px' }}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
          </div>
        </div>
      </div>

      <div className="content-panel">
        <div className="toolbar">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {selected.length > 0 && (
          <div className="selection-bar">
            <span>{selected.length} expense(s) selected</span>
            <button onClick={deleteSelected} className="btn-delete-selected">
              <FiTrash2 /> Delete Selected
            </button>
          </div>
        )}

        <div className="table-container">
          {loading ? (
            <div className="loading-state">Loading expenses...</div>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={selected.length === expenses.length && expenses.length > 0}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th style={{ width: "80px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <div>No expenses found</div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e) => (
                    <tr key={e._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(e._id)}
                          onChange={() => toggleSelect(e._id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{e.title}</span>
                      </td>
                      <td>
                        <span className="amount-text">{formatCurrency(e.amount)}</span>
                      </td>
                      <td>{getPaymentMethodBadge(e.paymentMethod)}</td>
                      <td>
                        <span style={{ color: '#64748b' }}>
                          {new Date(e.expenseDate).toLocaleDateString('en-GB')}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>
                          {e.description || '—'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-icon-only danger"
                          onClick={() => deleteSingle(e._id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && totalItems > 0 && (
          <div className="pagination-bar">
            <span>
              Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems}</strong> entries
            </span>
            <div className="pagination-actions">
              <select
                className="rows-select"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n} per page</option>
                ))}
              </select>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft /> Previous
              </button>
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewExpenses;

