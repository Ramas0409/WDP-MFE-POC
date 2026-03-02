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
        // ── PoC NOTE (Option B — upgrade to Option A before production) ────────
        // Angular packages are intentionally NOT shared so this single build can
        // be consumed by hosts of any Angular version (Angular 18, 20, etc.).
        // The MFE always bundles and runs its own Angular 20 runtime.
        //
        // Option A (production target): create a second webpack config
        // (webpack.config.shared.js) that DOES share Angular with singleton:true,
        // serve it on a separate port (e.g. 4204), and point same-version hosts
        // (wdp-shell Angular 20) at that build. Cross-version hosts (enterprise-app
        // Angular 18) keep pointing at this build on port 4201.
        // ────────────────────────────────────────────────────────────────────────
        'rxjs': { singleton: true, strictVersion: false, requiredVersion: 'auto' }
        // zone.js excluded from shared — loaded via polyfills synchronously,
        // before MF runtime initialises.
      })
    })
  );

  console.log('[webpack.config.js] plugins after:', config.plugins.length);
  console.log('[webpack.config.js] ModuleFederationPlugin added\n');

  return config;
};
