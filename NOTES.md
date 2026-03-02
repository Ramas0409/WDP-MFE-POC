# WDP Micro-Frontend PoC — Webpack + Angular 20 Notes

## Architecture Overview

```
localhost:4200  (shell)
  └─ /disputes route
       └─ DisputesWrapperComponent
            └─ loadRemoteModule({ type:'script', remoteEntry: 'http://localhost:4201/remoteEntry.js' })
                  └─ executes disputes-mfe/src/bootstrap.ts
                        └─ createApplication() → createCustomElement() → customElements.define('wdp-disputes')
                              └─ <wdp-disputes> mounted in shell DOM with .appContext = { ... }

localhost:4201  (disputes-mfe)   — serves remoteEntry.js
localhost:3001  (mock-api)       — serves GET /disputes
```

---

## Setup Instructions

### 1. Install dependencies

```bash
# Root (provides `concurrently` for parallel start)
npm install

# mock-api — no Angular, no peer-dep issues
npm install --prefix mock-api

# disputes-mfe and shell — Angular 20 + @angular-architects MF
# Use --legacy-peer-deps because @angular-architects/module-federation
# peer deps may lag Angular 20 by a release cycle.
npm install --prefix disputes-mfe --legacy-peer-deps
npm install --prefix shell --legacy-peer-deps
```

### 2. Start all three servers (separate terminals)

```bash
# Terminal 1
cd mock-api && npm start

# Terminal 2
cd disputes-mfe && npm start

# Terminal 3
cd shell && npm start
```

Or from the repo root (requires concurrently):

```bash
npm run start:all
```

---

## Verification Checklist

| Test | Expected |
|------|----------|
| `http://localhost:4200` loads | Shell app with Ionic nav bar |
| Navigate to `/disputes` | "Loading wdp-disputes element…" briefly, then element renders |
| `appName` visible | `enterprise-app-a` |
| `userId` visible | `user-001` |
| `tenantId` visible | `tenant-001` |
| `userRoles` visible | `dispute-viewer`, `dispute-responder` badges |
| `getToken()` row | ✓ Token received: `mock-bearer-token-initial` |
| Angular version | `v20.x.x` in red |
| Disputes table | 3 rows from mock-api |
| mock-api terminal | Shows `GET /disputes` log line |

---

## Known Issues with Webpack + Angular 20

### 1. Builder availability
Angular 20 defaults to the **esbuild** (`application`) builder. The webpack path requires
`@angular-architects/module-federation:build`. This package may not yet have a v20 release
matching Angular 20's peer dependency range.

**Fix:** Install with `--legacy-peer-deps` and verify that the package works functionally.
If the build fails, pin Angular to `^19.0.0` in both `package.json` files and re-install.

### 2. `@angular-devkit/build-angular:browser` removal
In Angular 17, the `browser` builder was deprecated. It may be fully removed in Angular 20.
`@angular-architects/module-federation:build` provides its own webpack-based builder, so
this is only an issue if you try to use `browser` directly.

### 3. "Eager consumption of shared modules" error
This happens when `main.ts` imports application code **before** webpack negotiates shared
modules. The fix is in place: `main.ts` uses `import('./bootstrap')` (dynamic, lazy),
not `import { ... } from './bootstrap'` (static, eager).

### 4. Zone.js shared singleton
Both shell and MFE share `zone.js` as a singleton (`singleton: true`). If zone.js is
loaded twice, Angular change detection breaks. Verify in the Network tab that only one
`zone.js` chunk loads.

### 5. `strictVersion: false`
Both webpack configs use `strictVersion: false` to prevent hard failures if the shell and
MFE resolve slightly different patch versions of shared Angular packages. Set to `true`
only after confirming identical version pins across both `package.json` files.

### 6. Custom element property vs attribute
`appContext` contains a `getToken` function — it **cannot** be serialised as an HTML
attribute. It must be set as a **DOM property**:

```typescript
// ✅ Correct — property (object preserved as-is)
el.appContext = { getToken: () => Promise.resolve('...'), ... };

// ❌ Wrong — attribute (function becomes "[object Object]")
el.setAttribute('app-context', JSON.stringify({ ... }));
```

### 7. ChangeDetectorRef after async in Angular Elements
`createApplication()` uses `OnPush` change detection inside Angular Elements. After any
`await` in `ngOnChanges`, manually call `this.cdr.markForCheck()` or the view won't update.
This is already handled in `AppComponent.resolveToken()` and `fetchDisputes()`.

### 8. Ionic + Webpack compatibility
Ionic 8 uses tree-shakeable standalone imports. The shell imports individual Ionic components
(`IonApp`, `IonRouterOutlet`, etc.) rather than `IonicModule`. Confirm that `@ionic/angular`
v8.x declares Angular 20 as a valid peer dependency; if not, install with `--legacy-peer-deps`.

---

## Module Federation Config Reference

### Shell (`shell/module-federation.config.js`)
```
HOST — no name/exposes
remotes: { disputes_mfe: 'disputes_mfe@http://localhost:4201/remoteEntry.js' }
```

### MFE (`disputes-mfe/module-federation.config.js`)
```
REMOTE — name: 'disputes_mfe'
filename: 'remoteEntry.js'
exposes: { './DisputesElement': './src/bootstrap.ts' }
```

### Shell load call (`disputes-wrapper.component.ts`)
```typescript
await loadRemoteModule({
  type: 'script',                              // Webpack MF (not native ESM)
  remoteEntry: 'http://localhost:4201/remoteEntry.js',
  remoteName: 'disputes_mfe',                  // must match remote name above
  exposedModule: './DisputesElement'           // must match exposes key above
});
```

---

## File Structure

```
wdp-webpack-poc/
├── package.json
├── NOTES.md                       ← you are here
├── mock-api/
│   ├── package.json
│   └── server.js
├── shell/
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json / tsconfig.app.json
│   ├── webpack.config.js
│   ├── module-federation.config.js
│   └── src/
│       ├── index.html / main.ts / styles.scss
│       └── app/
│           ├── app.component.ts / .html
│           ├── app.config.ts
│           ├── app.routes.ts
│           └── disputes/
│               └── disputes-wrapper.component.ts   ← WebComponentWrapper pattern
└── disputes-mfe/
    ├── angular.json
    ├── package.json
    ├── tsconfig.json / tsconfig.app.json
    ├── webpack.config.js
    ├── module-federation.config.js
    └── src/
        ├── index.html / main.ts / styles.scss
        ├── bootstrap.ts                            ← exposed MF module
        └── app/
            ├── app.component.ts                    ← reads appContext, calls getToken
            └── app.component.html                  ← displays all 5 fields + disputes table
```
