// ── Disputes MFE Module Federation Configuration ───────────────────────────
// The MFE acts as a REMOTE — it exposes a module that registers the
// 'wdp-disputes' custom element when imported by the shell.

const { share } = require('@angular-architects/module-federation/webpack');

/** @type {import('@angular-architects/module-federation/webpack').ModuleFederationConfig} */
const mfConfig = {
  // Must match the key used in the shell's remotes config and loadRemoteModule.
  name: 'disputes_mfe',

  // 'var' registers the container as window.disputes_mfe so the shell can load
  // it with loadRemoteModule({ type: 'script' }).
  // The default 'module' type uses ES module output which is incompatible with
  // the script-tag loading approach used by @angular-architects/module-federation.
  library: { type: 'var', name: 'disputes_mfe' },

  // The filename of the remote entry file that webpack emits.
  filename: 'remoteEntry.js',

  exposes: {
    // The key must match `exposedModule` in the shell's loadRemoteModule call.
    // The value is the module that registers the 'wdp-disputes' custom element.
    './DisputesElement': './src/bootstrap.ts'
  },

  shared: share({
    '@angular/core': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto'
    },
    '@angular/common': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto'
    },
    '@angular/platform-browser': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto'
    },
    '@angular/platform-browser-dynamic': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto'
    },
    '@angular/elements': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto'
    },
    'rxjs': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto'
    },
    'zone.js': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto'
    }
  })
};

module.exports = mfConfig;
