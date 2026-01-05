// Dashboard.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./Dashboard.css";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Thresholds to classify severity from count
const SEVERITY_LIMITS = {
  High: 30,
  Medium: 10
};

const severityLabelFromCount = (count) => {
  const n = Number.isFinite(count) ? count : Number(count);
  const c = Number.isFinite(n) ? Math.max(0, n) : 0;
  if (c >= SEVERITY_LIMITS.High) return "High";
  if (c >= SEVERITY_LIMITS.Medium) return "Medium";
  return "Low";
};

// SLA (in days) from avg reported date to deadline
// High severity => shortest deadline
const DEADLINE_DAYS_BY_SEVERITY = {
  High: 3,
  Medium: 5,
  Low: 7,
};

// 🔹 Helper: parse "lat, lon" string
const parseLatLon = (locationStr) => {
  if (!locationStr) return null;
  const [latStr, lonStr] = locationStr.split(",").map((s) => s.trim());
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
};

// 🔹 Nominatim reverse‑geocoding (road name)
const districtFromNominatim = (data) => {
  const a = data?.address || {};
  return (
    a.state_district ||
    a.county ||
    a.city_district ||
    a.district ||
    a.region ||
    a.state ||
    "Unknown"
  );
};

// Fetch road + district in one reverse-geocode call.
const fetchRoadDetails = async (lat, lon) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=16&addressdetails=1`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "PotholeDashboard/1.0 (your-email@example.com)"
    }
  });
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const data = await res.json();
  const roadName =
    data?.address?.road ||
    data?.address?.pedestrian ||
    data?.address?.footway ||
    data?.address?.neighbourhood ||
    data?.display_name ||
    "Unknown road";
  const district = districtFromNominatim(data);
  return { roadName, district };
};

// 🔹 Helper: parse reported time string → Date
const parseReportedDate = (str) => {
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  return null;
};

// Parse backend DATE/TIMESTAMP values safely.
// - DATE often arrives as "YYYY-MM-DD"; parse as a local date at midnight.
// - TIMESTAMP/ISO strings are parsed normally.
const parseBackendDate = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const s = String(value).trim();
  if (!s) return null;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

// 🔹 Helper: format Date nicely
const formatDate = (date) => {
  if (!date) return "--";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const isWeekend = (date) => {
  if (!date) return false;
  const day = date.getDay();
  return day === 0 || day === 6; // Sun=0, Sat=6
};

// Adds business days (Mon-Fri) to a date, preserving the time-of-day.
const addBusinessDays = (startDate, businessDays) => {
  if (!startDate) return null;
  const ms = Number(startDate?.getTime?.());
  if (!Number.isFinite(ms)) return null;

  const daysToAdd = Number(businessDays);
  if (!Number.isFinite(daysToAdd) || daysToAdd <= 0) return new Date(ms);

  const result = new Date(ms);
  let added = 0;
  while (added < daysToAdd) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result)) added += 1;
  }
  return result;
};

// 🔹 Helper: compute deadline date from assignment date + severity SLA
const computeDeadlineFromAssignmentDate = (assignedDate, severity) => {
  if (!assignedDate) return null;
  const days =
    DEADLINE_DAYS_BY_SEVERITY[severity] ?? DEADLINE_DAYS_BY_SEVERITY.Low;
  return addBusinessDays(assignedDate, days);
};

const DEADLINE_CACHE_KEY = "road_deadlines_v1";

const readDeadlineCache = () => {
  try {
    const raw = localStorage.getItem(DEADLINE_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeDeadlineCache = (cache) => {
  try {
    localStorage.setItem(DEADLINE_CACHE_KEY, JSON.stringify(cache || {}));
  } catch {
    // ignore
  }
};

const deadlineLocationKey = (location) => {
  const s = (location || "").trim();
  if (!s) return null;
  // Normalize spacing/case so the same lat/lon matches across refreshes.
  return `loc:${s.toLowerCase().replace(/\s+/g, "")}`;
};

const deadlineDbKey = (dbId) => {
  const n = Number(dbId);
  if (!Number.isFinite(n)) return null;
  return `db:${Math.trunc(n)}`;
};

const deadlineGridKey = (gridId) => {
  const s = (gridId || "").trim();
  if (!s) return null;
  return `grid:${s}`;
};

const deadlineKeysForItem = (itemOrLocation) => {
  // Accept either a string location or an object { location, dbId, gridId }
  if (!itemOrLocation) return [];
  if (typeof itemOrLocation === "string") {
    const lk = deadlineLocationKey(itemOrLocation);
    return lk ? [lk] : [];
  }
  if (typeof itemOrLocation === "object") {
    const keys = [
      deadlineGridKey(itemOrLocation.gridId),
      deadlineDbKey(itemOrLocation.dbId),
      deadlineLocationKey(itemOrLocation.location),
    ].filter(Boolean);
    return keys;
  }
  return [];
};

// 🔹 Helper: severity numeric weight for averaging
const severityScore = (sev) => {
  if (sev === "High") return 3;
  if (sev === "Medium") return 2;
  if (sev === "Low") return 1;
  return 0;
};

// 🔹 Helper: inverse severity score
const severityFromScore = (score) => {
  if (score >= 2.5) return "High";
  if (score >= 1.5) return "Medium";
  if (score > 0) return "Low";
  return "Unknown";
};

// 🔹 Status priority for road‑level status
const statusPriority = (status) => {
  if (status === "Pending Verification") return 3;
  if (status === "Assigned") return 2;
  if (status === "Reported") return 1;
  if (status === "Verified") return 0;
  return 0;
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
  const [patches, setPatches] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All Severity");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [activeReportId, setActiveReportId] = useState(null);
  const [modalMode, setModalMode] = useState("assign"); // 'assign' | 'view' | 'verify'
  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [loadingRoads, setLoadingRoads] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [useApi, setUseApi] = useState(true);

  // Persisted district cache (location/grid/db -> district name)
  const readDistrictCache = () => {
    try {
      return JSON.parse(localStorage.getItem("district_cache_v1") || "{}");
    } catch {
      return {};
    }
  };
  const writeDistrictCache = (obj) => {
    try {
      localStorage.setItem("district_cache_v1", JSON.stringify(obj || {}));
    } catch {
      // ignore
    }
  };
  const districtKeyForItem = (item) => {
    if (!item) return null;
    const grid = (item.gridId || "").toString().trim();
    if (grid) return `grid:${grid}`;
    const db = item.dbId != null ? String(item.dbId).trim() : "";
    if (db) return `db:${db}`;
    const loc = (item.location || "").toString().trim();
    if (loc) return `loc:${loc.toLowerCase().replace(/\s+/g, "")}`;
    return null;
  };

  const [districtCache, setDistrictCache] = useState(() => readDistrictCache());

  // Persisted road deadlines (set once at assignment time)
  const [deadlineCache, setDeadlineCache] = useState(() => readDeadlineCache());

  // for grouped view
  const [groupedRows, setGroupedRows] = useState([]);
  const [activeRoadKey, setActiveRoadKey] = useState(null); // road identifier for details modal
  // pagination for road table
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // pagination inside modal (potholes/patches)
  const [modalPHPage, setModalPHPage] = useState(1);
  const [modalPTPage, setModalPTPage] = useState(1);
  // batch action modals
  const [batchModalMode, setBatchModalMode] = useState(null); // 'assign' | 'verify'
  const [batchRoadKey, setBatchRoadKey] = useState(null);
  const [batchContractorId, setBatchContractorId] = useState("");
  const [rejectRemarks, setRejectRemarks] = useState("");

  // Helper to get auth token
  const getAuthToken = () => localStorage.getItem('admin_token');

  // Helper to map backend status to frontend status
  // Backend ENUM for aggregated_locations: 'pending', 'assigned', 'in_progress', 'pending_verification', 'verified', 'fixed'
  // Backend ENUM for work_assignments: 'assigned', 'in_progress', 'pending_verification', 'completed', 'verified'
  const mapBackendStatus = (status) => {
    const statusMap = {
      // aggregated_locations statuses
      'pending': 'Reported',
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'pending_verification': 'Pending Verification',
      'verified': 'Verified',

      // legacy/assignment statuses that may appear in API payloads
      'fixed': 'Pending Verification',
      'completed': 'Pending Verification',
    };
    return statusMap[status?.toLowerCase()] || 'Reported';
  };

  // Fetch data from API
  const fetchFromApi = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Fetch aggregated locations (grouped potholes)
      const locationsRes = await fetch(`${API_BASE_URL}/reports/aggregated/locations`);
      
      if (!locationsRes.ok) {
        throw new Error('Failed to fetch locations');
      }
      
      const locationsData = await locationsRes.json();
      
      // Fetch contractors from public endpoint (no auth required)
      let contractorsData = [];
      try {
        const contractorsRes = await fetch(`${API_BASE_URL}/reports/contractors/list`);
        if (contractorsRes.ok) {
          const data = await contractorsRes.json();
          if (data.contractors && data.contractors.length > 0) {
            contractorsData = data.contractors;
            console.log('Loaded', contractorsData.length, 'contractors from API');
          }
        }
      } catch (e) {
        console.warn('Failed to fetch contractors:', e);
      }
      setContractors(contractorsData);
      
      // Map backend data to frontend format
      if (locationsData.locations && locationsData.locations.length > 0) {
        // Requirement: if aggregated_locations.status is 'verified', it must not be visible in this dashboard
        // (even if assignment_status is something else).
        const visibleLocations = locationsData.locations.filter(
          (loc) => String(loc?.status || '').toLowerCase() !== 'verified'
        );

        const mappedReports = visibleLocations.map((loc, index) => ({
          id: `PH-API-${loc.id || index}`,
          dbId: loc.id,
          location: `${loc.latitude}, ${loc.longitude}`,
          severity_count: loc.total_potholes * (loc.highest_severity === 'High' ? 15 : loc.highest_severity === 'Medium' ? 8 : 3),
          // Prefer assignment_status over location status (work_assignments is more current)
          status: mapBackendStatus(loc.assignment_status || loc.status),
          contractorId: loc.contractor_id ? String(loc.contractor_id) : null,
          assignedAt: loc.assigned_at || null,
          dueDate: loc.due_date || null,
          preWorkPhotoUrl: loc.pre_work_photo_url || null,
          postWorkPhotoUrl: loc.post_work_photo_url || null,
          reportedTime: loc.last_reported_at ? new Date(loc.last_reported_at).toLocaleString(undefined, {
            month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
          }) : "--",
          roadName: loc.road_name || "",
          ward: loc.ward || "",
          // backend doesn't currently send district; we will enrich via reverse-geocoding when missing
          district: loc.district || loc.state_district || "",
          gridId: loc.grid_id,
          totalPotholes: loc.total_potholes,
          totalPatchy: loc.total_patchy
        }));
        
        // Map patches from total_patchy field in each location
        const mappedPatches = visibleLocations
          .filter(loc => loc.total_patchy > 0)
          .map((loc, index) => ({
            id: `PA-API-${loc.id || index}`,
            dbId: loc.id,
            location: `${loc.latitude}, ${loc.longitude}`,
            // Prefer assignment_status over location status
            status: mapBackendStatus(loc.assignment_status || loc.status),
            contractorId: loc.contractor_id ? String(loc.contractor_id) : null,
            assignedAt: loc.assigned_at || null,
            dueDate: loc.due_date || null,
            preWorkPhotoUrl: loc.pre_work_photo_url || null,
            postWorkPhotoUrl: loc.post_work_photo_url || null,
            completedTime: loc.status === 'verified' || loc.status === 'fixed' 
              ? (loc.verified_at ? new Date(loc.verified_at).toLocaleString(undefined, {
                  month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                }) : "--")
              : "--",
            reportedTime: loc.last_reported_at ? new Date(loc.last_reported_at).toLocaleString(undefined, {
              month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
            }) : "--",
            roadName: loc.road_name || "",
            ward: loc.ward || "",
            district: loc.district || loc.state_district || "",
            gridId: loc.grid_id,
            totalPatchy: loc.total_patchy
          }));
        
        // Do not display Verified items in the dashboard table
        // (Keep this as a second line of defense for legacy payloads/mapping.)
        setReports(mappedReports.filter((r) => r.status !== 'Verified'));
        setPatches(mappedPatches.filter((p) => p.status !== 'Verified'));
        setUseApi(true);
        console.log('Loaded', mappedReports.length, 'locations and', mappedPatches.length, 'patches from API');
      } else {
        // No data from API
        console.log('No locations data from API');
        setReports([]);
        setPatches([]);
      }
    } catch (error) {
      console.error('API fetch failed:', error);
      setApiError(error.message);
      setUseApi(false);
      
      // Set empty state on error
      setReports([]);
      setPatches([]);
      setContractors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchFromApi();
  }, [fetchFromApi]);

  // Recompute summary based on unique roads per status
  const recomputeSummary = () => {
    const reportedRoads = groupedRows.filter((row) => row.status === "Reported").length;
    const assignedRoads = groupedRows.filter((row) => row.status === "Assigned").length;
    const inProgressRoads = groupedRows.filter((row) => row.status === "In Progress").length;
    const pendingRoads = groupedRows.filter((row) => row.status === "Pending Verification").length;

    // Verified roads are not displayed in this dashboard view
    const verifiedRoads = 0;

    setSummary({
      reported: reportedRoads,
      assigned: assignedRoads,
      inProgress: inProgressRoads,
      pending: pendingRoads,
      verified: verifiedRoads
    });
  };

  // Update when grouped rows change (road-level)
  useEffect(() => {
    recomputeSummary();
  }, [groupedRows]);

  // Also update when verified repairs change (from batch verify)
  useEffect(() => {
    const handler = () => recomputeSummary();
    window.addEventListener("verifiedRepairsChanged", handler);
    return () => window.removeEventListener("verifiedRepairsChanged", handler);
  }, []);

  // Local cache for road names (location -> roadName)
  const readRoadCache = () => {
    try {
      return JSON.parse(localStorage.getItem("road_cache_v1") || "{}");
    } catch (_) {
      return {};
    }
  };
  const writeRoadCache = (obj) => {
    try {
      localStorage.setItem("road_cache_v1", JSON.stringify(obj));
    } catch (_) {}
  };

  const setRoadDeadlineIfMissing = (roadKey, severity, itemsOrLocations = []) => {
    if (!roadKey) return;
    setDeadlineCache((prev) => {
      const current = prev || {};
      if (current[roadKey]?.deadlineAt) return current;

      const assignedAt = new Date();
      const deadlineDate = computeDeadlineFromAssignmentDate(assignedAt, severity);
      const entry = {
        assignedAt: assignedAt.toISOString(),
        deadlineAt: deadlineDate ? deadlineDate.toISOString() : null,
        severity,
      };

      const keys = (Array.isArray(itemsOrLocations) ? itemsOrLocations : [])
        .flatMap(deadlineKeysForItem)
        .filter(Boolean);

      const next = {
        ...current,
        [roadKey]: entry,
      };

      for (const k of keys) {
        if (!next[k]?.deadlineAt) next[k] = entry;
      }

      writeDeadlineCache(next);
      return next;
    });
  };

  const clearRoadDeadline = (roadKey, itemsOrLocations = []) => {
    if (!roadKey) return;
    setDeadlineCache((prev) => {
      const current = prev || {};
      const next = { ...current };
      delete next[roadKey];

      const keys = (Array.isArray(itemsOrLocations) ? itemsOrLocations : [])
        .flatMap(deadlineKeysForItem)
        .filter(Boolean);
      for (const k of keys) delete next[k];

      writeDeadlineCache(next);
      return next;
    });
  };

  // Fetch road names + build grouped rows for potholes and patches
  useEffect(() => {
    const enrichAndGroup = async () => {
      if (!reports.length && !patches.length) return;

      let updatedReports = reports;
      let updatedPatches = patches;

      const roadCache = readRoadCache();
      const localDistrictCache = { ...(districtCache || {}) };

      const reportNeeds = reports.some((r) => !r.roadName || !r.district);
      const patchNeeds = patches.some((p) => !p.roadName || !p.district);

      if (reportNeeds || patchNeeds) {
        setLoadingRoads(true);
        try {
          const resolveOne = async (item) => {
            const loc = (item?.location || "").trim();
            const locKey = loc;

            const cachedRoad = locKey ? roadCache[locKey] : null;
            const dk = districtKeyForItem(item) || (locKey ? `loc:${locKey.toLowerCase().replace(/\s+/g, "")}` : null);
            const cachedDistrict = dk ? localDistrictCache[dk] : null;

            if (cachedRoad && cachedDistrict) return { roadName: cachedRoad, district: cachedDistrict };

            const coords = parseLatLon(locKey);
            if (!coords) return { roadName: cachedRoad || "Unknown road", district: cachedDistrict || "Unknown" };
            try {
              const details = await fetchRoadDetails(coords.lat, coords.lon);
              const rn = details?.roadName || cachedRoad || "Unknown road";
              const dist = details?.district || cachedDistrict || "Unknown";

              if (locKey && rn) {
                roadCache[locKey] = rn;
                writeRoadCache(roadCache);
              }
              if (dk && dist) {
                localDistrictCache[dk] = dist;
                writeDistrictCache(localDistrictCache);
              }

              // small delay to be polite to the API
              await new Promise((res) => setTimeout(res, 250));
              return { roadName: rn, district: dist };
            } catch {
              return { roadName: cachedRoad || "Unknown road", district: cachedDistrict || "Unknown" };
            }
          };

          // sequentially enrich to control rate
          const rep = [];
          for (const r of reports) {
            if (r.roadName && r.district) {
              rep.push(r);
              continue;
            }
            const resolved = await resolveOne(r);
            rep.push({
              ...r,
              roadName: r.roadName || resolved.roadName,
              district: r.district || resolved.district,
            });
          }
          const pat = [];
          for (const p of patches) {
            if (p.roadName && p.district) {
              pat.push(p);
              continue;
            }
            const resolved = await resolveOne(p);
            pat.push({
              ...p,
              roadName: p.roadName || resolved.roadName,
              district: p.district || resolved.district,
            });
          }
          updatedReports = rep;
          updatedPatches = pat;
        } finally {
          setLoadingRoads(false);
        }
        setReports(updatedReports);
        setPatches(updatedPatches);
        setDistrictCache(localDistrictCache);
      }

      // group potholes and patches by roadName
      const groups = {};
      for (const r of updatedReports) {
        const key = r.roadName || "Unknown road";
        if (!groups[key]) {
          const district = (r.district || r.ward || "Unknown").trim() || "Unknown";
          groups[key] = { roadKey: key, roadName: key, district, reports: [], patches: [] };
        }
        groups[key].reports.push(r);
      }
      for (const p of updatedPatches) {
        const key = p.roadName || "Unknown road";
        if (!groups[key]) {
          const district = (p.district || p.ward || "Unknown").trim() || "Unknown";
          groups[key] = { roadKey: key, roadName: key, district, reports: [], patches: [] };
        }
        groups[key].patches.push(p);
      }

      const rows = Object.values(groups)
        .filter((g) => g.reports.length > 0 || g.patches.length > 0) // Filter out empty roads
        .map((g, index) => {
        const numPotholes = g.reports.length;
        const numPatches = g.patches.length;

        // average severity (by severity label)
        const scores = g.reports.map((r) =>
          severityScore(severityLabelFromCount(r.severity_count))
        );
        const avgScore =
          scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;
        const avgSeverity = severityFromScore(avgScore);

        // average reported time (by timestamp)
        const dates = g.reports
          .map((r) => parseReportedDate(r.reportedTime))
          .filter(Boolean);
        let avgTimeStr = "--";
        if (dates.length) {
          const avgMs =
            dates.reduce((sum, d) => sum + d.getTime(), 0) / dates.length;
          avgTimeStr = formatDate(new Date(avgMs));
        }

        // Prefer backend due date (stored in DB) so it survives refresh.
        // Fallback to the persisted local cache if API doesn't provide due_date.
        const dueDates = [...g.reports, ...g.patches]
          .map((item) => parseBackendDate(item?.dueDate))
          .filter(Boolean)
          .sort((a, b) => a.getTime() - b.getTime());
        const minDueDate = dueDates.length ? dueDates[0] : null;

        // cached deadline is set at assignment time and persists until the road is verified/removed
        const byRoad = deadlineCache?.[g.roadKey];
        let cachedDeadlineAt = byRoad?.deadlineAt ?? null;
        if (!cachedDeadlineAt) {
          for (const item of [...g.reports, ...g.patches]) {
            const keys = deadlineKeysForItem(item);
            const hit = keys.map((k) => deadlineCache?.[k]).find((x) => x?.deadlineAt);
            if (hit?.deadlineAt) {
              cachedDeadlineAt = hit.deadlineAt;
              break;
            }
          }
        }
        const deadlineStr = minDueDate
          ? formatDate(minDueDate)
          : cachedDeadlineAt
            ? formatDate(new Date(cachedDeadlineAt))
            : "--";

        // road‑level status: pick highest priority
        const roadStatus =
          g.reports.reduce(
            (best, r) =>
              statusPriority(r.status) > statusPriority(best.status)
                ? r
                : best,
            g.reports[0]
          )?.status || "Reported";

        return {
          id: `RD-${index + 1}`, // road ID; change if needed
          roadKey: g.roadKey,
          roadName: g.roadName,
          district: g.district || "Unknown",
          numPotholes,
          numPatches,
          avgSeverity,
          avgReportedTime: avgTimeStr,
          deadline: deadlineStr,
          status: roadStatus,
          reports: g.reports,
          patches: g.patches
        };
      });

      setGroupedRows(rows);
    };

    enrichAndGroup();
  }, [reports, patches, deadlineCache]);

  // filters apply on grouped rows
  const filteredGroupedRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groupedRows.filter((row) => {
      const sev = row.avgSeverity;
      const matchQuery =
        !q ||
        row.id.toLowerCase().includes(q) ||
        row.roadName.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q) ||
        sev.toLowerCase().includes(q) ||
        (row.district || "").toLowerCase().includes(q);
      const matchSeverity =
        severityFilter === "All Severity" || sev === severityFilter;
      const matchStatus =
        statusFilter === "All Status" || row.status === statusFilter;
      const matchDistrict =
        districtFilter === "All Districts" || (row.district || "Unknown") === districtFilter;
      return matchQuery && matchSeverity && matchStatus && matchDistrict;
    });
  }, [groupedRows, query, severityFilter, statusFilter, districtFilter]);

  const availableDistricts = useMemo(() => {
    const set = new Set();
    for (const row of groupedRows) {
      const d = (row.district || "Unknown").trim() || "Unknown";
      set.add(d);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [groupedRows]);

  const totalPages = Math.max(1, Math.ceil(filteredGroupedRows.length / pageSize));
  const currentRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredGroupedRows.slice(start, start + pageSize);
  }, [filteredGroupedRows, page, pageSize]);

  const severityClass = (sev) => {
    if (sev === "High") return "pill-danger";
    if (sev === "Medium") return "pill-warning";
    if (sev === "Low") return "pill-success";
    return "";
  };

  const statusClass = (status) => {
    if (status === "Reported") return "status-chip";
    if (status === "Assigned") return "status-chip status-assigned";
    if (status === "In Progress") return "status-chip status-inprogress";
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
    setRejectRemarks("");
  };

  const doAssign = async () => {
    if (!activeReportId || !selectedContractorId) return;
    
    const report = getReportById(activeReportId);
    
    let apiDueDate = null;
    let apiAssignedAt = null;

    // Try to assign via public API endpoint if we have dbId
    if (report?.dbId && useApi) {
      try {
        const response = await fetch(`${API_BASE_URL}/reports/assignments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            locationId: report.dbId,
            contractorId: parseInt(selectedContractorId),
            notes: `Assigned from admin dashboard`
          })
        });
        
        if (!response.ok) {
          console.warn('API assign failed, updating locally');
        } else {
          const data = await response.json().catch(() => ({}));
          apiDueDate = data?.dueDate || null;
          apiAssignedAt = data?.assignedAt || null;
          console.log('Assignment saved to database');
        }
      } catch (error) {
        console.error('Assignment API error:', error);
      }
    }
    
    // Update local state
    const assignedAt = apiAssignedAt || new Date().toISOString();
    const contractor = contractors.find((c) => c.id === selectedContractorId);

    // Persist the road-level deadline once, right after assignment
    const roadKey = (report?.roadName || "Unknown road");
    const roadSeverity =
      groupedRows.find((x) => x.roadKey === roadKey)?.avgSeverity ||
      severityLabelFromCount(report?.severity_count);
    setRoadDeadlineIfMissing(roadKey, roadSeverity, [report].filter(Boolean));

    setReports((prev) =>
      prev.map((r) =>
        r.id === activeReportId
          ? {
              ...r,
              contractorId: selectedContractorId,
              status: "Assigned",
              assignedAt,
              dueDate: apiDueDate || r.dueDate || null,
            }
          : r
      )
    );
    closeModal();
  };

  const getReportById = (id) => reports.find((r) => r.id === id);

  const pushToHistory = (report) => {
    console.debug("pushToHistory =>", report?.id, report?.roadName, report?.status);
    const sev = severityLabelFromCount(report.severity_count);
    const contractor = contractors.find(
      (c) => c.id === (report.contractorId || selectedContractorId)
    );
    const entry = {
      id: report.id,
      location: report.location,
      roadName: report.roadName || "",
      severity: sev,
      contractor: contractor
        ? `${contractor.name} - ${contractor.company}`
        : "",
      fixedDate: new Date().toLocaleString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      status: "Verified"
    };
    try {
      const existing = JSON.parse(
        localStorage.getItem("verified_repairs") || "[]"
      );
      localStorage.setItem(
        "verified_repairs",
        JSON.stringify([entry, ...existing])
      );
        try {
          window.dispatchEvent(new Event("verifiedRepairsChanged"));
        } catch (_) {}
    } catch (_) {}
  };

  const doVerify = async () => {
    const r = getReportById(activeReportId);
    if (!r) return closeModal();
    console.debug("doVerify: verifying single report", r.id, r.roadName, r.status, "dbId:", r.dbId);
    
    // Try to verify via public API (no auth required)
    if (r.dbId && useApi) {
      try {
        const response = await fetch(`${API_BASE_URL}/reports/verify/${r.dbId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: 'Verified from admin dashboard' })
        });
        
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          console.error('Verify API failed:', response.status, data);
          alert(`Verification failed: ${data.message || response.statusText}`);
        } else {
          console.log('Verify API success:', data);
        }
      } catch (error) {
        console.error('Verify API error:', error);
      }
    } else {
      console.warn('Skipping API call - dbId:', r.dbId, 'useApi:', useApi);
    }
    
    // Clear persisted deadline only if this verification removes the whole road row
    const roadKey = (r.roadName || "Unknown road");
    const remainingReports = getReportsForRoad(roadKey).filter((x) => x.id !== r.id);
    const remainingPatches = getPatchesForRoad(roadKey);
    if (remainingReports.length === 0 && remainingPatches.length === 0) {
      clearRoadDeadline(roadKey, [...getReportsForRoad(roadKey), ...getPatchesForRoad(roadKey)]);
    }

    // Remove from table after verification (do not display Verified rows)
    setReports((prev) => prev.filter((x) => String(x.dbId) !== String(r.dbId)));
    setPatches((prev) => prev.filter((x) => String(x.dbId) !== String(r.dbId)));
    pushToHistory(r);
    closeModal();
  };

  const doReject = async () => {
    const r = getReportById(activeReportId);
    if (!r?.dbId) return closeModal();

    if (!rejectRemarks.trim()) {
      alert('Please enter remarks before rejecting.');
      return;
    }

    // Use public reject endpoint (mirrors public verify) so dashboard works without auth.
    if (useApi) {
      try {
        const response = await fetch(`${API_BASE_URL}/reports/verify/${r.dbId}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ remarks: rejectRemarks.trim() }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.message || 'Reject failed');
        }
      } catch (error) {
        console.error('Reject API error:', error);
        alert(error.message || 'Failed to reject verification');
        return;
      }
    }

    // Update local state: send task back to contractor as In Progress
    setReports((prev) =>
      prev.map((x) =>
        String(x.dbId) === String(r.dbId)
          ? { ...x, status: 'In Progress' }
          : x
      )
    );
    setPatches((prev) =>
      prev.map((x) =>
        String(x.dbId) === String(r.dbId)
          ? { ...x, status: 'In Progress' }
          : x
      )
    );

    closeModal();
  };

  // 🔹 Batch actions for all potholes on a road
  const openBatchAssignModal = (roadKey) => {
    setBatchRoadKey(roadKey);
    setBatchModalMode("assign");
    setBatchContractorId("");
  };

  const openBatchVerifyModal = (roadKey) => {
    setBatchRoadKey(roadKey);
    setBatchModalMode("verify");
  };

  const closeBatchModal = () => {
    setBatchModalMode(null);
    setBatchRoadKey(null);
    setBatchContractorId("");
  };

  const doBatchAssign = async () => {
    if (!batchRoadKey || !batchContractorId) return;
    
    const roadReports = getReportsForRoad(batchRoadKey);
    const roadPatches = getPatchesForRoad(batchRoadKey);
    const unassignedReports = roadReports.filter((r) => !r.contractorId && r.status !== "Pending Verification");
    const unassignedPatches = roadPatches.filter((p) => !p.contractorId && p.status !== "Pending Verification");
    
    if (unassignedReports.length === 0 && unassignedPatches.length === 0) return;

    // Persist the road-level deadline once, right after assignment
    const roadSeverity =
      groupedRows.find((x) => x.roadKey === batchRoadKey)?.avgSeverity || "Low";
    setRoadDeadlineIfMissing(
      batchRoadKey,
      roadSeverity,
      [...roadReports, ...roadPatches]
    );
    
    const dueDateByDbId = {};
    // Try batch assign via public API (assign each location individually)
    if (useApi) {
      const locationsToAssign = [...unassignedReports, ...unassignedPatches]
        .filter((x) => x?.dbId)
        .reduce((acc, cur) => {
          if (!acc.some((x) => x.dbId === cur.dbId)) acc.push(cur);
          return acc;
        }, []);

      for (const report of locationsToAssign) {
        try {
          const resp = await fetch(`${API_BASE_URL}/reports/assignments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              locationId: report.dbId,
              contractorId: parseInt(batchContractorId),
              notes: 'Batch assigned from admin dashboard'
            })
          });
          if (resp.ok) {
            const data = await resp.json().catch(() => ({}));
            if (data?.dueDate) dueDateByDbId[String(report.dbId)] = data.dueDate;
          }
        } catch (error) {
          console.error('Batch assign API error for location', report.dbId, ':', error);
        }
      }
      console.log(`Assigned ${locationsToAssign.length} locations to contractor`);
    }
    
    const assignedAt = new Date().toISOString();
    const contractor = contractors.find((c) => c.id === batchContractorId);
    
    // Assign potholes
    setReports((prev) =>
      prev.map((r) =>
        unassignedReports.some((u) => u.id === r.id)
          ? {
              ...r,
              contractorId: batchContractorId,
              status: "Assigned",
              assignedAt,
              dueDate: dueDateByDbId[String(r.dbId)] || r.dueDate || null,
            }
          : r
      )
    );
    
    // Assign patches
    setPatches((prev) =>
      prev.map((p) =>
        unassignedPatches.some((u) => u.id === p.id)
          ? {
              ...p,
              contractorId: batchContractorId,
              status: "Assigned",
              assignedAt,
              dueDate: dueDateByDbId[String(p.dbId)] || p.dueDate || null,
            }
          : p
      )
    );
    closeBatchModal();
  };

  const doBatchVerify = async () => {
    if (!batchRoadKey) return;
    
    const roadReports = getReportsForRoad(batchRoadKey);
    const roadPatches = getPatchesForRoad(batchRoadKey);
    const pendingReports = roadReports.filter((r) => r.status === "Pending Verification");
    const pendingPatches = roadPatches.filter((p) => p.status === "Pending Verification");
    
    console.debug("doBatchVerify => roadKey", batchRoadKey, "pendingReports", pendingReports.length, "pendingPatches", pendingPatches.length);
    if (pendingReports.length === 0 && pendingPatches.length === 0) return;
    
    // Try batch verify via public API (no auth required)
    if (useApi) {
      const locationIds = pendingReports.filter(r => r.dbId).map(r => r.dbId);
      if (locationIds.length > 0) {
        try {
          const response = await fetch(`${API_BASE_URL}/reports/verify/batch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ locationIds, notes: 'Batch verified from admin dashboard' })
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            console.error('Batch verify API failed:', response.status, data);
          } else {
            console.log('Batch verify API success:', data);
          }
        } catch (error) {
          console.error('Batch verify API error:', error);
        }
      }
    }
    
    // Move all potholes to history
    pendingReports.forEach((r) => {
      console.debug("doBatchVerify: push report", r.id, r.roadName);
      pushToHistory(r);
    });
    
    // Move all patches to history
    pendingPatches.forEach((p) => {
      const contractor = contractors.find(
        (c) => c.id === p.contractorId
      );
      const entry = {
        id: p.id,
        location: p.location,
        roadName: p.roadName || "",
        severity: "N/A",
        contractor: contractor
          ? `${contractor.name} - ${contractor.company}`
          : "",
        fixedDate: p.completedTime || new Date().toLocaleString(undefined, {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        status: "Verified"
      };
      try {
        const existing = JSON.parse(
          localStorage.getItem("verified_repairs") || "[]"
        );
        localStorage.setItem(
          "verified_repairs",
          JSON.stringify([entry, ...existing])
        );
        try {
          window.dispatchEvent(new Event("verifiedRepairsChanged"));
        } catch (_) {}
      } catch (_) {}
    });
    
    // Clear deadline for this road once verified
    clearRoadDeadline(
      batchRoadKey,
      [...pendingReports, ...pendingPatches]
    );

    // Remove from table after verification (do not display Verified rows)
    const verifiedDbIds = new Set(
      [...pendingReports, ...pendingPatches]
        .map((x) => x.dbId)
        .filter((x) => x != null)
        .map((x) => String(x))
    );

    setReports((prev) => prev.filter((r) => !verifiedDbIds.has(String(r.dbId))));
    setPatches((prev) => prev.filter((p) => !verifiedDbIds.has(String(p.dbId))));
    
    // Close modal and reset page if needed
    closeBatchModal();
    
    // If current page becomes empty, go to page 1
    setTimeout(() => {
      setPage((p) => Math.min(p, Math.max(1, Math.ceil((groupedRows.length - 1) / pageSize))));
    }, 100);
  };

  const openViewRoad = (roadKey) => {
    setActiveRoadKey(roadKey);
    setModalPHPage(1);
    setModalPTPage(1);
  };

  // Determine action button for a road based on potholes and patches
  const getRoadAction = (roadKey) => {
    const roadReports = getReportsForRoad(roadKey);
    const roadPatches = getPatchesForRoad(roadKey);
    if (roadReports.length === 0 && roadPatches.length === 0) return "view";
    
    const hasPendingVerification = 
      roadReports.some((r) => r.status === "Pending Verification") ||
      roadPatches.some((p) => p.status === "Pending Verification");
    const hasUnassigned = 
      roadReports.some((r) => !r.contractorId && r.status !== "Pending Verification") ||
      roadPatches.some((p) => !p.contractorId && p.status !== "Pending Verification");
    
    if (hasPendingVerification) return "verify";
    if (hasUnassigned) return "assign";
    return "view";
  };

  // 🔹 get all potholes/patches for a roadKey
  const getReportsForRoad = (roadKey) =>
    reports.filter((r) => (r.roadName || "Unknown road") === roadKey);
  const getPatchesForRoad = (roadKey) =>
    patches.filter((p) => (p.roadName || "Unknown road") === roadKey);

  return (
    <>
      <section className="dashboard-card">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Live overview</p>
            <h1>Dashboard</h1>
            <p className="muted">
              Monitor and manage pothole reports by road. Click a road to
              view individual potholes.
            </p>
          </div>
          <span className={`pill ${apiError ? 'warning' : 'success'}`}>
            {isLoading ? "Loading..." : loadingRoads ? "Loading roads..." : apiError ? "Offline Mode" : useApi ? "Connected" : "Demo Mode"}
          </span>
        </div>

        {/* Top summary cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <div>
              <p className="summary-label">Reported</p>
              <h2>{summary.reported}</h2>
            </div>
            <div className="summary-icon">
              <ReportProblemOutlinedIcon
                sx={{ fontSize: 32, color: "#24478f" }}
              />
            </div>
          </div>
          <div className="summary-card">
            <div>
              <p className="summary-label">Assigned</p>
              <h2>{summary.assigned}</h2>
            </div>
            <div className="summary-icon">
              <AssignmentTurnedInOutlinedIcon
                sx={{ fontSize: 32, color: "#24478f" }}
              />
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
              <PendingActionsOutlinedIcon
                sx={{ fontSize: 32, color: "#f59e0b" }}
              />
            </div>
          </div>
          <div className="summary-card">
            <div>
              <p className="summary-label">Verified</p>
              <h2>{summary.verified}</h2>
            </div>
            <div className="summary-icon">
              <CheckCircleOutlineIcon
                sx={{ fontSize: 32, color: "#16a34a" }}
              />
            </div>
          </div>
        </div>

        {/* Road-level aggregated table */}
        <div className="panel">
          <div className="table-header-row">
            <h3>Road-wise Summary</h3>
            <div className="table-filters">
              <input
                type="text"
                placeholder="Search by ID, road, severity, status..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
              >
                <option>All Districts</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option>All Severity</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Reported</option>
                <option>Assigned</option>
                <option>In Progress</option>
                <option>Pending Verification</option>
                <option>Verified</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Road Name</th>
                  <th>District</th>
                  <th>No. of Potholes</th>
                  <th>No. of Patches</th>
                  <th>Average Severity</th>
                  <th>Average Reported Time</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row) => (
                  <tr
                    key={row.roadKey}
                    className="clickable-row"
                    onClick={() => {
                      setActiveRoadKey(row.roadKey);
                      setModalPHPage(1);
                      setModalPTPage(1);
                    }}
                  >
                    <td>{row.id}</td>
                    <td>{row.roadName}</td>
                    <td>{row.district || "Unknown"}</td>
                    <td>{row.numPotholes}</td>
                    <td>{row.numPatches}</td>
                    <td>
                      <span className={severityClass(row.avgSeverity)}>
                        {row.avgSeverity}
                      </span>
                    </td>
                    <td>{row.avgReportedTime}</td>
                    <td>
                      <span className={statusClass(row.status)}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.deadline}</td>
                    <td className="action-cell">
                      {(() => {
                        const action = getRoadAction(row.roadKey);
                        if (action === "verify") {
                          return (
                            <button
                              className="btn-success"
                              onClick={(e) => {
                                e.stopPropagation();
                                openBatchVerifyModal(row.roadKey);
                              }}
                            >
                              Verify All
                            </button>
                          );
                        } else if (action === "assign") {
                          return (
                            <button
                              className="btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                openBatchAssignModal(row.roadKey);
                              }}
                            >
                              Assign All
                            </button>
                          );
                        }
                        return (
                          <button
                            className="btn-outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openViewRoad(row.roadKey);
                            }}
                          >
                            View Details
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
                {currentRows.length === 0 && (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "18px",
                        color: "#6b7280"
                      }}
                    >
                      No roads match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* pagination controls */}
          <div className="table-pagination">
            <div className="left">
              <span>
                Page {page} of {totalPages}
              </span>
              <span style={{ marginLeft: 8 }}>
                • {filteredGroupedRows.length} roads
              </span>
            </div>
            <div className="right">
              <button
                className="btn-outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <button
                className="btn-outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{ marginLeft: 8 }}
              >
                Next
              </button>
              <select
                className="select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                style={{ marginLeft: 8 }}
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Road details modal: list of potholes on that road */}
      {activeRoadKey && (
        <div
          className="modal-overlay"
          onClick={() => setActiveRoadKey(null)}
        >
          <div className="modal-fullscreen" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Road Details</h3>
                <p className="muted">{activeRoadKey}</p>
              </div>
              <button
                className="btn-outline"
                onClick={() => setActiveRoadKey(null)}
              >
                ✕
              </button>
            </div>

            {/* Potholes on road */}
            <div className="table-wrapper">
              <h4 style={{ marginBottom: 8 }}>Potholes</h4>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Pothole ID</th>
                    <th>Location</th>
                    <th>Severity</th>
                    <th>Contractor</th>
                    <th>Reported Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const list = getReportsForRoad(activeRoadKey);
                    const total = list.length;
                    const perPage = 10;
                    const start = (modalPHPage - 1) * perPage;
                    const pageItems = list.slice(start, start + perPage);
                    return (
                      <>
                        {pageItems.map((report) => {
                    console.log(report.severity_count);
                          const contractor = report.contractorId
                            ? contractors.find((c) => c.id === report.contractorId)
                            : null;
                          return (
                          <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{report.location}</td>
                            <td>
                              <span className={severityClass(severityLabelFromCount(report.severity_count))}>
                                {severityLabelFromCount(report.severity_count)}
                              </span>
                            </td>
                            <td>{contractor ? `${contractor.name}` : "--"}</td>
                            <td>{report.reportedTime}</td>
                            <td>
                              <span className={statusClass(report.status)}>
                                {report.status}
                              </span>
                            </td>
                            <td className="action-cell">
                              {report.status === "Pending Verification" ? (
                                <button className="btn-success" onClick={() => { setActiveRoadKey(null); openVerifyModal(report); }}>
                                  Verify
                                </button>
                              ) : report.contractorId ? (
                                <button className="btn-outline" onClick={() => { setActiveRoadKey(null); openViewModal(report); }}>
                                  View
                                </button>
                              ) : (
                                <button className="btn-primary" onClick={() => { setActiveRoadKey(null); openAssignModal(report); }}>
                                  Assign
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                        })}
                        {total === 0 && (
                          <tr>
                            <td colSpan="7" style={{ textAlign: "center", padding: "18px", color: "#6b7280" }}>
                              No potholes on this road.
                            </td>
                          </tr>
                        )}
                        {total > 10 && (
                          <tr>
                            <td colSpan="7">
                              <div className="table-pagination" style={{ justifyContent: "flex-end" }}>
                                <button className="btn-outline" disabled={modalPHPage <= 1} onClick={() => setModalPHPage((p) => Math.max(1, p - 1))}>Prev</button>
                                <span style={{ margin: "0 8px" }}>{modalPHPage} / {Math.ceil(total / 10)}</span>
                                <button className="btn-outline" disabled={modalPHPage >= Math.ceil(total / 10)} onClick={() => setModalPHPage((p) => Math.min(Math.ceil(total / 10), p + 1))}>Next</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            {/* Patches on road */}
            <div className="table-wrapper" style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 8 }}>Patches</h4>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Patch ID</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Contractor</th>
                    <th>Completed/Scheduled</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const list = getPatchesForRoad(activeRoadKey);
                    const total = list.length;
                    const perPage = 10;
                    const start = (modalPTPage - 1) * perPage;
                    const pageItems = list.slice(start, start + perPage);
                    return (
                      <>
                        {pageItems.map((pt) => {
                          const contractor = pt.contractorId
                            ? contractors.find((c) => c.id === pt.contractorId)
                            : null;
                          return (
                          <tr key={pt.id}>
                            <td>{pt.id}</td>
                            <td>{pt.location}</td>
                            <td>
                              <span className={statusClass(pt.status)}>{pt.status}</span>
                            </td>
                            <td>{contractor ? `${contractor.name}` : "--"}</td>
                            <td>{pt.completedTime}</td>
                          </tr>
                        );
                        })}
                        {total === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center", padding: "18px", color: "#6b7280" }}>
                              No patches recorded for this road.
                            </td>
                          </tr>
                        )}
                        {total > 10 && (
                          <tr>
                            <td colSpan="5">
                              <div className="table-pagination" style={{ justifyContent: "flex-end" }}>
                                <button className="btn-outline" disabled={modalPTPage <= 1} onClick={() => setModalPTPage((p) => Math.max(1, p - 1))}>Prev</button>
                                <span style={{ margin: "0 8px" }}>{modalPTPage} / {Math.ceil(total / 10)}</span>
                                <button className="btn-outline" disabled={modalPTPage >= Math.ceil(total / 10)} onClick={() => setModalPTPage((p) => Math.min(Math.ceil(total / 10), p + 1))}>Next</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Existing assignment / view / verify modal for a single pothole */}
      {activeReportId && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const r = getReportById(activeReportId);
              const sevLabel = severityLabelFromCount(r?.severity_count);
              const contractor = r?.contractorId
                ? contractors.find((c) => c.id === r.contractorId)
                : null;
              return (
                <>
                  {modalMode === "verify" ? (
                    <div className="modal-header">
                      <div>
                        <h3 className="modal-title">
                          View Proof - <span className="muted">{r?.id}</span>
                        </h3>
                      </div>
                      <button className="btn-outline" onClick={closeModal}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="modal-header">
                      <div>
                        <h3 className="modal-title">
                          Pothole Details{" "}
                          <span className="muted">{r?.id}</span>
                        </h3>
                        <p className="muted">
                          {modalMode === "assign"
                            ? "Review pothole details and assign a contractor for repair."
                            : "View pothole details and current assignment status."}
                        </p>
                      </div>
                      <button className="btn-outline" onClick={closeModal}>
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="modal-chips">
                    <span className={severityClass(sevLabel)}>
                      {sevLabel}
                    </span>
                    <span className={statusClass(r?.status)}>
                      {r?.status}
                    </span>
                  </div>
                  {modalMode === "verify" ? (
                    <>
                      <div className="modal-section">
                        {r?.preWorkPhotoUrl || r?.postWorkPhotoUrl ? (
                          <div
                            style={{
                              display: 'grid',
                              gap: '12px',
                            }}
                          >
                            {r?.preWorkPhotoUrl && (
                              <div className="field-box" style={{ textAlign: 'center', padding: '12px' }}>
                                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Pre-Work Photo</div>
                                <a href={r.preWorkPhotoUrl} target="_blank" rel="noreferrer">
                                  <img
                                    src={r.preWorkPhotoUrl}
                                    alt="Pre-work proof"
                                    style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 12 }}
                                  />
                                </a>
                              </div>
                            )}
                            {r?.postWorkPhotoUrl && (
                              <div className="field-box" style={{ textAlign: 'center', padding: '12px' }}>
                                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Post-Work Photo</div>
                                <a href={r.postWorkPhotoUrl} target="_blank" rel="noreferrer">
                                  <img
                                    src={r.postWorkPhotoUrl}
                                    alt="Post-work proof"
                                    style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 12 }}
                                  />
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="field-box" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                            No proof image available
                          </div>
                        )}
                      </div>

                      <div className="modal-section">
                        <label className="field-label">Remarks (send back to contractor)</label>
                        <textarea
                          value={rejectRemarks}
                          onChange={(e) => setRejectRemarks(e.target.value)}
                          placeholder="Explain what needs to be fixed before verification..."
                          className="modalInput"
                          style={{ width: '100%', minHeight: 90 }}
                        />
                      </div>
                      <div className="modal-grid">
                        <div>
                          <label className="field-label">Pothole ID</label>
                          <div className="field-box">{r?.id}</div>
                        </div>
                        <div>
                          <label className="field-label">Status</label>
                          <div>
                            <span className={statusClass(r?.status)}>
                              {r?.status}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="field-label">Severity</label>
                          <div>
                            <span className={severityClass(sevLabel)}>
                              {sevLabel}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="field-label">Location</label>
                          <div className="field-box">{r?.location}</div>
                        </div>
                      </div>
                      <div className="modal-section">
                        <label className="field-label">
                          Assigned Contractor
                        </label>
                        <div className="field-box">
                          {contractor
                            ? `${contractor.name} - ${contractor.company}`
                            : "Not available"}
                        </div>
                      </div>
                      <div className="modal-section">
                        <label className="field-label">Completed</label>
                        <div className="field-box">
                          {r?.reportedTime || "--"}
                        </div>
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
                          <label className="field-label">
                            Assigned Contractor
                          </label>
                          <div className="field-box">
                            {contractor?.name} - {contractor?.company}
                          </div>
                        </div>
                      )}
                      {modalMode === "assign" && (
                        <div className="modal-section">
                          <label className="field-label">
                            Select Contractor
                          </label>
                          <select
                            className="select"
                            value={selectedContractorId}
                            onChange={(e) =>
                              setSelectedContractorId(e.target.value)
                            }
                          >
                            <option value="">
                              Choose a contractor...
                            </option>
                            {contractors.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} - {c.company}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  <div className="modal-footer">
                    {modalMode === "assign" ? (
                      <>
                        <button
                          className="btn-outline"
                          onClick={closeModal}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn-success"
                          disabled={!selectedContractorId}
                          onClick={doAssign}
                        >
                          Assign
                        </button>
                      </>
                    ) : modalMode === "view" ? (
                      <>
                        <button
                          className="btn-outline"
                          onClick={() => {
                            setSelectedContractorId(
                              r?.contractorId || ""
                            );
                            setModalMode("assign");
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-primary"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-outline"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                        <button
                          className="btn-outline"
                          onClick={doReject}
                        >
                          Reject
                        </button>
                        <button
                          className="btn-success"
                          onClick={doVerify}
                        >
                          Verify &amp; Close
                        </button>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Batch Assignment Modal */}
      {batchModalMode === "assign" && batchRoadKey && (() => {
        const roadReports = getReportsForRoad(batchRoadKey);
        const roadPatches = getPatchesForRoad(batchRoadKey);
        const unassignedReports = roadReports.filter((r) => !r.contractorId && r.status !== "Pending Verification");
        const unassignedPatches = roadPatches.filter((p) => !p.contractorId && p.status !== "Pending Verification");
        const avgSeverity = roadReports.length > 0
          ? severityFromScore(
              roadReports.map((r) => severityScore(severityLabelFromCount(r.severity_count)))
                .reduce((a, b) => a + b, 0) / roadReports.length
            )
          : "Low";
        
        return (
          <div className="modal-overlay" onClick={closeBatchModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Assign Contractors</h3>
                  <p className="muted">Assign contractor for all potholes on this road</p>
                </div>
                <button className="btn-outline" onClick={closeBatchModal}>✕</button>
              </div>

              <div className="modal-chips">
                <span className={severityClass(avgSeverity)}>{avgSeverity}</span>
                <span className="status-chip">Reported</span>
              </div>

              <div className="modal-section">
                <label className="field-label">📍 Road Name</label>
                <div className="field-box">{batchRoadKey}</div>
              </div>

              <div className="modal-grid">
                <div>
                  <label className="field-label">Potholes</label>
                  <div className="field-box">{unassignedReports.length} unassigned</div>
                </div>
                <div>
                  <label className="field-label">Patches</label>
                  <div className="field-box">{unassignedPatches.length} unassigned</div>
                </div>
              </div>

              <div className="modal-section">
                <label className="field-label">📅 Reported Time</label>
                <div className="field-box">
                  {unassignedReports.length > 0 ? unassignedReports[0].reportedTime : unassignedPatches.length > 0 ? unassignedPatches[0].reportedTime : "--"}
                </div>
              </div>

              <div className="modal-section">
                <label className="field-label">Select Contractor</label>
                <select
                  className="select"
                  value={batchContractorId}
                  onChange={(e) => setBatchContractorId(e.target.value)}
                >
                  <option value="">Choose a contractor...</option>
                  {contractors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button className="btn-outline" onClick={closeBatchModal}>Close</button>
                <button
                  className="btn-primary"
                  disabled={!batchContractorId}
                  onClick={doBatchAssign}
                >
                  Assign Contractor
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Batch Verification Modal */}
      {batchModalMode === "verify" && batchRoadKey && (() => {
        const roadReports = getReportsForRoad(batchRoadKey);
        const roadPatches = getPatchesForRoad(batchRoadKey);
        const pendingVerification = roadReports.filter((r) => r.status === "Pending Verification");
        const firstPending = pendingVerification[0];
        const contractor = firstPending?.contractorId
          ? contractors.find((c) => c.id === firstPending.contractorId)
          : null;
        
        return (
          <div className="modal-overlay" onClick={closeBatchModal}>
            <div className="modal-fullscreen" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Verify Repairs - {batchRoadKey}</h3>
                  <p className="muted">Verify all completed repairs on this road</p>
                </div>
                <button className="btn-outline" onClick={closeBatchModal}>✕</button>
              </div>

              <div className="modal-section">
                <label className="field-label">📍 Road Name</label>
                <div className="field-box">{batchRoadKey}</div>
              </div>

              <div className="modal-grid">
                <div>
                  <label className="field-label">Pothole ID</label>
                  <div className="field-box">{firstPending?.id || "--"}</div>
                </div>
                <div>
                  <label className="field-label">Status</label>
                  <div>
                    <span className="status-chip status-pending">Pending Verification</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">Severity</label>
                  <div>
                    <span className={severityClass(severityLabelFromCount(firstPending?.severity_count))}>
                      {severityLabelFromCount(firstPending?.severity_count)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="field-label">Location</label>
                  <div className="field-box">{firstPending?.location || "--"}</div>
                </div>
              </div>

              <div className="modal-grid">
                <div>
                  <label className="field-label">Potholes to Verify</label>
                  <div className="field-box">{pendingVerification.length} items</div>
                </div>
                <div>
                  <label className="field-label">Patches to Verify</label>
                  <div className="field-box">{roadPatches.filter((p) => p.status === "Pending Verification").length} items</div>
                </div>
              </div>

              <div className="modal-section">
                <label className="field-label">👷 Assigned Contractor</label>
                <div className="field-box">
                  {contractor ? `${contractor.name} - ${contractor.company}` : "Not available"}
                </div>
              </div>

              <div className="modal-section">
                <label className="field-label">✅ Completed</label>
                <div className="field-box">{firstPending?.completed_at || firstPending?.completedAt || "--"}</div>
              </div>

              <div className="modal-footer">
                <button className="btn-outline" onClick={closeBatchModal}>Close</button>
                <button className="btn-success" onClick={doBatchVerify}>
                  Verify & Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

export default Dashboard;
