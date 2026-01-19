import React, { useEffect, useState } from "react";
import "./ViewExpenses.css";
import { FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
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

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchExpenses = async (type) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5151${endpoints[type]}?page=${currentPage}&rowsPerPage=${rowsPerPage}`
      );
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
      const res = await fetch("http://localhost:5151/api/expense/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseIds: selected }),
      });
      const result = await res.json();
      if (result.success) {
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
      const res = await fetch("http://localhost:5151/api/expense/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseIds: [id] }),
      });
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

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="table-wrapper">
      <div className="table-header">
        <h2>Expenses</h2>
        <div className="header-actions">
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
          <button className="add-btn" onClick={() => navigate("/add-expense")}>
            ＋ Add Expense
          </button>
        </div>
      </div>

      <div className="total-expense">
        <strong>Total Expense ({filter}): </strong> ₹{totalExpense}
      </div>

      <div className="action-bar">
        <button className="select-btn" onClick={toggleSelectAll}>
          {selected.length === expenses.length && expenses.length > 0
            ? "Deselect All"
            : "Select All"}
        </button>
        <button
          className="delete-btn"
          onClick={deleteSelected}
          disabled={!selected.length}
        >
          Delete Selected ({selected.length})
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="clients-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selected.length === expenses.length &&
                      expenses.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Title</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="6">No expenses found</td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(e._id)}
                        onChange={() => toggleSelect(e._id)}
                      />
                    </td>
                    <td>{e.title}</td>
                    <td>₹{e.amount}</td>
                    <td>{e.paymentMethod}</td>
                    <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="action-icon"
                        onClick={() => deleteSingle(e._id)}
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

      {/* Pagination UI */}
      {!loading && totalItems > 0 && (
        <div className="pagination-container">
          <div className="pagination">
            <span className="pagination-label">Rows per page:</span>
            <select
              className="rows-select"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
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
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              className="pagination-icon"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewExpenses;
