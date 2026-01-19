import React, { useEffect, useState } from "react";
import "./ViewProjects.css"; // use shared or own styles
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ViewProjects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [currentPage, rowsPerPage]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        `http://localhost:5151/api/project/projects?page=${currentPage}&rowsPerPage=${rowsPerPage}`
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setProjects(result.data);
        // Update pagination state from response
        setTotalItems(result.pagination.totalItems);
        setCurrentPage(result.pagination.currentPage);
        setRowsPerPage(result.pagination.rowsPerPage);
        setTotalPages(result.pagination.totalPages);
      } else {
        console.error("Unexpected API response:", result);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const toggleSelect = (projectId) => {
    setSelectedProjects((prevSelected) =>
      prevSelected.includes(projectId)
        ? prevSelected.filter((id) => id !== projectId)
        : [...prevSelected, projectId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map((p) => p._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProjects.length === 0) {
      alert("Please select at least one project to delete.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete selected projects?")) return;

    try {
      const response = await fetch("http://localhost:5151/api/project/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: selectedProjects }),
      });
      const result = await response.json();

      if (result.success) {
        alert("Selected projects deleted successfully.");
        setProjects((prev) =>
          prev.filter((project) => !selectedProjects.includes(project._id))
        );
        setSelectedProjects([]);
      } else {
        alert("Failed to delete projects.");
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting projects:", error);
      alert("An error occurred while deleting.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      const response = await fetch("http://localhost:5151/api/project/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: [projectId] }),
      });
      const result = await response.json();

      if (result.success) {
        setProjects((prev) => prev.filter((project) => project._id !== projectId));
        setSelectedProjects((prev) => prev.filter((id) => id !== projectId));
      } else {
        alert("Failed to delete.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    }
  };

  // Filter projects by search term on project name
  const filteredProjects = projects.filter((project) =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProject = (projectId) => {
    navigate(`/edit-project/${projectId}`);
  };

  // Calculate start and end item indexes for pagination display
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="table-wrapper">
      <div className="table-header">
        <h2>Projects</h2>
        <div className="header-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="add-btn" onClick={() => navigate("/add-project")}>
            ＋ Add Project
          </button>
        </div>
      </div>

      <div className="action-bar">
        <button className="select-btn" onClick={toggleSelectAll}>
          {selectedProjects.length === projects.length ? "Deselect All" : "Select All"}
        </button>
        <button
          className="delete-btn"
          onClick={handleDeleteSelected}
          disabled={selectedProjects.length === 0}
        >
          Delete Selected ({selectedProjects.length})
        </button>
      </div>

      <div className="table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Project Name</th>
              <th>Client</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan="5">No projects found</td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project._id)}
                      onChange={() => toggleSelect(project._id)}
                    />
                  </td>
                  <td
                    style={{ color: "#1976d2", cursor: "pointer" }}
                    onClick={() => navigate(`/project-details/${project._id}`)}
                    title="View Project Details"
                  >
                    {project.name || "N/A"}
                  </td>
                  <td>{project.clientId?.contactPersonName || "N/A"}</td>
                  <td>{project.status || "N/A"}</td>
                  <td>
                    <button
                      className="action-icon"
                      onClick={() => handleEditProject(project._id)}
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="action-icon"
                      onClick={() => handleDeleteProject(project._id)}
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

export default ViewProjects;
