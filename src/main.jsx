import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Refresh localStorage ONLY on full page reloads (not in-app navigation)
try {
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  const isReload = (nav && nav.type === 'reload') || (performance?.navigation?.type === 1);
  if (isReload) {
    // Clear all app data; adjust if you prefer targeted keys
    localStorage.clear();
  }
} catch (_) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
