// ── Enterprise App Module Federation Configuration (Angular 18 host) ────────
// Angular packages intentionally excluded from shared — host (Angular 18) and
// MFE (Angular 20) must load fully independent runtimes.

const { share } = require('@angular-architects/module-federation/webpack');

const mfConfig = {
  remotes: {
    disputes_mfe: 'disputes_mfe@http://localhost:4201/remoteEntry.js'
  },

  shared: share({
    // Angular 18 packages shared for enterprise-app's own components.
    // Safe because disputes-mfe bundles its own Angular 20 and does not
    // participate in this shared scope.
    '@angular/core':                     { singleton: true, strictVersion: false, requiredVersion: 'auto' },
    '@angular/common':                   { singleton: true, strictVersion: false, requiredVersion: 'auto' },
    '@angular/router':                   { singleton: true, strictVersion: false, requiredVersion: 'auto' },
    '@angular/forms':                    { singleton: true, strictVersion: false, requiredVersion: 'auto' },
    '@angular/platform-browser':         { singleton: true, strictVersion: false, requiredVersion: 'auto' },
    '@angular/platform-browser-dynamic': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
    'rxjs':                              { singleton: true, strictVersion: false, requiredVersion: 'auto' }
  })
};

module.exports = mfConfig;
