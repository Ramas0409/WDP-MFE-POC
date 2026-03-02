# disputes-mfe — File-by-File Explainer

## Table of Contents

1. [package.json](#1-packagejson)
2. [package-lock.json](#2-package-lockjson)
3. [tsconfig.json](#3-tsconfigjson)
4. [tsconfig.app.json](#4-tsconfigappjson)
5. [angular.json](#5-angularjson)
6. [module-federation.config.js](#6-module-federationconfigjs)
7. [webpack.config.js](#7-webpackconfigjs)
8. [src/main.ts](#8-srcmaints)
9. [src/bootstrap.ts](#9-srcbootstrapts)
10. [src/app/app.component.ts](#10-srcappappcomponentts)
11. [src/app/app.component.html](#11-srcappappcomponenthtml)
12. [src/styles.scss](#12-srcstylesday)
13. [src/index.html](#13-srcindexhtml)

---

## Overview

This MFE's only job is to register a custom HTML element (`<wdp-disputes>`) that the shell
can drop into the DOM. The architecture is:

```
Browser
 └─ shell (port 4200) — HOST
      └─ loads disputes-mfe (port 4201) — REMOTE
           └─ registers <wdp-disputes> via Angular Elements
```

**Boot sequence:**
```
main.ts (webpack entry)
  └─ dynamic import('./bootstrap')   ← MF runtime negotiates shared modules first
       └─ createApplication()        ← Angular platform boots
       └─ createCustomElement()      ← AppComponent wrapped as Web Component
       └─ customElements.define()    ← 'wdp-disputes' registered in browser
            └─ AppComponent          ← renders UI, fetches data, consumes appContext
```

---

## 1. `package.json`

### `name`, `version`, `private`

```json
"name": "disputes-mfe",
"version": "0.0.0",
"private": true
```

- `name` — identifies this package; used by Angular CLI to refer to this project.
- `version: "0.0.0"` — PoC placeholder. In a real product this follows semver.
- `private: true` — prevents accidental publish to npm. Standard for app packages.

### `scripts`

```json
"start": "ng serve --port 4201",
"build": "ng build",
"watch":  "ng build --watch --configuration development"
```

- `start` — dev server on **port 4201**. Fixed because the shell hardcodes
  `http://localhost:4201/remoteEntry.js` in its webpack config.
- `build` — production build to `dist/disputes-mfe/`.
- `watch` — incremental dev build with no server; useful for inspecting generated files.

### `dependencies` — runtime (shipped to browser)

| Package | Purpose |
|---|---|
| `@angular/common` | Angular built-in pipes, directives |
| `@angular/compiler` | Runtime compilation (needed by AOT + JIT fallback) |
| `@angular/core` | Core Angular framework |
| `@angular/elements` | **Key** — `createCustomElement()` bridge to Web Components API |
| `@angular/platform-browser` | Browser DOM adapter Angular needs to render |
| `@angular/platform-browser-dynamic` | Needed by `createApplication()` internally |
| `rxjs` | Angular's reactive primitives; `~7.8.0` = patch-only pin |
| `tslib` | TypeScript helper functions (reduces bundle size with `importHelpers: true`) |
| `wdp-webpack-poc` | Root workspace package reference (`file:..`) |
| `zone.js` | Change detection monkey-patching; must load synchronously before MF runtime |

**No `@ionic/angular`** — the MFE renders plain HTML. Ionic is a shell-only concern.

### `devDependencies` — build-time only

| Package | Purpose |
|---|---|
| `@angular-architects/module-federation` | `share()` helper for MF shared config |
| `@angular-builders/custom-webpack` | Injects `webpack.config.js` into Angular's build |
| `@angular-devkit/build-angular` | Angular core build infrastructure |
| `@angular/cli` | The `ng` command |
| `@angular/compiler-cli` | AOT compiler (`ngc`) |
| `typescript` | TypeScript compiler; `~5.8.0` = tight patch-only pin |

---

## 2. `package-lock.json`

A **generated file** — never manually edited. Records the exact resolved version of every
installed package so `npm install` is byte-for-byte identical on every machine and in CI.

### Structure

```json
{
  "lockfileVersion": 3,        // npm 7+ format
  "packages": {
    "": { ... },               // the root package (mirrors package.json)
    "node_modules/foo": {
      "version": "1.2.3",      // exact resolved version
      "resolved": "https://...",// registry tarball URL
      "integrity": "sha512-...",// hash for tamper detection
      ...
    }
  }
}
```

### Why 17,000+ lines for ~10 direct dependencies

Each dependency has its own dependencies. Angular alone pulls in dozens of transitive
packages. Every single one gets a locked entry.

### When you interact with it

| Situation | Action |
|---|---|
| Fresh clone | `npm install` — reads lock file, installs exact versions |
| Adding a package | `npm install <pkg>` — updates both `package.json` and lock file |
| Upgrading | `npm install <pkg>@version` — lock file updated |
| Merge conflict | Re-run `npm install` to regenerate |
| Security audit | `npm audit` reads the lock file |

### Important note for this project

This project uses `npm install --legacy-peer-deps` due to version conflicts between
`@angular-architects/module-federation@^18` and Angular 20. Always reinstall with the
same flag.

---

## 3. `tsconfig.json`

Base TypeScript configuration inherited by all other tsconfig files.

### `compilerOptions`

| Option | Value | Purpose |
|---|---|---|
| `baseUrl` | `"./"` | Root for non-relative imports |
| `outDir` | `"./dist/out-tsc"` | TS compiler output (Angular CLI intercepts in-memory during serve) |
| `moduleResolution` | `"node"` | Resolve modules via Node.js rules (looks in `node_modules`) |
| `module` | `"ES2022"` | Output native ES module syntax (`import`/`export`) — required for webpack tree-shaking |
| `target` | `"ES2022"` | Keep modern JS syntax as-is; no down-transpilation |
| `lib` | `["ES2022", "dom"]` | Type definitions: `dom` gives `document`, `fetch`, `customElements`, etc. |
| `importHelpers` | `true` | Import helpers from `tslib` instead of inlining — reduces bundle size |
| `sourceMap` | `true` | Generate `.map` files for readable stack traces in DevTools |
| `declaration` | `false` | No `.d.ts` files — this is an app, not a library |
| `experimentalDecorators` | `true` | Required for `@Component`, `@Input`, etc. |
| `useDefineForClassFields` | `false` | Use TypeScript `[[Set]]` semantics (not native `[[Define]]`) — required for Angular decorators to work correctly |
| `esModuleInterop` | `true` | Allows default imports from CommonJS modules |
| `skipLibCheck` | `true` | Skip type-checking `node_modules/.d.ts` files — faster builds |
| `forceConsistentCasingInFileNames` | `true` | Prevent import casing bugs between case-insensitive (Windows/macOS) and case-sensitive (Linux) file systems |

### Strict flags

| Option | What it catches |
|---|---|
| `strict: true` | Enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, etc. |
| `noImplicitOverride` | Subclass overrides must use the `override` keyword |
| `noPropertyAccessFromIndexSignature` | Index-signature properties must use bracket notation |
| `noImplicitReturns` | Every code path in a function must return a value |
| `noFallthroughCasesInSwitch` | Every `case` must `break`, `return`, or `throw` |

### `angularCompilerOptions`

Read by `ngc` (Angular's AOT compiler), not by `tsc`.

| Option | Purpose |
|---|---|
| `enableI18nLegacyMessageIdFormat: false` | Use new i18n message ID format (disable legacy pre-v9 format) |
| `strictInjectionParameters: true` | DI parameter types must be resolvable at compile time |
| `strictInputAccessModifiers: true` | `@Input()` properties cannot be `private` or `protected` |
| `strictTemplates: true` | Type-check templates as strictly as TypeScript checks `.ts` files |

---

## 4. `tsconfig.app.json`

Extends `tsconfig.json` and narrows it down to the app source only.

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
```

- `"types": []` — opts out of all auto-included `@types/*` packages (e.g. `@types/node`).
  Keeps the type environment browser-only; prevents `process`, `require`, etc. from leaking in.
- `"files": ["src/main.ts"]` — TypeScript starts here and follows imports to discover all app
  files. This is the entry point for the AOT compiler.
- `"include": ["src/**/*.d.ts"]` — additionally includes ambient type declaration files
  (e.g. `declare module '*.svg'`).

### Why two tsconfig files

| File | Used by | Purpose |
|---|---|---|
| `tsconfig.json` | Base | Shared compiler options |
| `tsconfig.app.json` | `ng build` / `ng serve` | App source only |
| `tsconfig.spec.json` (if present) | `ng test` | Tests (adds `jasmine` types, etc.) |

---

## 5. `angular.json`

Angular CLI workspace configuration. Every `ng` command reads this file.

### Project identity

```json
"projectType": "application",
"root": "",
"sourceRoot": "src",
"prefix": "app"
```

- `projectType: "application"` — runnable app (vs `"library"`).
- `root: ""` — project root is the workspace root (single-project setup).
- `prefix: "app"` — default selector prefix for `ng generate component`. Does not affect
  the `<wdp-disputes>` custom element tag which is set explicitly in `bootstrap.ts`.

### `schematics`

```json
"@schematics/angular:component": { "style": "scss", "standalone": true }
```

Defaults applied when running `ng generate component`:
- `.scss` style files
- Standalone components (no `NgModule`)

### `build` target

#### `builder: "@angular-builders/custom-webpack:browser"`

The critical choice that makes Module Federation possible. Uses a custom-webpack builder
instead of Angular's default — allows injecting `webpack.config.js` into the build pipeline.

#### Key `options`

| Option | Value | Purpose |
|---|---|---|
| `customWebpackConfig.path` | `"./webpack.config.js"` | Your custom config file |
| `customWebpackConfig.mergeStrategies.plugins` | `"append"` | Keeps Angular's plugins; appends yours |
| `main` | `"src/main.ts"` | Webpack entry point |
| `polyfills` | `["zone.js"]` | Loaded synchronously **before** MF runtime — must not be in MF `shared` scope |
| `tsConfig` | `"tsconfig.app.json"` | TypeScript config for AOT compiler |

#### `production` configuration

```json
"budgets": [
  { "type": "initial", "maximumWarning": "2mb", "maximumError": "5mb" },
  { "type": "anyComponentStyle", "maximumWarning": "2kb", "maximumError": "4kb" }
],
"outputHashing": "all"
```

- `budgets` — fail the build if bundle sizes exceed limits. Prevents shipping bloated bundles.
- `outputHashing: "all"` — appends content hash to filenames (e.g. `main.a3f9b2c1.js`) for
  long-term browser caching.
- `defaultConfiguration: "production"` — `ng build` with no flags uses production. You must
  explicitly pass `--configuration development` for a dev build.

#### `development` configuration

| Option | Effect |
|---|---|
| `buildOptimizer: false` | Skip Angular build optimizer — faster builds |
| `optimization: false` | Skip minification — human-readable output |
| `vendorChunk: true` | Split vendor code into separate chunk — faster incremental rebuilds |
| `extractLicenses: false` | Skip OSS license extraction |
| `sourceMap: true` | Generate source maps |
| `namedChunks: true` | Human-readable chunk names instead of numeric IDs |

### `serve` target

#### Critical MFE options

```json
"port": 4201,
"liveReload": false,
"hmr": false
```

- `port: 4201` — fixed. Shell hardcodes this in its webpack config.
- `liveReload: false` — prevents the dev server from injecting a WebSocket client into
  served files. Without this, when the shell loads MFE chunks, the WDS client code inside
  them opens a second socket from the shell page to port 4201 — causing the shell to reload
  every time the MFE recompiles (infinite loop).
- `hmr: false` — same reason. HMR client would also be embedded in remote chunks.

---

## 6. `module-federation.config.js`

> **This file is NOT directly consumed by the build.** It is a reference/documentation
> file. The actual plugin is wired in `webpack.config.js`.

### `name`

```js
name: 'disputes_mfe'
```

Global identifier for this remote container. Becomes `window.disputes_mfe` in the browser.
Must match in four places: this file, `library.name`, shell's `remotes` key, and shell's
`loadRemoteModule({ remoteName })`.

Underscore instead of hyphen — hyphens are invalid in JavaScript identifiers.

### `library`

```js
library: { type: 'var', name: 'disputes_mfe' }
```

Controls how the remote container is exposed:
- `type: 'var'` — registers as a global variable (`window.disputes_mfe`).
- Required because `loadRemoteModule({ type: 'script' })` injects a `<script>` tag.
  Script tags execute in the global scope — the container must be a global variable for
  the MF runtime to find it.

### `filename`

```js
filename: 'remoteEntry.js'
```

The manifest file webpack generates. The shell fetches this first to discover what the
remote exposes and shares. Not app code — it's a small bootstrap/registry file.

### `exposes`

```js
exposes: {
  './DisputesElement': './src/bootstrap.ts'
}
```

The public API of this remote. The key (`'./DisputesElement'`) is what the shell uses in
`loadRemoteModule({ exposedModule: './DisputesElement' })`. The value is the local file
webpack bundles under that key.

### `shared` — per-package options explained

Each package has three options:

| Option | Value | Meaning |
|---|---|---|
| `singleton` | `true` | Only one instance allowed in the browser — both shell and MFE reuse the same copy |
| `strictVersion` | `false` | Don't error if versions differ — use whichever is already loaded |
| `requiredVersion` | `'auto'` | Read the actual installed version from `node_modules` at build time — no hardcoding |

`zone.js` is listed here but **excluded from the actual `webpack.config.js`** — see
`webpack.config.js` section for the reason.

---

## 7. `webpack.config.js`

The file that **actually wires Module Federation** into the Angular build. Exports a function
that receives Angular's base webpack config and mutates it.

### The `ModuleFederationPlugin` resolution trick

```js
const customWebpackDir = path.dirname(
  require.resolve('@angular-builders/custom-webpack/package.json')
);
const webpack = require(path.join(customWebpackDir, 'node_modules/webpack'));
const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;
```

**Problem:** `@angular-builders/custom-webpack` bundles its own webpack (5.94.x) internally.
The top-level `node_modules/webpack` may be a different version (5.105.x). Two different
webpack instances = two different `Compilation` classes. `ModuleFederationPlugin` uses
`instanceof Compilation` internally — if the plugin is from a different webpack instance
than the one running the build, this check fails with:

```
TypeError: The 'compilation' argument must be an instance of Compilation
```

**Fix:** Resolve `ModuleFederationPlugin` from `@angular-builders/custom-webpack`'s own
nested `node_modules/webpack` — guaranteeing both the plugin and the build use the same
webpack instance.

### `module.exports = (config) => { ... }`

Exported as a **function**, not an object. The custom-webpack builder calls this function
with Angular's base config. Returning a function bypasses the merge algorithm entirely —
you have full control over the config.

### `config.output.publicPath = 'http://localhost:4201/'`

When webpack bundles code and that code needs to lazy-load additional chunks at runtime,
it constructs URLs as `publicPath + chunkFilename`. Without an explicit `publicPath`,
webpack uses the current page URL as the base. When the shell (at `localhost:4200`) loads
MFE chunks, those chunks would try to load their own sub-chunks from `localhost:4200` —
getting 404s.

Setting an absolute `publicPath` to the MFE's own origin ensures all MFE chunk URLs
always point to `localhost:4201`, regardless of which page loaded them.

### `config.devServer.client = false`

webpack-dev-server injects a small client script into every served file. This client:
- Opens a WebSocket back to the dev server
- Listens for rebuild events
- Triggers live-reload / HMR

When the shell loads MFE chunks (which contain this client code), the client opens a
second WebSocket from the shell's page to the MFE's dev server. When the MFE recompiles,
the WDS sends a reload signal through that socket — and the **shell page reloads**.
Setting `client: false` prevents this injection entirely.

### `config.optimization.runtimeChunk = false`

Webpack's runtime manages the module registry (loaded chunks, `import()` resolution, etc.).
Module Federation has its own runtime managing container registration and shared module
negotiation. If webpack splits its runtime into a separate chunk for the remote, it
conflicts with MF's runtime — causing double-registration errors. Setting `false` keeps
the webpack runtime inlined.

### `ModuleFederationPlugin` — `zone.js` excluded from `shared`

```js
// zone.js excluded from shared — loaded via polyfills synchronously,
// before MF runtime initialises. Zone.js is idempotent so both shell
// and MFE loading it independently is safe.
```

`zone.js` is listed in `angular.json` `polyfills` — it loads **synchronously** in its own
chunk before the MF runtime initialises. If it were also in `shared`, MF would try to
manage it asynchronously, conflicting with the already-loaded synchronous copy. Excluding
it from shared lets both shell and MFE load it independently. Zone.js checks
`window.Zone` before patching — so loading it twice is safe (idempotent).

---

## 8. `src/main.ts`

```ts
import('./bootstrap').catch((err) =>
  console.error('[disputes-mfe] Bootstrap error:', err)
);
```

**The webpack entry point.** Three lines. Its only job is to create a pause point for
Webpack Module Federation's shared module negotiation.

### Why dynamic import is mandatory

**The "eager consumption" problem:**

If `main.ts` had static imports at the top:
```ts
import { createApplication } from '@angular/platform-browser'; // static
```

These are bundled into the entry chunk and execute **immediately** — before the MF runtime
has had time to negotiate which version of `@angular/core` to use. Angular core gets
consumed from the MFE's own bundle. The MF runtime then tries to register it as a shared
singleton and finds it was already loaded:

```
Error: Shared module is not available for eager consumption: @angular/core
```

**The fix — dynamic import:**

```ts
import('./bootstrap')  // dynamic — deferred to runtime
```

Execution sequence:
```
1. Entry chunk (main.js) executes — no Angular imports here
2. MF runtime initialises and negotiates shared modules with the shell
3. Dynamic import('./bootstrap') fires
4. bootstrap.ts runs — @angular/core already resolved, reuses shell's copy ✓
```

### Why `main.ts` has no imports at the top

Any static import here would be in the entry chunk and subject to eager consumption.
The file is deliberately kept as a thin shell whose only job is to trigger the async load.

### `.catch()`

`import()` returns a Promise. Without `.catch()`, bootstrap failures are unhandled
Promise rejections. The `[disputes-mfe]` prefix makes errors immediately identifiable
in the console when both shell and MFE are running.

---

## 9. `src/bootstrap.ts`

This file has two roles:
1. **Called by `main.ts`** — in standalone dev mode
2. **Exposed via Module Federation** — as `'./DisputesElement'` in `webpack.config.js`

When the shell calls `loadRemoteModule({ exposedModule: './DisputesElement' })`, webpack
fetches and executes this file. Importing the module *is* the registration — no explicit
function call needed.

### The IIFE pattern

```ts
export const elementReady: Promise<void> = (async () => {
  // ...
})();
```

An **Immediately Invoked Async Function Expression**:
- Executes the moment the module is imported
- Uses `await` inside without needing top-level await support
- Exports `elementReady` so callers can optionally `await elementReady` to confirm registration

### Step 1 — `createApplication()`

```ts
const app = await createApplication({
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true })
  ]
});
```

- Boots a standalone Angular platform (no `NgModule` needed).
- Returns `ApplicationRef` — the handle to the running Angular app, including its injector.
- `provideZoneChangeDetection({ eventCoalescing: true })` — if multiple events fire in the
  same JS task, coalesce them into a single change detection run. Reduces unnecessary DOM
  updates.
- `await` is essential — `createApplication()` is async. Everything else depends on it.

### Step 2 — `createCustomElement()`

```ts
const DisputesElement = createCustomElement(AppComponent, {
  injector: app.injector
});
```

`createCustomElement()` from `@angular/elements` converts an Angular component class into
a native Web Component class (extends `HTMLElement`).

| Web Components API | Angular equivalent |
|---|---|
| `connectedCallback` | `ngOnInit`, `ngOnChanges` |
| `disconnectedCallback` | `ngOnDestroy` |
| DOM property setter | `@Input()` via property |
| DOM event dispatch | `@Output()` via CustomEvent |

`injector: app.injector` — ensures component instances are created within the same DI tree
as the bootstrapped Angular app. Without it, `ChangeDetectorRef`, `NgZone`, etc. would fail.

### Step 3 — `customElements.define()`

```ts
if (!customElements.get('wdp-disputes')) {
  customElements.define('wdp-disputes', DisputesElement);
}
```

Registers `DisputesElement` in the browser's Custom Element Registry. After this:
- Any `<wdp-disputes>` in the DOM is upgraded to a live Angular component
- `document.createElement('wdp-disputes')` returns a `DisputesElement` instance
- `customElements.whenDefined('wdp-disputes')` resolves — **this is what the shell waits on**

The `if (!customElements.get(...))` guard prevents `DOMException` on double-registration
(e.g. during HMR or if the module is imported twice).

### Error handling

```ts
} catch (err) {
  console.error('[disputes-mfe] Failed to register custom element:', err);
  throw err;  // re-throw — makes elementReady reject, shell's catch fires
}
```

Re-throwing is critical — without it, bootstrap failures are silently swallowed and the
shell hangs indefinitely waiting for `customElements.whenDefined()` which never resolves.

---

## 10. `src/app/app.component.ts`

The Angular component that becomes `<wdp-disputes>`.

### `AppContext` interface

```ts
export interface AppContext {
  appName: string;
  getToken: () => Promise<string>;   // function — shell owns auth logic
  userId: string;
  tenantId: string;
  userRoles: string[];
}
```

The contract between shell and MFE. `getToken` is a function property — the shell passes
behaviour, not just data, so tokens can be refreshed without re-setting `appContext`.

### `@Component` decorator — key decisions

| Option | Value | Reason |
|---|---|---|
| `selector` | `'app-root'` | Ignored at runtime — Angular Elements uses `'wdp-disputes'` tag instead |
| `standalone` | `true` | No `NgModule` — required for `createApplication()` + Angular Elements |
| `changeDetection` | `OnPush` | Mandatory for Web Components — see below |
| `imports` | `[DecimalPipe]` | Only dependency needed; standalone components declare their own deps |

#### Why `OnPush` is mandatory

`AppComponent` lives in a separate Angular application context (`createApplication()`
created its own context). The shell's Angular change detection cycle has no awareness of
this component. After any async operation, Angular won't automatically update the view —
you must call `cdr.markForCheck()` manually. `OnPush` + `markForCheck()` = precise control.

### State properties — union type pattern

```ts
tokenStatus: 'idle' | 'loading' | 'ok' | 'error' = 'idle';
disputesStatus: 'idle' | 'loading' | 'ok' | 'error' = 'idle';
```

A union type literal state machine. Avoids boolean flag combinations (`isLoading + hasError
+ hasData`) which can produce impossible states. Only one state is active at a time.

### `@Input() appContext`

```ts
@Input() appContext: AppContext | null = null;
```

Angular Elements maps `@Input()` to a DOM property. When the shell does
`el.appContext = { ... }`, Angular Elements intercepts the property set and fires
`ngOnChanges`. Initialised to `null` because the element exists before the shell sets it.

### `ngOnChanges`

```ts
async ngOnChanges(changes: SimpleChanges): Promise<void> {
  if (changes['appContext'] && this.appContext) {
    await Promise.all([this.resolveToken(), this.fetchDisputes()]);
  }
}
```

Entry point for all component logic. Both operations launch in parallel via `Promise.all`
since neither depends on the other. The guard checks `appContext` specifically changed and
is not null before proceeding.

### `resolveToken()` and `fetchDisputes()` — state transition pattern

Both methods follow the same pattern:
```
status = 'loading'  → markForCheck() → view shows loading state
await async operation
status = 'ok'/'error' → markForCheck() → view shows result
```

`cdr.markForCheck()` is called **twice** — once before and once after the `await`. The
first call shows the loading state immediately; the second shows the result.

#### `fetchDisputes()` — important details

- Uses plain `fetch` (not `HttpClient`) to keep providers minimal
- `if (!res.ok) throw new Error(...)` — `fetch` only rejects on network failure, not HTTP
  errors. This explicit check handles `404`/`500` as thrown errors.
- `await res.json() as Dispute[]` — the `as` cast is a compile-time assertion only;
  no runtime validation. In production, add a schema validator (e.g. `zod`).

### `statusBadgeClass()`

Pure template helper. Maps dispute status strings to CSS class names. The `default` case
returns `'badge-neutral'` so unknown statuses render gracefully.

---

## 11. `src/app/app.component.html`

The template has four card sections. Uses Angular 17+ **control flow syntax**:

| Syntax | Old equivalent |
|---|---|
| `@if (expr) { }` | `*ngIf="expr"` |
| `@else { }` | `; else block` |
| `@for (x of arr; track x.id) { }` | `*ngFor + trackBy` |
| `@switch (expr) { @case ('v') { } }` | `[ngSwitch] + *ngSwitchCase` |

### Section 1 — Header card (static)

Identifies the element and its origin. No bindings — purely static markup. Visual
confirmation you're looking at the MFE when it's embedded in the shell.

### Section 2 — Angular version card

```html
v{{ angularVersion }}
```

Displays `VERSION.full` from `@angular/core`. Proves shared module negotiation worked —
if it didn't, both shell and MFE would run different Angular versions and you'd see a
mismatch here.

`id="wdp-angular-version"` — prefixed with `wdp-` to avoid collisions with shell IDs in
the global document.

### Section 3 — appContext card

```html
@if (appContext) {
  <!-- table with all 5 fields -->
} @else {
  <!-- orange warning card -->
}
```

The `@else` branch shows briefly while the element is mounted but `appContext` hasn't
been set yet. Once the shell sets `el.appContext`, `ngOnChanges` fires and the `@if`
condition becomes truthy.

#### `@for (role of appContext.userRoles; track role)`

`track role` — the tracking key for diffing. Angular uses it to determine which DOM nodes
to add/remove/move when the list changes, instead of re-rendering everything.

#### `@switch (tokenStatus)` — four-state display

Directly mirrors the component's `tokenStatus` union type. `@case` handles each of
`'idle'`, `'loading'`, `'ok'`, `'error'` explicitly — no `@default` needed since all
cases are covered.

- `&#x2713;` → `✓` (checkmark)
- `&#x2717;` → `✗` (cross mark)

### Section 4 — Disputes card

The disputes card is **always rendered** (not inside `@if (appContext)`). The section
title is always visible; only the content changes based on `disputesStatus`.

```html
@for (d of disputes; track d.id) {
  <td>${{ d.amount | number:'1.2-2' }}</td>
  <td>
    <span [class]="'badge ' + statusBadgeClass(d.status)">
  </td>
}
```

- `track d.id` — uses the dispute's unique ID as the diffing key.
- `| number:'1.2-2'` — `DecimalPipe` format: min 1 integer digit, min 2 / max 2 decimal
  digits. `1234.5` → `1,234.50`.
- `[class]="..."` — property binding. Square brackets mean the right-hand side is
  evaluated as JavaScript. Concatenates `'badge '` with the CSS modifier class returned
  by `statusBadgeClass()`.

### Template is a pure projection of state

The template contains no logic. Every decision is made in the component class. The
template only reflects what the class provides.

---

## 12. `src/styles.scss`

```scss
* {
  box-sizing: border-box;
}
```

**Global stylesheet** — applies to the entire document, compiled into a separate CSS
bundle by Angular CLI.

#### Why only one rule

All real component styles (`.card`, `.badge`, `table`, etc.) are defined **inside
`app.component.ts`** in the `styles` array. Angular's View Encapsulation scopes those
styles to the component's elements only — they cannot leak into the shell.

```
/* What you write in @Component styles */
.card { border: 1px solid #ddd; }

/* What Angular emits — scoped via attribute selector */
.card[_ngcontent-abc-c123] { border: 1px solid #ddd; }
```

Global styles are reserved for things that genuinely need to be global: CSS resets,
`:root` custom properties, `@font-face` declarations. Here only `box-sizing: border-box`
qualifies.

#### MFE-specific caveat

This global stylesheet is loaded by both the standalone dev server and by the shell (via
the MFE's bundle). In this PoC it is harmless — applying `box-sizing: border-box` twice
is idempotent. In a real MFE, keep global styles as minimal as possible or eliminate them
entirely to avoid conflicts with the shell's global styles.

---

## 13. `src/index.html`

Used **only in standalone mode** (`cd disputes-mfe && npm start`, open `localhost:4201`).
When the MFE is loaded by the shell, this file plays no role at all.

### `<head>`

| Tag | Purpose |
|---|---|
| `<meta charset="utf-8">` | UTF-8 encoding declaration — must come first |
| `<title>Disputes MFE — Standalone Dev Server</title>` | "Standalone Dev Server" signals dev-only |
| `<base href="/">` | Angular router reads this as the app root path |
| `<meta name="viewport" ...>` | Standard mobile viewport — prevents zoom-out on mobile |
| `<style> body { margin: 0; ... } </style>` | Inline reset mimicking what the shell normally provides |

### `<wdp-disputes id="standalone-el">`

Placed directly in the HTML before the JS runs. At parse time, the browser treats it as
an unknown generic element. After `customElements.define('wdp-disputes', ...)` runs, the
browser **upgrades** it — replaces the generic element with a live `DisputesElement`
instance. This is the Custom Elements "upgrade" pattern.

### The `<script>` block — simulating the shell

```js
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const el = document.getElementById('standalone-el');
    if (el) {
      el.appContext = {
        appName: 'standalone-dev',
        getToken: () => Promise.resolve('dev-token-standalone'),
        userId: 'dev-user',
        tenantId: 'dev-tenant',
        userRoles: ['dispute-viewer']
      };
    }
  }, 500);
});
```

#### `DOMContentLoaded`

Fires when HTML is fully parsed and the DOM is built. Earliest safe point to query the DOM.

#### `setTimeout(..., 500)`

Angular's bootstrap is asynchronous (`createApplication()` + `customElements.define()`).
The element must be **upgraded** before `appContext` is set — otherwise the property is
set on a raw `HTMLElement` before Angular Elements has attached its property interceptors,
and `ngOnChanges` never fires.

500ms is a pragmatic dev-mode delay. In production (the shell), the correct approach is
`customElements.whenDefined('wdp-disputes')` which resolves at exactly the right moment.

#### Mock values

| Field | Standalone value | Shell value |
|---|---|---|
| `appName` | `'standalone-dev'` | `'enterprise-app-a'` |
| `getToken()` | `Promise.resolve('dev-token-standalone')` | Calls mock auth service |
| `userId` | `'dev-user'` | `'user-001'` |
| `tenantId` | `'dev-tenant'` | `'tenant-001'` |
| `userRoles` | `['dispute-viewer']` | `['dispute-viewer', 'dispute-responder']` |

Values are clearly fake (`standalone-dev`, `dev-user`) — immediately identifiable as
standalone output vs. shell-integrated output.

---

## End-to-end flow summary

```
ng serve (port 4201)
  │
  ├─ angular.json → @angular-builders/custom-webpack:dev-server
  ├─ webpack.config.js mutates Angular's base config:
  │    publicPath = 'http://localhost:4201/'
  │    devServer.client = false
  │    runtimeChunk = false
  │    ModuleFederationPlugin added (name, exposes, shared)
  │
  └─ webpack emits:
       remoteEntry.js  ← shell fetches this first
       main.js         ← entry chunk (just the dynamic import)
       bootstrap chunk ← createApplication + createCustomElement + customElements.define
       app chunks      ← AppComponent + template + styles

Browser loads localhost:4201 (standalone) or shell loads remoteEntry.js:
  │
  ├─ main.js executes
  ├─ MF runtime negotiates shared modules
  ├─ import('./bootstrap') fires
  │    ├─ createApplication()           → Angular platform ready
  │    ├─ createCustomElement()         → DisputesElement class created
  │    └─ customElements.define(...)    → 'wdp-disputes' registered
  │
  └─ <wdp-disputes> upgraded / created
       └─ appContext set as DOM property
            └─ ngOnChanges fires
                 ├─ resolveToken() → calls shell's getToken()
                 └─ fetchDisputes() → calls http://localhost:3001/disputes
```
