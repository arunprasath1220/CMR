// History.jsx
import React, { useEffect, useState, useMemo } from "react";
import "./History.css";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/* 🔹 DUMMY DATA (REMOVE LATER) */
const DUMMY_REPAIRS = [
  {
    id: "PH-2024-006",
    location: "13.0900, 80.2560",
    severity: "High",
    contractor: "Mohan Das - Urban Road Solutions",
    fixedDate: "Jan 13, 2024 15:30",
    status: "Verified"
  },
  {
    id: "PH-2024-008",
    location: "13.0350, 80.2650",
    severity: "Medium",
    contractor: "Rajesh Kumar - Metro Road Works Pvt Ltd",
    fixedDate: "Jan 11, 2024 09:00",
    status: "Verified"
  }
];

function History() {
  const [repairs, setRepairs] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    // ✅ Merge built-in dummy with any verified from Dashboard stored in localStorage
    try {
      const extra = JSON.parse(localStorage.getItem("verified_repairs") || "[]");
      setRepairs([...(Array.isArray(extra) ? extra : []), ...DUMMY_REPAIRS]);
    } catch (_) {
      setRepairs(DUMMY_REPAIRS);
    }
  }, []);

  const filteredRepairs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return repairs.filter((r) => {
      return (
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.contractor.toLowerCase().includes(q) ||
        r.severity.toLowerCase().includes(q)
      );
    });
  }, [repairs, query]);

  const severityClass = (sev) => {
    if (sev === "High") return "pill-danger";
    if (sev === "Medium") return "pill-warning";
    if (sev === "Low") return "pill-success";
    return "";
  };

  return (
    <section className="history-container">
      <div className="history-card">
        <div className="page-heading">
          <div>
            <h1>Verified Repairs</h1>
            <p className="muted">
              Only admin-verified repairs are archived here.
            </p>
          </div>
          <span className="pill success">Verified & Closed</span>
        </div>

        <div className="history-search">
          <input
            type="text"
            placeholder="Search by ID, contractor, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Pothole ID</th>
                <th>Location</th>
                <th>Severity</th>
                <th>Contractor</th>
                <th>Fixed Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepairs.map((repair) => (
                <tr key={repair.id}>
                  <td className="pothole-id">{repair.id}</td>
                  <td className="location">{repair.location}</td>
                  <td>
                    <span className={severityClass(repair.severity)}>
                      {repair.severity}
                    </span>
                  </td>
                  <td>{repair.contractor}</td>
                  <td>{repair.fixedDate}</td>
                  <td>
                    <span className="status-verified">{repair.status}</span>
                  </td>
                </tr>
              ))}
              {filteredRepairs.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "#6b7280" }}>
                    No verified repairs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="history-footer">
          <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />
          <span>{filteredRepairs.length} verified repairs</span>
        </div>
      </div>
    </section>
  );
}

export default History;
