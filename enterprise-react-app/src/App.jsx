import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Disputes from './pages/Disputes';
import Transactions from './pages/Transactions';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-logo">⚛</span>
            <div>
              <div className="sidebar-brand-name">React Enterprise</div>
              <div className="sidebar-brand-sub">MFE Host · Port 4203</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/home" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              <span className="nav-icon">🏠</span> Home
            </NavLink>
            <NavLink to="/disputes" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              <span className="nav-icon">⚖️</span> Disputes
            </NavLink>
            <NavLink to="/transactions" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              <span className="nav-icon">🔍</span> Transaction Search
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <span className="react-badge">⚛ React 18</span>
            <span className="mf-badge">· Webpack MF</span>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="main-content">
          <Routes>
            <Route path="/"          element={<Navigate to="/home" replace />} />
            <Route path="/home"      element={<Home />} />
            <Route path="/disputes"  element={<Disputes />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="*"          element={<Navigate to="/home" replace />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}
