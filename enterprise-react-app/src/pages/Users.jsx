export default function Users() {
  return (
    <div>
      <div className="page-header">
        <p className="page-header-eyebrow">React Enterprise · Placeholder</p>
        <h1 className="page-header-title" style={{ marginBottom: 0 }}>User Management</h1>
      </div>
      <div className="info-bar">
        <span className="react-badge">⚛ React 18</span>
        <span className="info-bar-sep">·</span>
        <span className="info-bar-item">Not yet implemented</span>
      </div>
      <div className="placeholder-wrap">
        <div className="placeholder-card" style={{ borderTopColor: '#6366f1' }}>
          <div className="placeholder-icon">👥</div>
          <p className="placeholder-eyebrow" style={{ color: '#6366f1' }}>React Enterprise</p>
          <h2 className="placeholder-title">User Management</h2>
          <div className="placeholder-divider"></div>
          <p className="placeholder-desc">
            This module will provide enterprise user management — user provisioning,
            role-based access control, and permission management for the React portal.
          </p>
          <span className="placeholder-tag">Placeholder — not yet implemented</span>
        </div>
      </div>
    </div>
  );
}
