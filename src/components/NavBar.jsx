import { NavLink } from "react-router-dom";
import "./NavBar.css";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PublicIcon from "@mui/icons-material/Public";
import HistoryIcon from "@mui/icons-material/History";
import LocationOnIcon from "@mui/icons-material/LocationOn";

function NavBar() {
  const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <nav className="nav">
      <div className="brand">
        <span className="brand-mark">
          <LocationOnIcon sx={{ width: 24, height: 24 }} />
        </span>
        <span className="brand-text">
          <strong>Pothole Management</strong>
          <span className="brand-subtitle">Government Admin Portal</span>
        </span>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={linkClass}>
            <DashboardOutlinedIcon sx={{ width: 18, height: 18 }} />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/graph" className={linkClass}>
            <PublicIcon sx={{ width: 18, height: 18 }} />
            Map View
          </NavLink>
        </li>
        <li>
          <NavLink to="/history" className={linkClass}>
            <HistoryIcon sx={{ width: 18, height: 18 }} />
            History
          </NavLink>
        </li>
      </ul>

      <a className="cta" href="#" aria-label="Create new report">
        New report
      </a>
    </nav>
  );
}

export default NavBar;
