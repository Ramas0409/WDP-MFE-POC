// Dynamic import defers React imports until after the Module Federation runtime
// has negotiated shared modules — same pattern as the Angular hosts' main.ts.
import('./bootstrap').catch(err =>
  console.error('[enterprise-react-app] Bootstrap error:', err)
);
