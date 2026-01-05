// Graph.jsx
import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Graph.css";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* 🔹 DUMMY DATA with real latitude/longitude coordinates (fallback) */
// const DUMMY_POINTS = [
//   { id: 1, lat: 8.4207098, lng: 78.0309535, severity: "critical", status: "open", ward: "North", date: "2025-12-10" },
//   { id: 2, lat: 13.0500, lng: 80.2500, severity: "critical", status: "open", ward: "South", date: "2025-12-12" },
//   { id: 3, lat: 13.0900, lng: 80.2900, severity: "medium",   status: "in-progress", ward: "East",  date: "2025-12-09" },
//   { id: 4, lat: 13.0650, lng: 80.2200, severity: "medium",   status: "in-progress", ward: "West",  date: "2025-12-15" },
//   { id: 5, lat: 13.0700, lng: 80.2600, severity: "fixed",    status: "resolved",    ward: "Central", date: "2025-12-08" },
//   { id: 6, lat: 13.0950, lng: 80.2450, severity: "critical", status: "open",        ward: "Central", date: "2025-12-14" },
// ];

// Helper to map backend data to frontend format
const mapBackendToFrontend = (location) => {
  const severityMap = { 'High': 'critical', 'Medium': 'medium', 'Low': 'fixed' };
  const statusMap = { 'pending': 'open', 'assigned': 'in-progress', 'in_progress': 'in-progress', 'verified': 'resolved', 'fixed': 'resolved' };
  
  return {
    id: location.id,
    lat: parseFloat(location.latitude || location.lat),
    lng: parseFloat(location.longitude || location.lng),
    severity: severityMap[location.highest_severity] || location.severity || 'medium',
    status: statusMap[location.status] || location.status || 'open',
    ward: location.ward || 'Unknown',
    date: location.last_reported_at ? new Date(location.last_reported_at).toISOString().split('T')[0] : location.date
  };
};

function Graph() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch points from API
  const fetchPoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/reports/aggregated/locations`);
      if (!response.ok) throw new Error('Failed to fetch locations');
      
      const data = await response.json();
      if (data.locations && data.locations.length > 0) {
        const mappedPoints = data.locations.map(mapBackendToFrontend);
        setPoints(mappedPoints);
        // Also save to localStorage for offline viewing
        localStorage.setItem("graph_points", JSON.stringify(mappedPoints));
      } else {
        // Use localStorage or dummy data as fallback
        const saved = JSON.parse(localStorage.getItem("graph_points") || "null");
        setPoints(Array.isArray(saved) && saved.length ? saved : DUMMY_POINTS);
      }
    } catch (err) {
      console.error('Failed to fetch map data:', err);
      setError(err.message);
      // Fallback to localStorage or dummy data
      try {
        const saved = JSON.parse(localStorage.getItem("graph_points") || "null");
        setPoints(Array.isArray(saved) && saved.length ? saved : DUMMY_POINTS);
      } catch (_) {
        setPoints(DUMMY_POINTS);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchPoints();
  }, []);

  const refreshPoints = () => {
    fetchPoints();
  };

  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [ward, setWard] = useState("all");
  const [date, setDate] = useState("");

  const getColor = (severity) => {
    if (severity === "critical") return "#f04438";
    if (severity === "medium") return "#f79009";
    if (severity === "fixed") return "#12b981";
    return "#64748b";
  };

  // Default center (Chennai)
  const mapCenter = [13.0827, 80.2707];
  const mapZoom = 12;

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
            <span className={`pill ${error ? 'error' : loading ? 'loading' : 'success'}`}>
              {error ? 'Offline Mode' : loading ? 'Loading...' : `${points.length} Points`}
            </span>
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
                <button className="btn-outline" onClick={refreshPoints}>Refresh</button>
              </div>
            </div>

            <div className="graph-canvas">
              <MapContainer 
                key={points.length} // force refresh when points array size changes
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: "100%", width: "100%", minHeight: "600px" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {filteredPoints.map((p) => (
                  <CircleMarker
                    key={p.id}
                    center={[p.lat, p.lng]}
                    radius={10}
                    fillColor={getColor(p.severity)}
                    fillOpacity={0.8}
                    color="#fff"
                    weight={2}
                  >
                    <Popup>
                      <div>
                        <strong>ID: {p.id}</strong><br />
                        <strong>Severity:</strong> {p.severity}<br />
                        <strong>Status:</strong> {p.status}<br />
                        <strong>Ward:</strong> {p.ward}<br />
                        <strong>Date:</strong> {p.date}<br />
                        <strong>Location:</strong> {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>

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
