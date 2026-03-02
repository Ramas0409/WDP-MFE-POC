// ── Enterprise App Module Federation Configuration ──────────────────────────
// The enterprise app declares the disputes-mfe as a remote.
// It shares Angular core libraries so they are loaded only once.

const { share } = require('@angular-architects/module-federation/webpack');

/** @type {import('@angular-architects/module-federation/webpack').ModuleFederationConfig} */
const mfConfig = {
  // Enterprise app acts as a HOST — no name / exposes needed here.
  remotes: {
    // Key must match the `remoteName` used in loadRemoteModule() calls.
    // Value: "<globalName>@<remoteEntryUrl>"
    disputes_mfe: 'disputes_mfe@http://localhost:4201/remoteEntry.js'
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
    '@angular/router': {
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
