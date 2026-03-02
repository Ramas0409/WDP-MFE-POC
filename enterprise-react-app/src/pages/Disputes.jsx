import { useEffect, useRef, useState } from 'react';

// appContext injected into the Angular Elements MFE from this React host.
const appContext = {
  appName:      'enterprise-react-corp',
  getToken:     () => Promise.resolve('react-enterprise-bearer-token-mock'),
  userId:       'react-user-001',
  tenantId:     'react-enterprise-tenant',
  userRoles:    ['admin', 'dispute-viewer', 'react-consumer'],
  shellVersion: 'React 18'
};

export default function Disputes() {
  const containerRef = useRef(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1️⃣  Load the MFE inside Zone.root so Angular's createApplication()
        //     finds zone.js already patched and runs in the root zone (no NG0908).
        await new Promise((resolve, reject) => {
          Zone.root.run(() => {
            import('disputes_mfe/DisputesElement')
              .then(() => customElements.whenDefined('wdp-disputes'))
              .then(resolve)
              .catch(reject);
          });
        });

        // 2️⃣  Custom element is now registered.

        if (!mounted || !containerRef.current) return;

        // 3️⃣  Create the element and set appContext as a DOM property.
        //     This is plain Web Components API — React or any framework can do this.
        const el = document.createElement('wdp-disputes');
        el.appContext = appContext;

        // 4️⃣  Mount into the React DOM via a ref.
        containerRef.current.appendChild(el);

        if (mounted) setLoading(false);
      } catch (err) {
        if (mounted) {
          setError(
            `Failed to load disputes MFE:\n\n${err instanceof Error ? err.stack : String(err)}\n\n` +
            'Make sure disputes-mfe is running on http://localhost:4201'
          );
          setLoading(false);
        }
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div>

      {/* Page header */}
      <div className="page-header">
        <p className="page-header-eyebrow">React Enterprise · Module Federation</p>
        <h1 className="page-header-title" style={{ marginBottom: 0 }}>
          Disputes{' '}
          <span style={{ fontSize: 14, fontWeight: 400, color: '#8b949e' }}>
            — Angular Elements Web Component loaded into React
          </span>
        </h1>
      </div>

      {/* Info bar */}
      <div className="info-bar">
        <span className="react-badge">⚛ React 18</span>
        <span className="info-bar-sep">·</span>
        <span className="info-bar-item">
          loads <span style={{ color: '#10b981' }}>wdp-disputes</span> from port 4201
        </span>
        <span className="info-bar-sep">·</span>
        <span style={{ fontSize: 12, color: '#C9921A' }}>
          appName: enterprise-react-corp
        </span>
      </div>

      <div style={{ padding: 20 }}>
        {loading && (
          <p style={{ color: '#8b949e', fontStyle: 'italic', fontSize: 14 }}>
            Loading wdp-disputes element…
          </p>
        )}
        {error && (
          <pre style={{ color: '#f85149', background: '#0d1117', padding: 16,
                        borderRadius: 6, fontSize: 12, overflowX: 'auto',
                        border: '1px solid #21262d' }}>
            {error}
          </pre>
        )}
        <div ref={containerRef} />
      </div>

    </div>
  );
}
