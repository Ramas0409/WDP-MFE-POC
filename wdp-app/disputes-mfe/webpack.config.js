// ── Disputes MFE Webpack Configuration ────────────────────────────────────

const path = require('path');
const { share } = require('@angular-architects/module-federation/webpack');

// Resolve ModuleFederationPlugin from @angular-builders/custom-webpack's own
// webpack copy (5.94.x) to avoid the two-instance Compilation class mismatch.
// Using the top-level webpack (5.105.x) causes:
//   TypeError: The 'compilation' argument must be an instance of Compilation
const customWebpackDir = path.dirname(
  require.resolve('@angular-builders/custom-webpack/package.json')
);
const webpack = require(path.join(customWebpackDir, 'node_modules/webpack'));
const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;

console.log('\n[webpack.config.js] LOADED — ModuleFederationPlugin will be applied\n');

module.exports = (config) => {
  console.log('\n[webpack.config.js] CONFIG FUNCTION CALLED');
  console.log('[webpack.config.js] plugins before:', (config.plugins || []).length);

  // Tell webpack all chunk URLs for this remote are absolute on port 4201.
  // Without this the shell tries to fetch MFE lazy chunks from localhost:4200
  // and gets 404s (ChunkLoadError).
  config.output = config.output || {};
  config.output.publicPath = 'http://localhost:4201/';

  // Prevent the MFE dev-server client from being embedded in remote chunks.
  // Without this the shell page opens a second WDS websocket to port 4201 and
  // reloads every time the MFE recompiles (infinite reload loop).
  config.devServer = config.devServer || {};
  config.devServer.client = false;

  config.optimization = config.optimization || {};
  config.optimization.runtimeChunk = false;

  config.plugins = config.plugins || [];
  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'disputes_mfe',
      library: { type: 'var', name: 'disputes_mfe' },
      filename: 'remoteEntry.js',
      exposes: {
        './DisputesElement': './src/bootstrap.ts'
      },
      shared: share({
        '@angular/core':                     { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/common':                   { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/platform-browser':         { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/platform-browser-dynamic': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/elements':                 { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        'rxjs':                              { singleton: true, strictVersion: false, requiredVersion: 'auto' }
        // zone.js excluded from shared — loaded via polyfills synchronously,
        // before MF runtime initialises. Zone.js is idempotent so both shell
        // and MFE loading it independently is safe.
      })
    })
  );

  console.log('[webpack.config.js] plugins after:', config.plugins.length);
  console.log('[webpack.config.js] ModuleFederationPlugin added\n');

  return config;
};
