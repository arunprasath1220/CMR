// Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

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
    severity_count: 0,
    status: "Reported",
    reportedTime: "Jan 15, 2024 09:30"
  },
  {
    id: "PH-2024-004",
    location: "13.0674, 80.2376",
    severity_count: 34,
    status: "Pending Verification",
    contractorId: "c3",
    reportedTime: "Jan 12, 2024 16:20"
  },
  {
    id: "PH-2024-009",
    location: "13.0600, 80.2800",
    severity_count: 31,
    status: "Pending Verification",
    contractorId: "c2",
    reportedTime: "Jan 07, 2024 12:00"
  },
  {
    id: "PH-2024-002",
    location: "13.0569, 80.2425",
    severity_count: 18,
    status: "Assigned",
    reportedTime: "Jan 14, 2024 14:15"
  },
  {
    id: "PH-2024-005",
    location: "13.0450, 80.2494",
    severity_count: 12,
    status: "Reported",
    reportedTime: "Jan 11, 2024 08:00"
  }
];

// 🔹 DUMMY CONTRACTORS
const DUMMY_CONTRACTORS = [
  { id: "c1", name: "Rajesh Kumar", company: "Metro Road Works Pvt Ltd" },
  { id: "c2", name: "Suresh Babu", company: "Highway Repairs Co" },
  { id: "c3", name: "Venkat Rao", company: "City Infrastructure Ltd" },
  { id: "c4", name: "Mohan Das", company: "Urban Road Solutions" },
  { id: "c5", name: "Karthik Reddy", company: "Express Roadways" }
];

// 🔹 DUMMY VERIFICATION DATA (proofs)
const DUMMY_VERIFICATION = {
  "PH-2024-004": {
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
    completedAt: "Jan 14, 2024 10:00"
  },
  "PH-2024-009": {
    imageUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop",
    completedAt: "Jan 08, 2024 17:45"
  }
};

// Thresholds to classify severity from count
const SEVERITY_LIMITS = {
  High: 30, // >= 30 → High
  Medium: 10 // >= 10 and < 30 → Medium; else Low
};

const severityLabelFromCount = (count) => {
  const n = Number.isFinite(count) ? count : Number(count);
  const c = Number.isFinite(n) ? Math.max(0, n) : 0;
  if (c >= SEVERITY_LIMITS.High) return "High";
  if (c >= SEVERITY_LIMITS.Medium) return "Medium";
  return "Low";
};

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
  const [activeReportId, setActiveReportId] = useState(null);
  const [modalMode, setModalMode] = useState("assign"); // 'assign' | 'view' | 'verify'
  const [selectedContractorId, setSelectedContractorId] = useState("");

  useEffect(() => {
    // ✅ Sync with dummy data; re-run on HMR when these change
    setSummary(DUMMY_SUMMARY);
    setReports(DUMMY_REPORTS);
  }, [DUMMY_SUMMARY, DUMMY_REPORTS]);

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      const sevLabel = severityLabelFromCount(r.severity_count);
      const matchQuery =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        sevLabel.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q);
      const matchSeverity =
        severityFilter === "All Severity" || sevLabel === severityFilter;
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

  const openAssignModal = (report) => {
    setActiveReportId(report.id);
    setModalMode("assign");
    setSelectedContractorId(report.contractorId || "");
  };

  const openViewModal = (report) => {
    setActiveReportId(report.id);
    setModalMode("view");
    setSelectedContractorId(report.contractorId || "");
  };

  const openVerifyModal = (report) => {
    setActiveReportId(report.id);
    setModalMode("verify");
    setSelectedContractorId(report.contractorId || "");
  };

  const closeModal = () => {
    setActiveReportId(null);
    setSelectedContractorId("");
  };

  const doAssign = () => {
    if (!activeReportId || !selectedContractorId) return;
    const contractor = DUMMY_CONTRACTORS.find(c => c.id === selectedContractorId);
    setReports(prev => prev.map(r => r.id === activeReportId ? {
      ...r,
      contractorId: selectedContractorId,
      contractorName: contractor?.name,
      contractorCompany: contractor?.company,
      status: "Assigned"
    } : r));
    closeModal();
  };

  const getReportById = (id) => reports.find(r => r.id === id);

  const pushToHistory = (report) => {
    const sev = severityLabelFromCount(report.severity_count);
    const contractor = DUMMY_CONTRACTORS.find(c => c.id === (report.contractorId || selectedContractorId));
    const proof = DUMMY_VERIFICATION[report.id];
    const entry = {
      id: report.id,
      location: report.location,
      severity: sev,
      contractor: contractor ? `${contractor.name} - ${contractor.company}` : "",
      fixedDate: proof?.completedAt || new Date().toLocaleString(undefined, { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: "Verified"
    };
    try {
      const existing = JSON.parse(localStorage.getItem("verified_repairs") || "[]");
      localStorage.setItem("verified_repairs", JSON.stringify([entry, ...existing]));
    } catch (_) {
      // ignore
    }
  };

  const doVerify = () => {
    const r = getReportById(activeReportId);
    if (!r) return closeModal();
    // Remove from dashboard list
    setReports(prev => prev.filter(x => x.id !== r.id));
    // Push a record to history storage
    pushToHistory(r);
    closeModal();
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
            <div>
              <p className="summary-label">Reported</p>
              <h2>{summary.reported}</h2>
            </div>
            <div className="summary-icon">
              <ReportProblemOutlinedIcon sx={{ fontSize: 32, color: "#24478f" }} />
            </div>
          </div>
          <div className="summary-card">
            <div>
              <p className="summary-label">Assigned</p>
              <h2>{summary.assigned}</h2>
            </div>
            <div className="summary-icon">
              <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 32, color: "#24478f" }} />
            </div>
          </div>
          <div className="summary-card">
            <div>
              <p className="summary-label">In Progress</p>
              <h2>{summary.inProgress}</h2>
            </div>
            <div className="summary-icon">
              <BuildOutlinedIcon sx={{ fontSize: 32, color: "#f59e0b" }} />
            </div>
          </div>
          <div className="summary-card">
            <div>
              <p className="summary-label">Pending</p>
              <h2>{summary.pending}</h2>
            </div>
            <div className="summary-icon">
              <PendingActionsOutlinedIcon sx={{ fontSize: 32, color: "#f59e0b" }} />
            </div>
          </div>
          <div className="summary-card">
            <div>
              <p className="summary-label">Verified</p>
              <h2>{summary.verified}</h2>
            </div>
            <div className="summary-icon">
              <CheckCircleOutlineIcon sx={{ fontSize: 32, color: "#16a34a" }} />
            </div>
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
                      <span className={severityClass(severityLabelFromCount(report.severity_count))}>
                        {severityLabelFromCount(report.severity_count)}
                      </span>
                    </td>
                    <td>{report.reportedTime}</td>
                    <td>
                      <span className={statusClass(report.status)}>
                        {report.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      {report.status === "Pending Verification" ? (
                        <button className="btn-success" onClick={() => openVerifyModal(report)}>Verify</button>
                      ) : report.contractorId ? (
                        <button className="btn-outline" onClick={() => openViewModal(report)}>View</button>
                      ) : (
                        <button className="btn-primary" onClick={() => openAssignModal(report)}>Assign</button>
                      )}
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

      {/* Assignment / View Modal */}
      {activeReportId && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const r = getReportById(activeReportId);
              const sevLabel = severityLabelFromCount(r?.severity_count);
              const contractor = r?.contractorId ? DUMMY_CONTRACTORS.find(c => c.id === r.contractorId) : null;
              return (
                <>
                  {modalMode === "verify" ? (
                    <div className="modal-header">
                      <div>
                        <h3 className="modal-title">View Proof - <span className="muted">{r?.id}</span></h3>
                      </div>
                      <button className="btn-outline" onClick={closeModal}>✕</button>
                    </div>
                  ) : (
                    <div className="modal-header">
                      <div>
                        <h3 className="modal-title">Pothole Details <span className="muted">{r?.id}</span></h3>
                        <p className="muted">{modalMode === "assign" ? "Review pothole details and assign a contractor for repair." : "View pothole details and current assignment status."}</p>
                      </div>
                      <button className="btn-outline" onClick={closeModal}>✕</button>
                    </div>
                  )}
                  <div className="modal-chips">
                    <span className={severityClass(sevLabel)}>{sevLabel}</span>
                    <span className={statusClass(r?.status)}>{r?.status}</span>
                  </div>
                  {modalMode === "verify" ? (
                    <>
                      <div className="modal-section">
                        <img className="proof-img" src={DUMMY_VERIFICATION[r?.id]?.imageUrl} alt="Proof" />
                      </div>
                      <div className="modal-grid">
                        <div>
                          <label className="field-label">Pothole ID</label>
                          <div className="field-box">{r?.id}</div>
                        </div>
                        <div>
                          <label className="field-label">Status</label>
                          <div><span className={statusClass(r?.status)}>{r?.status}</span></div>
                        </div>
                        <div>
                          <label className="field-label">Severity</label>
                          <div><span className={severityClass(sevLabel)}>{sevLabel}</span></div>
                        </div>
                        <div>
                          <label className="field-label">Location</label>
                          <div className="field-box">{r?.location}</div>
                        </div>
                      </div>
                      <div className="modal-section">
                        <label className="field-label">Assigned Contractor</label>
                        <div className="field-box">
                          {contractor ? `${contractor.name} - ${contractor.company}` : "Not available"}
                        </div>
                      </div>
                      <div className="modal-section">
                        <label className="field-label">Completed</label>
                        <div className="field-box">{DUMMY_VERIFICATION[r?.id]?.completedAt || "--"}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="modal-section">
                        <label className="field-label">GPS Location</label>
                        <div className="field-box">{r?.location}</div>
                      </div>
                      <div className="modal-section">
                        <label className="field-label">Reported Time</label>
                        <div className="field-box">{r?.reportedTime}</div>
                      </div>
                      {modalMode === "view" && r?.contractorId && (
                        <div className="modal-section">
                          <label className="field-label">Assigned Contractor</label>
                          <div className="field-box">
                            {contractor?.name} - {contractor?.company}
                          </div>
                        </div>
                      )}
                      {modalMode === "assign" && (
                        <div className="modal-section">
                          <label className="field-label">Select Contractor</label>
                          <select
                            className="select"
                            value={selectedContractorId}
                            onChange={(e) => setSelectedContractorId(e.target.value)}
                          >
                            <option value="">Choose a contractor...</option>
                            {DUMMY_CONTRACTORS.map(c => (
                              <option key={c.id} value={c.id}>{c.name} - {c.company}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  <div className="modal-footer">
                    {modalMode === "assign" ? (
                      <>
                        <button className="btn-outline" onClick={closeModal}>Cancel</button>
                        <button className="btn-success" disabled={!selectedContractorId} onClick={doAssign}>Assign</button>
                      </>
                    ) : modalMode === "view" ? (
                      <>
                        <button className="btn-outline" onClick={() => { setSelectedContractorId(r?.contractorId || ""); setModalMode("assign"); }}>Edit</button>
                        <button className="btn-primary" onClick={closeModal}>Close</button>
                      </>
                    ) : (
                      <>
                        <button className="btn-outline" onClick={closeModal}>Close</button>
                        <button className="btn-success" onClick={doVerify}>Verify & Close</button>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
