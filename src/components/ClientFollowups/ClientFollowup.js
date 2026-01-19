import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ClientFollowup.css";

const ClientFollowup = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFollowupData();
  }, [projectId]);

  const fetchFollowupData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5151/api/followUp/followUps/${projectId}`
      );
      const result = await res.json();

      if (result.success && result.data.length > 0) {
        setFollowups(result.data[0].followUpHistory || []);
      } else {
        setFollowups([]);
        setError("No follow-up records found for this project.");
      }
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to fetch follow-up data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="followup-wrapper">
      <div className="followup-header">
        <button className="back-button" onClick={() => navigate("/followups")}>
          ← Back
        </button>
        <h2 className="followup-title">Project Follow-up History</h2>
      </div>

      {loading ? (
        <p className="status-text">Loading...</p>
      ) : error ? (
        <p className="status-text error">{error}</p>
      ) : followups.length === 0 ? (
        <p className="status-text">No follow-ups found.</p>
      ) : (
        <div className="followup-table-container">
          <table className="followup-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Notes</th>
                <th>Next Follow-up Date</th>
              </tr>
            </thead>
            <tbody>
              {followups.map((fup) => (
                <tr key={fup._id}>
                  <td>{new Date(fup.date).toLocaleDateString()}</td>
                  <td>{fup.reason || "N/A"}</td>
                  <td>{fup.notes || "N/A"}</td>
                  <td>
                    {fup.nextFollowUpDate
                      ? new Date(fup.nextFollowUpDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientFollowup;
