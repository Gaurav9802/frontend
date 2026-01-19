import React, { useEffect, useState } from "react";
import "./ViewClient.css";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ViewClients = () => {
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, [currentPage, rowsPerPage]);

  const fetchClients = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:5151/api/client/clients?page=${currentPage}&rowsPerPage=${rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setClients(result.data);
        setTotalItems(result.pagination.totalItems);
        setTotalPages(result.pagination.totalPages);
      } else {
        console.error("Unexpected API format:", result);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const toggleSelect = (clientId) => {
    setSelectedClients((prevSelected) =>
      prevSelected.includes(clientId)
        ? prevSelected.filter((id) => id !== clientId)
        : [...prevSelected, clientId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map((c) => c._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedClients.length === 0) {
      alert("Please select at least one client to delete.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete selected clients?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5151/api/client/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ clientIds: selectedClients }),
      });
      const result = await response.json();

      if (result.success) {
        alert("Selected clients deleted successfully.");
        setClients((prev) =>
          prev.filter((client) => !selectedClients.includes(client._id))
        );
        setSelectedClients([]);
      } else {
        alert("Failed to delete clients.");
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting clients:", error);
      alert("An error occurred while deleting.");
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Delete this client?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5151/api/client/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ clientIds: [clientId] }),
      });
      const result = await response.json();

      if (result.success) {
        setClients((prev) => prev.filter((client) => client._id !== clientId));
        setSelectedClients((prev) => prev.filter((id) => id !== clientId));
      } else {
        alert("Failed to delete.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    }
  };

  const filteredClients = clients.filter((client) =>
    client.contactPersonName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClient = (clientId) => {
    navigate(`/edit-client/${clientId}`);
  };

  // Pagination range display
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="table-wrapper">
      <div className="table-header">
        <h2>Client Directory</h2>
        <div className="header-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="add-btn" onClick={() => navigate("/add-client")}>
            ＋ Add Client
          </button>
        </div>
      </div>

      <div className="action-bar">
        <button className="select-btn" onClick={toggleSelectAll}>
          {selectedClients.length === clients.length ? "Deselect All" : "Select All"}
        </button>
        <button
          className="delete-btn"
          onClick={handleDeleteSelected}
          disabled={selectedClients.length === 0}
        >
          Delete Selected ({selectedClients.length})
        </button>
      </div>

      <div className="table-container">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Company Names</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="6">No clients found</td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client._id)}
                      onChange={() => toggleSelect(client._id)}
                    />
                  </td>
                  <td>
                    <span
                      onClick={() => navigate(`/all-details/${client._id}`)}
                      style={{ color: "#1976d2", cursor: "pointer" }}
                      title="View Full Details"
                    >
                      {client.contactPersonName || "N/A"}
                    </span>
                  </td>
                  <td>{client.email || "N/A"}</td>
                  <td>{client.phone || "N/A"}</td>
                  <td>{client.companyNames?.join(", ") || "N/A"}</td>
                  <td>
                    <button
                      className="action-icon"
                      onClick={() => handleEditClient(client._id)}
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="action-icon"
                      onClick={() => handleDeleteClient(client._id)}
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
      </div>

      {/* Pagination */}
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
    </div>
  );
};

export default ViewClients;
