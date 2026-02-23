import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewFollowups.css";
import {
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiSearch,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";

const ViewFollowups = () => {
  const [followups, setFollowups] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const url = `http://localhost:5151/api/followUp/all-followUps?page=${currentPage}&rowsPerPage=${rowsPerPage}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

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
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch("http://localhost:5151/api/followUp/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ followUpIds: selected }),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const result = await res.json();
      if (result.success) {
        alert("Deleted successfully.");
        setSelected([]);
        fetchFollowups();
      } else alert("Delete failed.");
    } catch (err) {
      console.error(err);
      alert("Error deleting.");
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = (status || 'inprogress').toLowerCase();
    const statusMap = {
      'inprogress': 'In Progress',
      'completed': 'Completed',
      'postponed': 'Postponed',
      'cancelled': 'Cancelled'
    };
    return <span className={`status-badge ${statusLower}`}>{statusMap[statusLower] || status}</span>;
  };

  const getStatusStats = () => {
    const stats = {
      total: followups.length,
      inprogress: followups.filter(f => f.status?.toLowerCase() === 'inprogress').length,
      completed: followups.filter(f => f.status?.toLowerCase() === 'completed').length,
      postponed: followups.filter(f => f.status?.toLowerCase() === 'postponed').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  const filtered = followups.filter(f =>
    f.clientId?.contactPersonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.projectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="view-followups-page">
      <div className="page-header">
        <div className="header-title">
          <h1>Follow-up Tracker</h1>
          <p>Manage and track all your client follow-ups.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate("/add-followup")}>
            <FiPlus /> Add Follow-up
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600"><FiUsers /></div>
          <div className="stat-info">
            <span className="stat-label">Total Follow-ups</span>
            <span className="stat-value">{totalItems}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-600"><FiCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{stats.inprogress}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-100 text-amber-600"><FiClock /></div>
          <div className="stat-info">
            <span className="stat-label">Postponed</span>
            <span className="stat-value">{stats.postponed}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100 text-purple-600"><FiAlertCircle /></div>
          <div className="stat-info">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>
      </div>

      <div className="content-panel">
        <div className="toolbar">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by client or project..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {selected.length > 0 && (
          <div className="selection-bar">
            <span>{selected.length} follow-up(s) selected</span>
            <button
              className="btn-delete-selected"
              onClick={handleDeleteSelected}
            >
              <FiTrash2 /> Delete Selected
            </button>
          </div>
        )}

        {loading && <p className="loading-state">Loading follow-ups...</p>}
        {error && <p className="error" style={{ padding: '20px', color: '#dc2626', textAlign: 'center' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>
                      <input
                        type="checkbox"
                        checked={selected.length === followups.length && followups.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>Client Name</th>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>Next Follow-up Date</th>
                    <th style={{ width: "80px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <div>No follow-ups found</div>
                      </td>
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
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td>
                          <span
                            className="client-link"
                            onClick={() => navigate(`/client-followup/${f.projectId?._id}`)}
                            title="View follow-ups"
                          >
                            {f.clientId?.contactPersonName || "N/A"}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: '500', color: '#1e293b' }}>
                            {f.projectId?.name || "N/A"}
                          </span>
                        </td>
                        <td>{getStatusBadge(f.status)}</td>
                        <td>
                          <span style={{ color: '#64748b' }}>
                            {last?.nextFollowUpDate
                              ? new Date(last.nextFollowUpDate).toLocaleDateString('en-GB')
                              : "N/A"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-icon-only danger"
                            onClick={() => {
                              if (window.confirm("Delete this follow-up?")) {
                                setSelected([f._id]);
                                handleDeleteSelected();
                              }
                            }}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalItems > 0 && (
              <div className="pagination-bar">
                <span>
                  Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems}</strong> entries
                </span>
                <div className="pagination-actions">
                  <select
                    className="rows-select"
                    value={rowsPerPage}
                    onChange={e => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    {[5, 10, 20, 50].map(n => (
                      <option key={n} value={n}>{n} per page</option>
                    ))}
                  </select>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
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
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewFollowups;
