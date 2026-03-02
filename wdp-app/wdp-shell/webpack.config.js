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
        '@angular/core':                     { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/common':                   { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/router':                   { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/platform-browser':         { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/platform-browser-dynamic': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        'rxjs':                              { singleton: true, strictVersion: false, requiredVersion: 'auto' }
        // zone.js is intentionally excluded from shared — it is loaded via the
        // polyfills bundle (synchronously, before MF runtime initialises) and
        // sharing it through the async MF scope causes "eager consumption" errors.
      })
    })
  );

  return config;
};
