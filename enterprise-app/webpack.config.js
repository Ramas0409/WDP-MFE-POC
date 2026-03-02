// ── Enterprise App Webpack Configuration (Angular 18 host) ──────────────────
// Angular 18 host consuming Angular 20 disputes-mfe via Module Federation.
// Angular packages are NOT shared — each app runs its own complete Angular
// runtime to avoid Ivy instruction set conflicts between v18 and v20.

const path = require('path');
const { share } = require('@angular-architects/module-federation/webpack');

// @angular-builders/custom-webpack@18 does not nest webpack under its own
// node_modules (unlike v20). Try the nested path first for safety, then fall
// back to the hoisted copy which is the one the Angular 18 toolchain actually uses.
function resolveWebpack() {
  try {
    const dir = path.dirname(require.resolve('@angular-builders/custom-webpack/package.json'));
    return require(path.join(dir, 'node_modules/webpack'));
  } catch {
    return require('webpack');
  }
}
const webpack = resolveWebpack();
const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;

module.exports = (config) => {
  // @angular-builders/custom-webpack@18 creates a broken @babel/runtime alias
  // pointing to a nested path that does not exist in the Angular 18 install tree
  // (it is hoisted). Override it with the real resolved path.
  try {
    const cwDir = path.dirname(require.resolve('@angular-builders/custom-webpack/package.json'));
    const brokenPath = path.join(cwDir, 'node_modules', '@babel', 'runtime');
    const realPath   = path.dirname(require.resolve('@babel/runtime/package.json'));
    config.resolve           = config.resolve         || {};
    config.resolve.alias     = config.resolve.alias   || {};
    config.resolve.alias[brokenPath] = realPath;
  } catch { /* @babel/runtime not resolvable — skip */ }

  config.plugins.push(
    new ModuleFederationPlugin({
      // HOST — no name / exposes
      remotes: {
        disputes_mfe: 'disputes_mfe@http://localhost:4201/remoteEntry.js'
      },

      shared: share({
        // Angular 18 packages shared for enterprise-app's own components.
        // Safe to share because disputes-mfe (Angular 20) does NOT declare
        // Angular in its shared scope — it bundles its own Angular 20 runtime
        // and never touches this shared Angular 18 scope.
        '@angular/core':                     { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/common':                   { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/router':                   { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/forms':                    { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/platform-browser':         { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/platform-browser-dynamic': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        'rxjs':                              { singleton: true, strictVersion: false, requiredVersion: 'auto' }
      })
    })
  );

  config.devServer = {
    ...(config.devServer || {}),
    historyApiFallback: true
  };

  return config;
};
