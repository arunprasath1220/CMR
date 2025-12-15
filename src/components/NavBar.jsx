import { NavLink } from "react-router-dom";
import "../App.css";

function NavBar() {
  const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <nav className="nav">
      <div className="brand">
        <span className="brand-mark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1C7.58 1 4 4.58 4 9c0 6 8 14 8 14s8-8 8-14c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="white"/>
          </svg>
        </span>
        <span className="brand-text">
          <strong>Pothole Management</strong>
          <span className="brand-subtitle">Government Admin Portal</span>
        </span>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={linkClass}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
            </svg>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/graph" className={linkClass}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor"/>
            </svg>
            Map View
          </NavLink>
        </li>
        <li>
          <NavLink to="/history" className={linkClass}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" fill="currentColor"/>
            </svg>
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
