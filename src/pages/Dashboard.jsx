// Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// 🔹 DUMMY DATA

// Potholes (reports) - grouped by road with matching statuses
const DUMMY_REPORTS = [
  // Road 1: Anna Salai - Reported status (3 potholes)
  {
    id: "PH-2024-001",
    location: "13.0827, 80.2707",
    severity_count: 8,
    status: "Reported",
    reportedTime: "Jan 15, 2024 09:30"
  },
  {
    id: "PH-2024-002",
    location: "13.0828, 80.2708",
    severity_count: 15,
    status: "Reported",
    reportedTime: "Jan 15, 2024 11:00"
  },
  {
    id: "PH-2024-003",
    location: "13.0829, 80.2709",
    severity_count: 6,
    status: "Reported",
    reportedTime: "Jan 15, 2024 12:30"
  },
  // Road 2: Mount Road - Assigned status (4 potholes)
  {
    id: "PH-2024-004",
    location: "13.0569, 80.2425",
    severity_count: 18,
    status: "Assigned",
    contractorId: "c1",
    reportedTime: "Jan 14, 2024 14:15"
  },
  {
    id: "PH-2024-005",
    location: "13.0570, 80.2426",
    severity_count: 12,
    status: "Assigned",
    contractorId: "c1",
    reportedTime: "Jan 14, 2024 15:00"
  },
  {
    id: "PH-2024-006",
    location: "13.0571, 80.2427",
    severity_count: 20,
    status: "Assigned",
    contractorId: "c1",
    reportedTime: "Jan 14, 2024 16:00"
  },
  {
    id: "PH-2024-007",
    location: "13.0572, 80.2428",
    severity_count: 9,
    status: "Assigned",
    contractorId: "c1",
    reportedTime: "Jan 14, 2024 17:00"
  },
  // Road 3: Cathedral Road - Pending Verification status (2 potholes)
  {
    id: "PH-2024-008",
    location: "13.0674, 80.2376",
    severity_count: 34,
    status: "Pending Verification",
    contractorId: "c3",
    reportedTime: "Jan 12, 2024 16:20"
  },
  {
    id: "PH-2024-009",
    location: "13.0675, 80.2377",
    severity_count: 22,
    status: "Pending Verification",
    contractorId: "c3",
    reportedTime: "Jan 12, 2024 18:00"
  },
  // Road 4: Gandhi Road - Reported status (5 potholes)
  {
    id: "PH-2024-010",
    location: "13.0600, 80.2800",
    severity_count: 31,
    status: "Reported",
    reportedTime: "Jan 07, 2024 12:00"
  },
  {
    id: "PH-2024-011",
    location: "13.0601, 80.2801",
    severity_count: 9,
    status: "Reported",
    reportedTime: "Jan 07, 2024 14:30"
  },
  {
    id: "PH-2024-012",
    location: "13.0602, 80.2802",
    severity_count: 14,
    status: "Reported",
    reportedTime: "Jan 07, 2024 16:00"
  },
  {
    id: "PH-2024-013",
    location: "13.0603, 80.2803",
    severity_count: 7,
    status: "Reported",
    reportedTime: "Jan 07, 2024 17:30"
  },
  {
    id: "PH-2024-014",
    location: "13.0604, 80.2804",
    severity_count: 11,
    status: "Reported",
    reportedTime: "Jan 07, 2024 18:00"
  }
];

// Patches (repairs/works) - matching status with potholes on same road
const DUMMY_PATCHES = [
  // Road 1: Anna Salai - Reported status (2 patches)
  {
    id: "PA-2024-101",
    location: "13.0827, 80.2707",
    status: "Reported",
    completedTime: "--",
    reportedTime: "Jan 15, 2024 09:45"
  },
  {
    id: "PA-2024-102",
    location: "13.0828, 80.2708",
    status: "Reported",
    completedTime: "--",
    reportedTime: "Jan 15, 2024 11:15"
  },
  // Road 2: Mount Road - Assigned status (2 patches)
  {
    id: "PA-2024-103",
    location: "13.0569, 80.2425",
    status: "Assigned",
    contractorId: "c1",
    completedTime: "--",
    reportedTime: "Jan 14, 2024 14:30"
  },
  {
    id: "PA-2024-104",
    location: "13.0570, 80.2426",
    status: "Assigned",
    contractorId: "c1",
    completedTime: "--",
    reportedTime: "Jan 14, 2024 15:15"
  },
  // Road 3: Cathedral Road - Pending Verification status (4 patches)
  {
    id: "PA-2024-105",
    location: "13.0674, 80.2376",
    status: "Pending Verification",
    contractorId: "c3",
    completedTime: "Jan 14, 2024 11:15",
    reportedTime: "Jan 13, 2024 08:00"
  },
  {
    id: "PA-2024-106",
    location: "13.0675, 80.2377",
    status: "Pending Verification",
    contractorId: "c3",
    completedTime: "Jan 14, 2024 12:30",
    reportedTime: "Jan 13, 2024 09:00"
  },
  {
    id: "PA-2024-107",
    location: "13.0676, 80.2378",
    status: "Pending Verification",
    contractorId: "c3",
    completedTime: "Jan 14, 2024 14:00",
    reportedTime: "Jan 13, 2024 10:00"
  },
  {
    id: "PA-2024-108",
    location: "13.0677, 80.2379",
    status: "Pending Verification",
    contractorId: "c3",
    completedTime: "Jan 14, 2024 15:30",
    reportedTime: "Jan 13, 2024 11:00"
  },
  // Road 4: Gandhi Road - Reported status (3 patches)
  {
    id: "PA-2024-109",
    location: "13.0600, 80.2800",
    status: "Reported",
    completedTime: "--",
    reportedTime: "Jan 07, 2024 12:30"
  },
  {
    id: "PA-2024-110",
    location: "13.0601, 80.2801",
    status: "Reported",
    completedTime: "--",
    reportedTime: "Jan 07, 2024 15:00"
  },
  {
    id: "PA-2024-111",
    location: "13.0602, 80.2802",
    status: "Reported",
    completedTime: "--",
    reportedTime: "Jan 07, 2024 16:30"
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
    imageUrl:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
    completedAt: "Jan 14, 2024 10:00"
  },
  "PH-2024-009": {
    imageUrl:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop",
    completedAt: "Jan 08, 2024 17:45"
  }
};

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
const fetchRoadName = async (lat, lon) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=16`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "PotholeDashboard/1.0 (your-email@example.com)"
    }
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

// 🔹 Helper: parse reported time string → Date
const parseReportedDate = (str) => {
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  return null;
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
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All Severity");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activeReportId, setActiveReportId] = useState(null);
  const [modalMode, setModalMode] = useState("assign"); // 'assign' | 'view' | 'verify'
  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [loadingRoads, setLoadingRoads] = useState(false);

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

  // initial dummy sync
  useEffect(() => {
    // Exclude already verified items so they never reappear
    let verifiedIds = new Set();
    try {
      const verified = JSON.parse(localStorage.getItem("verified_repairs") || "[]");
      verifiedIds = new Set((Array.isArray(verified) ? verified : []).map((x) => x.id));
    } catch (_) {}

    setReports(
      DUMMY_REPORTS
        .filter((r) => !verifiedIds.has(r.id))
        .map((r) => ({
          ...r,
          roadName: ""
        }))
    );
    setPatches(
      DUMMY_PATCHES
        .filter((p) => !verifiedIds.has(p.id))
        .map((p) => ({
          ...p,
          roadName: ""
        }))
    );
  }, []);

  // Recompute summary based on unique roads per status
  const recomputeSummary = () => {
    const reportedRoads = groupedRows.filter((row) => row.status === "Reported").length;
    const assignedRoads = groupedRows.filter((row) => row.status === "Assigned").length;
    const pendingRoads = groupedRows.filter((row) => row.status === "Pending Verification").length;

    // Verified roads: unique road names from localStorage entries
    let verifiedRoads = 0;
    try {
      const verified = JSON.parse(localStorage.getItem("verified_repairs") || "[]");
      const unique = new Set(
        (Array.isArray(verified) ? verified : []).map((v) =>
          (v.roadName && v.roadName.trim()) || (v.location || "").trim() || v.id
        )
      );
      verifiedRoads = unique.size;
    } catch (_) {}

    setSummary({
      reported: reportedRoads,
      assigned: assignedRoads,
      inProgress: 0,
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

  // Fetch road names + build grouped rows for potholes and patches
  useEffect(() => {
    const enrichAndGroup = async () => {
      if (!reports.length && !patches.length) return;

      let updatedReports = reports;
      let updatedPatches = patches;

      const roadCache = readRoadCache();

      const reportNeeds = reports.some((r) => !r.roadName);
      const patchNeeds = patches.some((p) => !p.roadName);

      if (reportNeeds || patchNeeds) {
        setLoadingRoads(true);
        try {
          const resolveOne = async (loc) => {
            const key = (loc || "").trim();
            if (roadCache[key]) return roadCache[key];
            const coords = parseLatLon(key);
            if (!coords) return "Unknown road";
            try {
              const name = await fetchRoadName(coords.lat, coords.lon);
              roadCache[key] = name;
              writeRoadCache(roadCache);
              // small delay to be polite to the API
              await new Promise((res) => setTimeout(res, 250));
              return name;
            } catch (_) {
              return "Unknown road";
            }
          };

          // sequentially enrich to control rate
          const rep = [];
          for (const r of reports) {
            if (r.roadName) {
              rep.push(r);
            } else {
              const name = await resolveOne(r.location);
              rep.push({ ...r, roadName: name });
            }
          }
          const pat = [];
          for (const p of patches) {
            if (p.roadName) {
              pat.push(p);
            } else {
              const name = await resolveOne(p.location);
              pat.push({ ...p, roadName: name });
            }
          }
          updatedReports = rep;
          updatedPatches = pat;
        } finally {
          setLoadingRoads(false);
        }
        setReports(updatedReports);
        setPatches(updatedPatches);
      }

      // group potholes and patches by roadName
      const groups = {};
      for (const r of updatedReports) {
        const key = r.roadName || "Unknown road";
        if (!groups[key]) groups[key] = { roadKey: key, roadName: key, reports: [], patches: [] };
        groups[key].reports.push(r);
      }
      for (const p of updatedPatches) {
        const key = p.roadName || "Unknown road";
        if (!groups[key]) groups[key] = { roadKey: key, roadName: key, reports: [], patches: [] };
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
          numPotholes,
          numPatches,
          avgSeverity,
          avgReportedTime: avgTimeStr,
          status: roadStatus,
          reports: g.reports,
          patches: g.patches
        };
      });

      setGroupedRows(rows);
    };

    enrichAndGroup();
  }, [reports, patches]);

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
        sev.toLowerCase().includes(q);
      const matchSeverity =
        severityFilter === "All Severity" || sev === severityFilter;
      const matchStatus =
        statusFilter === "All Status" || row.status === statusFilter;
      return matchQuery && matchSeverity && matchStatus;
    });
  }, [groupedRows, query, severityFilter, statusFilter]);

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
    const contractor = DUMMY_CONTRACTORS.find(
      (c) => c.id === selectedContractorId
    );
    setReports((prev) =>
      prev.map((r) =>
        r.id === activeReportId
          ? {
              ...r,
              contractorId: selectedContractorId,
              status: "Assigned"
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
    const contractor = DUMMY_CONTRACTORS.find(
      (c) => c.id === (report.contractorId || selectedContractorId)
    );
    const proof = DUMMY_VERIFICATION[report.id];
    const entry = {
      id: report.id,
      location: report.location,
      roadName: report.roadName || "",
      severity: sev,
      contractor: contractor
        ? `${contractor.name} - ${contractor.company}`
        : "",
      fixedDate:
        proof?.completedAt ||
        new Date().toLocaleString(undefined, {
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

  const doVerify = () => {
    const r = getReportById(activeReportId);
    if (!r) return closeModal();
    console.debug("doVerify: verifying single report", r.id, r.roadName, r.status);
    setReports((prev) => prev.filter((x) => x.id !== r.id));
    pushToHistory(r);
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

  const doBatchAssign = () => {
    if (!batchRoadKey || !batchContractorId) return;
    
    const roadReports = getReportsForRoad(batchRoadKey);
    const roadPatches = getPatchesForRoad(batchRoadKey);
    const unassignedReports = roadReports.filter((r) => !r.contractorId && r.status !== "Pending Verification");
    const unassignedPatches = roadPatches.filter((p) => !p.contractorId && p.status !== "Pending Verification");
    
    if (unassignedReports.length === 0 && unassignedPatches.length === 0) return;
    
    const contractor = DUMMY_CONTRACTORS.find((c) => c.id === batchContractorId);
    
    // Assign potholes
    setReports((prev) =>
      prev.map((r) =>
        unassignedReports.some((u) => u.id === r.id)
          ? {
              ...r,
              contractorId: batchContractorId,
              status: "Assigned"
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
              status: "Assigned"
            }
          : p
      )
    );
    closeBatchModal();
  };

  const doBatchVerify = () => {
    if (!batchRoadKey) return;
    
    const roadReports = getReportsForRoad(batchRoadKey);
    const roadPatches = getPatchesForRoad(batchRoadKey);
    const pendingReports = roadReports.filter((r) => r.status === "Pending Verification");
    const pendingPatches = roadPatches.filter((p) => p.status === "Pending Verification");
    
    console.debug("doBatchVerify => roadKey", batchRoadKey, "pendingReports", pendingReports.length, "pendingPatches", pendingPatches.length);
    if (pendingReports.length === 0 && pendingPatches.length === 0) return;
    
    // Move all potholes to history
    pendingReports.forEach((r) => {
      console.debug("doBatchVerify: push report", r.id, r.roadName);
      pushToHistory(r);
    });
    
    // Move all patches to history
    pendingPatches.forEach((p) => {
      const contractor = DUMMY_CONTRACTORS.find(
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
    
    // Remove from reports and patches - this will trigger re-grouping
    setReports((prev) => {
      const filtered = prev.filter((r) => !pendingReports.some((pv) => pv.id === r.id));
      return filtered;
    });
    setPatches((prev) => {
      const filtered = prev.filter((p) => !pendingPatches.some((pv) => pv.id === p.id));
      return filtered;
    });
    
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
          <span className="pill success">
            {loadingRoads ? "Loading roads..." : "Online"}
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
                  <th>No. of Potholes</th>
                  <th>No. of Patches</th>
                  <th>Average Severity</th>
                  <th>Average Reported Time</th>
                  <th>Status</th>
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
                        } else {
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
                        }
                      })()}
                    </td>
                  </tr>
                ))}
                {currentRows.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
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
                          const contractor = report.contractorId
                            ? DUMMY_CONTRACTORS.find((c) => c.id === report.contractorId)
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
                            ? DUMMY_CONTRACTORS.find((c) => c.id === pt.contractorId)
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
                ? DUMMY_CONTRACTORS.find((c) => c.id === r.contractorId)
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
                        <img
                          className="proof-img"
                          src={DUMMY_VERIFICATION[r?.id]?.imageUrl}
                          alt="Proof"
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
                          {DUMMY_VERIFICATION[r?.id]?.completedAt || "--"}
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
                            {DUMMY_CONTRACTORS.map((c) => (
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
                  {DUMMY_CONTRACTORS.map((c) => (
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
          ? DUMMY_CONTRACTORS.find((c) => c.id === firstPending.contractorId)
          : null;
        const proof = firstPending ? DUMMY_VERIFICATION[firstPending.id] : null;
        
        return (
          <div className="modal-overlay" onClick={closeBatchModal}>
            <div className="modal-fullscreen" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">View Proof - {batchRoadKey}</h3>
                  <p className="muted">Verify all completed repairs on this road</p>
                </div>
                <button className="btn-outline" onClick={closeBatchModal}>✕</button>
              </div>

              {proof && (
                <div className="modal-section">
                  <img className="proof-img" src={proof.imageUrl} alt="Proof" />
                </div>
              )}

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
                <div className="field-box">{proof?.completedAt || "--"}</div>
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
