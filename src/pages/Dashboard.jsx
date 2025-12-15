// Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

/* 🔹 DUMMY DATA (REMOVE LATER) */
const DUMMY_SUMMARY = {
  reported: 3,
  assigned: 2,
  inProgress: 1,
  pending: 2,
  verified: 2
};

const DUMMY_REPORTS = [
  {
    id: "PH-2024-001",
    location: "13.0827, 80.2707",
    severity: "High",
    status: "Reported",
    reportedTime: "Jan 15, 2024 09:30"
  },
  {
    id: "PH-2024-004",
    location: "13.0674, 80.2376",
    severity: "High",
    status: "Pending Verification",
    reportedTime: "Jan 12, 2024 16:20"
  },
  {
    id: "PH-2024-009",
    location: "13.0600, 80.2800",
    severity: "High",
    status: "Pending Verification",
    reportedTime: "Jan 07, 2024 12:00"
  },
  {
    id: "PH-2024-002",
    location: "13.0569, 80.2425",
    severity: "Medium",
    status: "Assigned",
    reportedTime: "Jan 14, 2024 14:15"
  },
  {
    id: "PH-2024-005",
    location: "13.0450, 80.2494",
    severity: "Medium",
    status: "Reported",
    reportedTime: "Jan 11, 2024 08:00"
  }
];

function Dashboard() {
  const [summary, setSummary] = useState({
    reported: 0,
    assigned: 0,
    inProgress: 0,
    pending: 0,
    verified: 0
  });
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All Severity");
  const [statusFilter, setStatusFilter] = useState("All Status");

  useEffect(() => {
    // ✅ USING DUMMY DATA NOW
    setSummary(DUMMY_SUMMARY);
    setReports(DUMMY_REPORTS);
  }, []);

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      const matchQuery =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.severity.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q);
      const matchSeverity =
        severityFilter === "All Severity" || r.severity === severityFilter;
      const matchStatus =
        statusFilter === "All Status" || r.status === statusFilter;
      return matchQuery && matchSeverity && matchStatus;
    });
  }, [reports, query, severityFilter, statusFilter]);

  const severityClass = sev => {
    if (sev === "High") return "pill-danger";
    if (sev === "Medium") return "pill-warning";
    if (sev === "Low") return "pill-success";
    return "";
  };

  const statusClass = status => {
    if (status === "Reported") return "status-chip";
    if (status === "Assigned") return "status-chip status-assigned";
    if (status === "Pending Verification")
      return "status-chip status-pending";
    if (status === "Verified") return "status-chip status-verified";
    return "status-chip";
  };

  return (
    <>
      <section className="dashboard-card">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Live overview</p>
            <h1>Dashboard</h1>
            <p className="muted">
              Monitor and manage pothole reports. Assign contractors to
              reported issues.
            </p>
          </div>
          <span className="pill success">Online</span>
        </div>

        {/* Top summary cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <p className="summary-label">Reported</p>
            <h2>{summary.reported}</h2>
          </div>
          <div className="summary-card">
            <p className="summary-label">Assigned</p>
            <h2>{summary.assigned}</h2>
          </div>
          <div className="summary-card">
            <p className="summary-label">In Progress</p>
            <h2>{summary.inProgress}</h2>
          </div>
          <div className="summary-card">
            <p className="summary-label">Pending</p>
            <h2>{summary.pending}</h2>
          </div>
          <div className="summary-card">
            <p className="summary-label">Verified</p>
            <h2>{summary.verified}</h2>
          </div>
        </div>

        {/* Active reports table */}
        <div className="panel">
          <div className="table-header-row">
            <h3>Active Pothole Reports</h3>
            <div className="table-filters">
              <input
                type="text"
                placeholder="Search by ID, location, severity, status..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                <option>All Severity</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>All Status</option>
                <option>Reported</option>
                <option>Assigned</option>
                <option>Pending Verification</option>
                <option>Verified</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Pothole ID</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Reported Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>{report.location}</td>
                    <td>
                      <span className={severityClass(report.severity)}>
                        {report.severity}
                      </span>
                    </td>
                    <td>{report.reportedTime}</td>
                    <td>
                      <span className={statusClass(report.status)}>
                        {report.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="btn-outline">View</button>
                      <button className="btn-primary">Assign</button>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "18px", color: "#6b7280" }}>
                      No reports match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

export default Dashboard;
