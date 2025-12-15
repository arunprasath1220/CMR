import React, { useEffect, useMemo, useState } from "react";
import "./Graph.css";

const DUMMY_POINTS = [
  { id: 1, x: 10, y: 20, severity: "critical", status: "open", ward: "North", date: "2025-12-10" },
  { id: 2, x: 35, y: 70, severity: "critical", status: "open", ward: "South", date: "2025-12-12" },
  { id: 3, x: 20, y: 85, severity: "medium",   status: "in-progress", ward: "East",  date: "2025-12-09" },
  { id: 4, x: 55, y: 40, severity: "medium",   status: "in-progress", ward: "West",  date: "2025-12-15" },
  { id: 5, x: 70, y: 60, severity: "fixed",    status: "resolved",    ward: "Central", date: "2025-12-08" },
  { id: 6, x: 85, y: 25, severity: "critical", status: "open",        ward: "Central", date: "2025-12-14" },
];

function Graph() {
  const [points, setPoints] = useState([]);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [ward, setWard] = useState("all");
  const [date, setDate] = useState("");

  useEffect(() => {
    setPoints(DUMMY_POINTS);
  }, []);

  const width = 900;
  const height = 420;
  const gridSize = 60;

  const getColor = (severity) => {
    if (severity === "critical") return "#f04438";
    if (severity === "medium") return "#f79009";
    if (severity === "fixed") return "#12b981";
    return "#64748b";
  };

  const filteredPoints = useMemo(() => {
    const q = query.trim().toLowerCase();
    return points.filter((p) => {
      const matchesSeverity = severity === "all" || p.severity === severity;
      const matchesStatus = status === "all" || p.status === status;
      const matchesWard = ward === "all" || p.ward === ward;
      const matchesDate = !date || p.date === date; // ISO yyyy-mm-dd
      const matchesQuery =
        !q ||
        String(p.id).includes(q) ||
        p.severity.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.ward.toLowerCase().includes(q);
      return matchesSeverity && matchesStatus && matchesWard && matchesDate && matchesQuery;
    });
  }, [points, query, severity, status, ward, date]);

  return (
    <section className="graph-container">
        <div className="graph-card">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Trends</p>
              <h1>Graph</h1>
              <p className="muted">
                Visualize detection density, severity distribution, and response
                velocity over time.
              </p>
            </div>
            <span className="pill">Last 30 days</span>
          </div>

          <div className="graph-panel">
            <div className="graph-toolbar">
              <input
                className="search-input"
                placeholder="Search by id, severity, status, ward..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="filters-row">
                <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="medium">Medium</option>
                  <option value="fixed">Fixed</option>
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select value={ward} onChange={(e) => setWard(e.target.value)}>
                  <option value="all">All Wards</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="Central">Central</option>
                </select>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="graph-canvas">
              <svg className="graph-svg" viewBox={`0 0 ${width} ${height}`}>
                <g stroke="#e5e7eb" strokeWidth="1">
                  {Array.from({ length: Math.floor(width / gridSize) + 1 }).map((_, i) => (
                    <line key={`v-${i}`} x1={i * gridSize} y1={0} x2={i * gridSize} y2={height} />
                  ))}
                  {Array.from({ length: Math.floor(height / gridSize) + 1 }).map((_, i) => (
                    <line key={`h-${i}`} x1={0} y1={i * gridSize} x2={width} y2={i * gridSize} />
                  ))}
                </g>

                {filteredPoints.map((p) => (
                  <circle key={p.id} cx={(p.x / 100) * width} cy={(p.y / 100) * height} r={14} fill={getColor(p.severity)} />
                ))}
              </svg>

              <div className="zoom-controls">
                <button>+</button>
                <button>-</button>
              </div>

              <div className="legend-card">
                <p className="legend-title">Legend</p>
                <div className="legend-item">
                  <span className="dot dot-critical" />
                  <span>Critical</span>
                </div>
                <div className="legend-item">
                  <span className="dot dot-medium" />
                  <span>Medium</span>
                </div>
                <div className="legend-item">
                  <span className="dot dot-fixed" />
                  <span>Fixed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
}

export default Graph;
