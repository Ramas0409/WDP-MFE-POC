import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>

      {/* Page header */}
      <div className="page-header">
        <p className="page-header-eyebrow">React Enterprise · Host Application</p>
        <h1 className="page-header-title">React Enterprise App</h1>
        <p className="page-header-desc">
          A <strong style={{ color: '#fff' }}>React 18</strong> host application consuming the
          same <strong style={{ color: '#fff' }}>disputes-mfe</strong> loaded by the Angular hosts —
          via <strong style={{ color: '#fff' }}>Webpack Module Federation</strong>. The MFE is an
          Angular Elements Web Component, completely framework-agnostic. React renders it
          as a native DOM element with its own <code style={{ background: 'rgba(255,255,255,.1)',
          padding: '1px 6px', borderRadius: 3, fontSize: 13 }}>appContext</code>.
        </p>
      </div>

      {/* Info bar */}
      <div className="info-bar">
        <span className="react-badge">⚛ React 18</span>
        <span className="info-bar-sep">·</span>
        <span className="info-bar-item">Webpack 5 Module Federation HOST</span>
        <span className="info-bar-sep">·</span>
        <span style={{ fontSize: 12, color: '#10b981' }}>Port 4203</span>
        <span className="info-bar-sep">·</span>
        <span className="info-bar-item">No Angular, No Ionic</span>
      </div>

      {/* PoC architecture callout */}
      <div style={{ margin: '24px 24px 0', background: '#0d1117', borderRadius: 8,
                    padding: '14px 18px', border: '1px solid #21262d',
                    borderLeft: '4px solid #10b981' }}>
        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '.08em', color: '#10b981' }}>
          PoC Architecture — Framework Agnostic MFE
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'WDP Shell',       fw: 'Angular + Ionic', port: '4200', color: '#3880ff' },
            { label: 'Enterprise Corp', fw: 'Angular + Ionic', port: '4202', color: '#C9921A' },
            { label: 'React Enterprise',fw: 'React 18',        port: '4203', color: '#10b981', active: true },
          ].map(h => (
            <div key={h.port} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%',
                             background: h.active ? '#10b981' : '#21262d',
                             border: `2px solid ${h.color}`, flexShrink: 0 }}></span>
              <span style={{ fontSize: 12, color: h.active ? '#e6edf3' : '#8b949e' }}>
                {h.label}
              </span>
              <span style={{ fontSize: 11, color: h.color }}>:{h.port}</span>
              <span style={{ fontSize: 11, color: '#484f58' }}>({h.fw})</span>
            </div>
          ))}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: '#8b949e' }}>
          All three consume <span style={{ color: '#10b981' }}>disputes-mfe :4201</span> —
          same Angular Elements Web Component, different framework hosts, different appContext.
        </p>
      </div>

      {/* Section cards */}
      <p style={{ margin: '24px 24px 12px', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '.1em', color: '#94a3b8' }}>
        Modules
      </p>
      <div className="cards-grid" style={{ paddingTop: 0 }}>

        <Link to="/disputes" className="card">
          <div className="card-icon">⚖️</div>
          <p className="card-title">Disputes</p>
          <p className="card-desc">
            Angular Elements Web Component loaded via Module Federation into this React app.
            Proves framework-agnostic MFE consumption.
          </p>
          <span className="card-link">Angular Elements · port 4201 →</span>
        </Link>

        <Link to="/transactions" className="card" style={{ borderTopColor: '#10b981' }}>
          <div className="card-icon">🔍</div>
          <p className="card-title">Transaction Search</p>
          <p className="card-desc">
            Search payment history, audit trails, and transaction records across the enterprise.
          </p>
          <span className="card-link" style={{ color: '#10b981' }}>Placeholder →</span>
        </Link>

      </div>
    </div>
  );
}
