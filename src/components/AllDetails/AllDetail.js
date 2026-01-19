import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AllDetail.css";

const AllDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loadingClient, setLoadingClient] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch client details
    const fetchClient = async () => {
      try {
        const res = await fetch(`http://localhost:5151/api/client/clients/${clientId}`);
        const data = await res.json();
        if (data.success) {
          setClient(data.data);
        } else {
          setError("Failed to fetch client details");
        }
      } catch {
        setError("Error fetching client details");
      } finally {
        setLoadingClient(false);
      }
    };

    // Fetch client projects
    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:5151/api/project/projects-client/${clientId}`);
        const data = await res.json();
        if (data.success) {
          setProjects(data.data);
        } else {
          setError("Failed to fetch client projects");
        }
      } catch {
        setError("Error fetching client projects");
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchClient();
    fetchProjects();
  }, [clientId]);

  if (loadingClient || loadingProjects) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!client) {
    return <p>No client data available</p>;
  }

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 className="client-name">{client.contactPersonName || "Unnamed Client"}</h1>

      <section className="client-info">
        <h2>Contact Information</h2>
        <p><strong>Email:</strong> {client.email || "N/A"}</p>
        <p><strong>Phone:</strong> {client.phone || "N/A"}</p>

        <h2>Address</h2>
        {client.address ? (
          <address>
            {client.address.street}<br />
            {client.address.city}, {client.address.state} - {client.address.postalCode}<br />
            {client.address.country}
          </address>
        ) : (
          <p>N/A</p>
        )}

        <h2>Billing Addresses</h2>
        {client.billingAddresses && client.billingAddresses.length > 0 ? (
          <ul>
            {client.billingAddresses.map((addr) => (
              <li key={addr._id}>
                {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
              </li>
            ))}
          </ul>
        ) : (
          <p>No billing addresses available</p>
        )}

        <h2>GST Numbers</h2>
        <p>{client.gstNumbers?.join(", ") || "N/A"}</p>

        <h2>Company Names</h2>
        <p>{client.companyNames?.join(", ") || "N/A"}</p>

        <h2>Account Info</h2>
        <p><strong>Created At:</strong> {new Date(client.createdAt).toLocaleDateString()}</p>
        <p><strong>Last Updated:</strong> {new Date(client.updatedAt).toLocaleDateString()}</p>
      </section>

      <section className="projects-section">
        <h2>Projects</h2>
        {projects.length === 0 ? (
          <p>No projects found for this client.</p>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td>{project.name}</td>
                  <td>{project.description}</td>
                  <td>{project.status}</td>
                  <td>{project.projectType}</td>
                  <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}</td>
                  <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : "-"}</td>
                  <td>{project.totalAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default AllDetail;
