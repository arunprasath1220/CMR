import { NavLink } from "react-router-dom";
import "../App.css";

function NavBar() {
  const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <nav className="nav">
      <div className="brand">
        <span className="brand-mark">CMR</span>
        <span className="brand-text">
          <strong>Pothole</strong>
          <span className="muted">Detection Suite</span>
        </span>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/graph" className={linkClass}>
            Graph
          </NavLink>
        </li>
        <li>
          <NavLink to="/history" className={linkClass}>
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
