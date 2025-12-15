// Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";

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

/* Temporary inline styles to make it look like an admin dashboard.
   Move these rules into your global CSS file if you want. */
const styles = `
.dashboard-card {
  background: #f5f7fb;
  border-radius: 0;
  padding: 20px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow-y: auto;
  width: 100%;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 0 28px;
}

.page-heading h1 {
  margin: 0 0 6px 0;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.eyebrow {
  font-size: 12px;
  text-transform: none;
  letter-spacing: 0;
  color: #64748b;
}

.muted {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.pill.success {
  border-color: #86efac;
  color: #166534;
  background: #dcfce7;
}

/* Summary cards */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 28px;
  padding: 0 28px;
}

.summary-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: none;
  border-left: 4px solid transparent;
  transition: box-shadow 0.2s ease;
}

.summary-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-card:nth-child(1),
.summary-card:nth-child(2) {
  border-left-color: #2563eb;
}

.summary-card:nth-child(3),
.summary-card:nth-child(4) {
  border-left-color: #f59e0b;
}

.summary-card:nth-child(5) {
  border-left-color: #16a34a;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.summary-card h2 {
  margin: 0;
  font-size: 24px;
}

/* Panel + table */
.panel {
  background: #ffffff;
  border-radius: 8px;
  padding: 18px 18px 10px;
  margin: 0 28px 28px 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: none;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.table-header-row h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.table-filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-filters input,
.table-filters select {
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 7px 12px;
  font-size: 12px;
  background: #f9fafb;
}

.table-wrapper {
  overflow-x: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  flex: 1;
}

.reports-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.reports-table th,
.reports-table td {
  padding: 12px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.reports-table th {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.reports-table tbody tr:hover {
  background: #fafbfc;
}

/* Severity pills */
.pill-danger,
.pill-warning,
.pill-success {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  color: #ffffff;
}

.pill-danger {
  background: #ef4444;
}

.pill-warning {
  background: #f97316;
}

.pill-success {
  background: #22c55e;
}

/* Status chips */
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #374151;
}

.status-pending {
  background: #fef3c7;
  border-color: #facc15;
}

.status-assigned {
  background: #dbeafe;
  border-color: #3b82f6;
}

.status-verified {
  background: #dcfce7;
  border-color: #22c55e;
}

/* Action buttons */
.action-cell {
  display: flex;
  gap: 8px;
}

.btn-primary,
.btn-success,
.btn-outline {
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-success {
  background: #16a34a;
  color: white;
  border: none;
}

.btn-success:hover {
  background: #15803d;
}

.btn-outline {
  background: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
}

/* Responsive tweaks */
@media (max-width: 1024px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .table-filters {
    width: 100%;
    flex-wrap: wrap;
  }

  .table-filters input,
  .table-filters select {
    flex: 1 1 45%;
  }
}
`;

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
      {/* Inject local styles – move to CSS file in real app */}
      <style>{styles}</style>

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
