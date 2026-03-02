/**
 * MFE entry point.
 *
 * For Webpack Module Federation, this file is the webpack entry chunk.
 * It defers to bootstrap.ts via a dynamic import to ensure that shared
 * modules (Angular core, zone.js, etc.) are negotiated with the shell
 * BEFORE the application boots.  This prevents the "eager consumption"
 * of shared modules error that is common in MF setups.
 */
import('./bootstrap').catch((err) =>
  console.error('[disputes-mfe] Bootstrap error:', err)
);
