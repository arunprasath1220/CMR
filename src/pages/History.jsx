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
  const [loadingRoads, setLoadingRoads] = useState(false);

  // helper: parse "lat, lon" string
  const parseLatLon = (locationStr) => {
    if (!locationStr) return null;
    const [latStr, lonStr] = locationStr.split(",").map((s) => s.trim());
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  };

  // reverse geocode to road name (OpenStreetMap Nominatim)
  const fetchRoadName = async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=16`;
    const res = await fetch(url, {
      headers: { "User-Agent": "PotholeDashboard/1.0 (contact@example.com)" }
    });
    if (!res.ok) throw new Error("Reverse geocoding failed");
    const data = await res.json();
    return (
      data?.address?.road ||
      data?.address?.pedestrian ||
      data?.address?.footway ||
      data?.address?.neighbourhood ||
      data?.display_name ||
      "Unknown road"
    );
  };

  useEffect(() => {
    // ✅ Merge built-in dummy with any verified from Dashboard stored in localStorage
    try {
      const extra = JSON.parse(localStorage.getItem("verified_repairs") || "[]");
      setRepairs([...(Array.isArray(extra) ? extra : []), ...DUMMY_REPAIRS]);
    } catch (_) {
      setRepairs(DUMMY_REPAIRS);
    }
  }, []);

  // Listen for runtime updates to verified repairs (dispatched from Dashboard)
  useEffect(() => {
    const handler = () => {
      try {
        const extra = JSON.parse(localStorage.getItem("verified_repairs") || "[]");
        setRepairs([...(Array.isArray(extra) ? extra : []), ...DUMMY_REPAIRS]);
      } catch (_) {
        setRepairs(DUMMY_REPAIRS);
      }
    };
    window.addEventListener("verifiedRepairsChanged", handler);
    // also handle cross-tab storage events
    const storageHandler = (ev) => {
      if (ev.key === "verified_repairs") handler();
    };
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("verifiedRepairsChanged", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  // Resolve missing road names from location (only for entries without roadName)
  useEffect(() => {
    const resolveRoads = async () => {
      const need = repairs.some((r) => !r.roadName && r.location);
      if (!need) return;
      setLoadingRoads(true);
      try {
        const updated = [];
        for (const r of repairs) {
          if (r.roadName || !r.location) {
            updated.push(r);
            continue;
          }
          const coords = parseLatLon(r.location);
          if (!coords) {
            updated.push({ ...r, roadName: "Unknown road" });
            continue;
          }
          try {
            const name = await fetchRoadName(coords.lat, coords.lon);
            // small delay to be polite to the API
            await new Promise((res) => setTimeout(res, 300));
            updated.push({ ...r, roadName: name });
          } catch {
            updated.push({ ...r, roadName: "Unknown road" });
          }
        }
        setRepairs(updated);
      } finally {
        setLoadingRoads(false);
      }
    };
    if (repairs.length) resolveRoads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repairs.length]);

  // Build cumulative (grouped-by-road) view
  const groupedRepairs = useMemo(() => {
    const groups = {};
    for (const r of repairs) {
      const road = (r.roadName || "Unknown road").trim();
      if (!groups[road]) {
        groups[road] = {
          roadName: road,
          potholes: 0,
          patches: 0,
          lastFixedDate: null,
          contractors: new Set(),
          ids: [],
          locations: [],
          severities: [],
        };
      }
      const isPothole = (r.id || "").startsWith("PH-");
      const isPatch = (r.id || "").startsWith("PA-");
      if (isPothole) groups[road].potholes += 1;
      if (isPatch) groups[road].patches += 1;
      // Track latest fixed date
      const d = r.fixedDate ? new Date(r.fixedDate) : null;
      if (d && (!groups[road].lastFixedDate || d > groups[road].lastFixedDate)) {
        groups[road].lastFixedDate = d;
      }
      if (r.contractor) groups[road].contractors.add(r.contractor);
      if (r.id) groups[road].ids.push(r.id);
      if (r.location) groups[road].locations.push(r.location);
      if (r.severity) groups[road].severities.push(r.severity);
    }
    const severityRank = (s) => (s === "High" ? 3 : s === "Medium" ? 2 : s === "Low" ? 1 : 0);
    // Convert to array
    const rows = Object.values(groups).map((g) => ({
      roadName: g.roadName,
      potholes: g.potholes,
      patches: g.patches,
      lastFixedDate: g.lastFixedDate
        ? g.lastFixedDate.toLocaleString(undefined, {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--",
      contractors: Array.from(g.contractors),
      ids: g.ids,
      locations: g.locations,
      severity: g.severities.reduce((best, s) => (severityRank(s) > severityRank(best) ? s : best), "N/A"),
      status: "Verified",
    }));
    return rows.sort((a, b) => a.roadName.localeCompare(b.roadName));
  }, [repairs]);

  const filteredGrouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groupedRepairs.filter((g) => {
      const contractors = g.contractors.join(", ").toLowerCase();
      return (
        !q ||
        g.roadName.toLowerCase().includes(q) ||
        contractors.includes(q)
      );
    });
  }, [groupedRepairs, query]);

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
                <th>Road Name</th>
                <th>Verified Potholes</th>
                <th>Verified Patches</th>
                <th>IDs</th>
                <th>Locations</th>
                <th>Severity</th>
                <th>Last Fixed</th>
                <th>Contractors</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrouped.map((row) => (
                <tr key={row.roadName}>
                  <td className="road-name">{row.roadName}</td>
                  <td>{row.potholes}</td>
                  <td>{row.patches}</td>
                  <td>{row.ids.slice(0, 3).join(", ")}{row.ids.length > 3 ? ` (+${row.ids.length - 3})` : ""}</td>
                  <td>{row.locations.slice(0, 2).join(" | ")}{row.locations.length > 2 ? ` (+${row.locations.length - 2})` : ""}</td>
                  <td>
                    <span className={severityClass(row.severity)}>{row.severity}</span>
                  </td>
                  <td>{row.lastFixedDate}</td>
                  <td>{row.contractors.length ? row.contractors.join(", ") : "--"}</td>
                  <td>
                    <span className="status-verified">{row.status}</span>
                  </td>
                </tr>
              ))}
              {filteredGrouped.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "#6b7280" }}>
                    No verified roads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="history-footer">
          <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />
          <span>{filteredGrouped.length} verified roads</span>
        </div>
      </div>
    </section>
  );
}

export default History;
