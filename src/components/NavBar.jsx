import { NavLink } from "react-router-dom";
import "../App.css";

function NavBar() {
  return (
    <nav className="nav">
      <h1 className="logo">CMR Pothole</h1>
      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/graph" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Graph
          </NavLink>
        </li>
        <li>
          <NavLink to="/history" className={({ isActive }) => (isActive ? "active" : undefined)}>
            History
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
