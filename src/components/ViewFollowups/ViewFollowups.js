import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewFollowups.css";
import { FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ViewFollowups = () => {
  const [followups, setFollowups] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    fetchFollowups();
  }, [currentPage, rowsPerPage]);

  const fetchFollowups = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:5151/api/followUp/all-followUps?page=${currentPage}&rowsPerPage=${rowsPerPage}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFollowups(data.data);
        setTotalItems(data.pagination?.totalItems || data.data.length);
        setCurrentPage(data.pagination?.currentPage || currentPage);
        setRowsPerPage(data.pagination?.rowsPerPage || rowsPerPage);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        setError("Failed to fetch follow-ups");
      }
    } catch (err) {
      setError("Error fetching follow-ups");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = id => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selected.length === followups.length) setSelected([]);
    else setSelected(followups.map(f => f._id));
  };

  const handleDeleteSelected = async () => {
    if (!selected.length) return alert("Select follow-ups to delete");
    if (!window.confirm("Delete selected follow-ups?")) return;
    try {
      const res = await fetch("http://localhost:5151/api/followUp/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followupIds: selected }),
      });
      const result = await res.json();
      if (result.success) {
        alert("Deleted successfully.");
        fetchFollowups();
      } else alert("Delete failed.");
    } catch (err) {
      console.error(err);
      alert("Error deleting.");
    }
  };

  const filtered = followups.filter(f =>
    f.clientId?.contactPersonName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="table-wrapper">
      <div className="table-header">
        <h2>Follow-up Tracker</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search by client..."
            className="search-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="add-btn" onClick={() => navigate("/add-followup")}>
            ＋ Add Follow-up
          </button>
        </div>
      </div>

      <div className="action-bar">
        <button className="select-btn" onClick={toggleSelectAll}>
          {selected.length === followups.length ? "Deselect All" : "Select All"}
        </button>
        <button
          className="delete-btn"
          onClick={handleDeleteSelected}
          disabled={!selected.length}
        >
          Delete Selected ({selected.length})
        </button>
      </div>

      {loading && <p className="loading">Loading follow-ups...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Client Name</th>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th>Next Follow-up Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5">No follow-ups found</td>
                  </tr>
                ) : filtered.map(f => {
                  const last = f.followUpHistory?.[f.followUpHistory.length - 1];
                  return (
                    <tr key={f._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(f._id)}
                          onChange={() => toggleSelect(f._id)}
                        />
                      </td>
                      <td>
                        <span
                          style={{ color: "#1976d2", cursor: "pointer" }}
                          onClick={() => navigate(`/client-followup/${f.projectId?._id}`)}
                          title="View follow-ups"
                        >
                          {f.clientId?.contactPersonName || "N/A"}
                        </span>
                      </td>
                      <td>{f.projectId?.name || "N/A"}</td>
                      <td>{f.status || "N/A"}</td>
                      <td>
                        {last?.nextFollowUpDate
                          ? new Date(last.nextFollowUpDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls – EXACT icons & layout from Invoices style */}
          <div className="pagination-container">
            <div className="pagination">
              <span className="pagination-label">Rows per page:</span>
              <select
                className="rows-select"
                value={rowsPerPage}
                onChange={e => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 20, 50].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="pagination-range">
                {startItem}–{endItem} of {totalItems}
              </span>
              <button
                className="pagination-icon"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                title="Previous Page"
              >
                <FiChevronLeft size={18} color="black"/>
              </button>
              <button
                className="pagination-icon"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                title="Next Page"
              >
                <FiChevronRight size={18} color="black"/>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewFollowups;
