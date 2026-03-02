export default function Org() {
  return (
    <div>
      <div className="page-header">
        <p className="page-header-eyebrow">React Enterprise · Placeholder</p>
        <h1 className="page-header-title" style={{ marginBottom: 0 }}>Org Management</h1>
      </div>
      <div className="info-bar">
        <span className="react-badge">⚛ React 18</span>
        <span className="info-bar-sep">·</span>
        <span className="info-bar-item">Not yet implemented</span>
      </div>
      <div className="placeholder-wrap">
        <div className="placeholder-card" style={{ borderTopColor: '#6366f1' }}>
          <div className="placeholder-icon">🏢</div>
          <p className="placeholder-eyebrow" style={{ color: '#6366f1' }}>React Enterprise</p>
          <h2 className="placeholder-title">Org Management</h2>
          <div className="placeholder-divider"></div>
          <p className="placeholder-desc">
            This module will provide organisation management — corporate structure,
            department hierarchy, tenant configuration, and enterprise settings.
          </p>
          <span className="placeholder-tag">Placeholder — not yet implemented</span>
        </div>
      </div>
    </div>
  );
}
