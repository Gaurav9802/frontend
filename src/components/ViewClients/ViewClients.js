import React, { useEffect, useState, useRef } from "react";
import "./ViewClient.css";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiPlus,
  FiMoreHorizontal,
  FiFilter,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiPhone,
  FiUsers,
  FiBriefcase,
  FiActivity
} from "react-icons/fi";

const ViewClients = () => {
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // For dropdown menus
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, [currentPage, rowsPerPage]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:5151/api/client/clients?page=${currentPage}&rowsPerPage=${rowsPerPage}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setClients(result.data);
        setTotalItems(result.pagination.totalItems);
        // setTotalPages(result.pagination.totalPages); // Not explicitly used as we calculate pages
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (clientId) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedClients.length === clients.length) setSelectedClients([]);
    else setSelectedClients(clients.map(c => c._id));
  };

  const handleDelete = async (ids) => {
    if (!window.confirm("Are you sure you want to delete the selected client(s)?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:5151/api/client/client", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clientIds: ids }),
      });
      if (res.ok) {
        setClients(prev => prev.filter(c => !ids.includes(c._id)));
        setSelectedClients(prev => prev.filter(id => !ids.includes(id)));
        if (clients.length === ids.length && currentPage > 1) setCurrentPage(p => p - 1);
        else fetchClients();
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleMenuClick = (e, clientId) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === clientId ? null : clientId);
  };

  // Utilities
  const getInitials = (name) => {
    const parts = (name || "").split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "??";
  };

  const getRandomColor = (name) => {
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const filteredClients = clients.filter((client) =>
    client.contactPersonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.companyNames?.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);
  const totalPagesComputed = Math.ceil(totalItems / rowsPerPage);

  return (
    <div className="view-clients-page">
      <div className="page-header">
        <div className="header-title">
          <h1>Clients</h1>
          <p>View and manage your client relationships.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <FiDownload /> Export
          </button>
          <button className="btn-primary" onClick={() => navigate("/add-client")}>
            <FiPlus /> Add Client
          </button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600"><FiUsers /></div>
          <div className="stat-info">
            <span className="stat-label">Total Clients</span>
            <span className="stat-value">{totalItems}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-600"><FiActivity /></div>
          <div className="stat-info">
            <span className="stat-label">Active Now</span>
            <span className="stat-value">{totalItems}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100 text-purple-600"><FiBriefcase /></div>
          <div className="stat-info">
            <span className="stat-label">Companies</span>
            <span className="stat-value">{clients.filter(c => c.companyNames?.length > 0).length}</span>
          </div>
        </div>
      </div>

      <div className="content-panel">
        <div className="toolbar">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-wrapper">
            <button className="btn-icon-text">
              <FiFilter /> Filter
            </button>
            {selectedClients.length > 0 && (
              <button className="btn-danger-light" onClick={() => handleDelete(selectedClients)}>
                Delete ({selectedClients.length})
              </button>
            )}
          </div>
        </div>

        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    checked={clients.length > 0 && selectedClients.length === clients.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Client Name</th>
                <th>Company Entity</th>
                <th>Contact Details</th>
                <th>Added Date</th>
                <th>Status</th>
                <th style={{ width: "50px" }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" className="text-center py-5">Loading data...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-5 text-muted">No clients found matching your search.</td></tr>
              ) : (
                filteredClients.map((client) => {
                  const avatarColor = getRandomColor(client.contactPersonName);
                  return (
                    <tr key={client._id} className={selectedClients.includes(client._id) ? "selected" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client._id)}
                          onChange={() => toggleSelect(client._id)}
                        />
                      </td>
                      <td>
                        <div className="user-profile" onClick={() => navigate(`/all-details/${client._id}`)}>
                          <div className="avatar" style={{ backgroundColor: `${avatarColor}15`, color: avatarColor, border: `1px solid ${avatarColor}30` }}>
                            {getInitials(client.contactPersonName)}
                          </div>
                          <div className="user-info">
                            <span className="name">{client.contactPersonName}</span>
                            <span className="id">ID: {client._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="company-info">
                          <span className="company-name">
                            {client.companyNames?.[0] || "—"}
                          </span>
                          {client.companyNames?.length > 1 && <span className="badge-more py-0.5 px-2">+{client.companyNames.length - 1}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="contact-stack">
                          <div className="contact-row" title={client.email}>
                            <FiMail className="icon-xs text-gray-400 group-hover:text-primary-500" />
                            <span className="contact-text">{client.email}</span>
                          </div>
                          <div className="contact-row">
                            <FiPhone className="icon-xs text-gray-400" />
                            <span className="contact-text">{client.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="date-text">{formatDate(client.createdAt)}</span>
                      </td>
                      <td>
                        <span className="status-badge active">
                          <span className="status-dot"></span> Active
                        </span>
                      </td>
                      <td style={{ position: 'relative' }}>
                        <button
                          className="btn-icon-only"
                          onClick={(e) => handleMenuClick(e, client._id)}
                        >
                          <FiMoreHorizontal />
                        </button>
                        {activeMenu === client._id && (
                          <div className="dropdown-menu shadow-lg" ref={menuRef}>
                            <div onClick={() => navigate(`/all-details/${client._id}`)}>View Details</div>
                            <div onClick={() => navigate(`/edit-client/${client._id}`)}>Edit Client</div>
                            <div className="danger" onClick={() => handleDelete([client._id])}>Delete Client</div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
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
              {Array.from({ length: totalPagesComputed }, (_, i) => i + 1).map(pageNum => (
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
              disabled={currentPage === totalPagesComputed}
              onClick={() => setCurrentPage(p => p + 1)}
              className="pagination-btn"
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewClients;
