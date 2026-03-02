// ── Shell Webpack Configuration ────────────────────────────────────────────
// Exports a FUNCTION so @angular-builders/custom-webpack passes Angular's
// base webpack config directly — no merge algorithm involved.

const path = require('path');
const { share } = require('@angular-architects/module-federation/webpack');

// Resolve ModuleFederationPlugin from @angular-builders/custom-webpack's own
// webpack copy (5.94.x) to avoid the two-instance Compilation class mismatch.
const customWebpackDir = path.dirname(
  require.resolve('@angular-builders/custom-webpack/package.json')
);
const webpack = require(path.join(customWebpackDir, 'node_modules/webpack'));
const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;

module.exports = (config) => {
  config.plugins.push(
    new ModuleFederationPlugin({
      // Shell is a HOST — no name/filename/exposes needed.
      remotes: {
        // Format: '<windowGlobalName>@<remoteEntryUrl>'
        disputes_mfe: 'disputes_mfe@http://localhost:4201/remoteEntry.js'
      },

      shared: share({
        // ── PoC NOTE (Option B — upgrade to Option A before production) ────────
        // disputes-mfe currently bundles its own Angular (does not offer Angular
        // into the shared scope). These entries below are used solely by wdp-shell
        // itself and have no effect on the MFE's runtime.
        //
        // Option A (production target): disputes-mfe will have a second build
        // (webpack.config.shared.js, port 4204) that DOES offer Angular 20 into
        // the shared scope. At that point wdp-shell should point at port 4204 so
        // the two Angular 20 runtimes can be de-duplicated here.
        // ────────────────────────────────────────────────────────────────────────
        '@angular/core':                     { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/common':                   { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/router':                   { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/platform-browser':         { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/platform-browser-dynamic': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        'rxjs':                              { singleton: true, strictVersion: false, requiredVersion: 'auto' }
        // zone.js excluded from shared — loaded via polyfills synchronously.
      })
    })
  );

  return config;
};
