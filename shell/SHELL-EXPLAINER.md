# shell — File-by-File Explainer

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
10. [src/app/app.config.ts](#10-srcappappconfigts)
11. [src/app/app.routes.ts](#11-srcappapproutests)
12. [src/app/app.component.ts](#12-srcappappcomponentts)
13. [src/app/app.component.html](#13-srcappappcomponenthtml)
14. [src/app/disputes/disputes-wrapper.component.ts](#14-srcappdisputesdisputes-wrappercomponentts)
15. [src/styles.scss](#15-srcstylesday)
16. [src/index.html](#16-srcindexhtml)

---

## Overview

The shell is the **HOST** application in this Webpack Module Federation setup. It owns
the page, the router, the Ionic UI chrome, and is responsible for loading the MFE at
runtime.

```
Browser navigates to localhost:4200
  └─ Angular router matches '/disputes'
  └─ Lazy-loads DisputesWrapperComponent
       └─ loadRemoteModule() fetches http://localhost:4201/remoteEntry.js
       └─ bootstrap.ts in MFE executes → 'wdp-disputes' registered
       └─ customElements.whenDefined('wdp-disputes') resolves
       └─ document.createElement('wdp-disputes') created
       └─ el.appContext = { ... } set as DOM property
       └─ <wdp-disputes> renders: fetches disputes, resolves token
```

### Shell vs MFE responsibilities

| Concern | Shell | MFE |
|---|---|---|
| Page layout | Ionic `<ion-app>`, `<ion-menu>`, `<ion-router-outlet>` | None |
| Routing | `app.routes.ts` | None |
| Auth / token | `getToken()` in `appContext` | Calls shell's `getToken()` |
| Loading MFE | `loadRemoteModule()` in `DisputesWrapperComponent` | N/A |
| Rendering disputes UI | None | `AppComponent` |
| Ionic dependency | Yes | No |

---

## 1. `package.json`

```json
"name": "shell",
"version": "0.0.0",
"private": true
```

Standard app package fields. `private: true` prevents accidental npm publish.

### `scripts`

```json
"start": "ng serve --port 4200",
"build": "ng build",
"watch": "ng build --watch --configuration development"
```

- `start` — dev server on **port 4200**, the conventional Angular default.
- `build` — production build to `dist/shell/`.
- `watch` — incremental dev build without a server.

### `dependencies` — runtime (shipped to browser)

| Package | Purpose |
|---|---|
| `@angular/common` | Built-in pipes, directives |
| `@angular/compiler` | Runtime compilation support |
| `@angular/core` | Core Angular framework |
| `@angular/forms` | Template-driven and reactive forms (scaffolded; not heavily used in this PoC) |
| `@angular/platform-browser` | Browser DOM adapter |
| `@angular/platform-browser-dynamic` | `bootstrapApplication()` support |
| `@angular/router` | SPA routing — lazy-loads `DisputesWrapperComponent` |
| `@ionic/angular` | **Shell-only** — Ionic UI components (`IonApp`, `IonMenu`, etc.) |
| `ionicons` | Icon SVGs used by Ionic components |
| `rxjs` | Angular's reactive primitives |
| `tslib` | TypeScript helper functions (reduces bundle size) |
| `wdp-webpack-poc` | Root workspace reference (`file:..`) |
| `zone.js` | Change detection — loaded synchronously via polyfills |

**Key difference from MFE:** The shell has `@angular/router`, `@ionic/angular`, and
`ionicons`. The MFE has none of these — it is a self-contained UI fragment with no
routing or Ionic dependency.

### `devDependencies` — build-time only

| Package | Purpose |
|---|---|
| `@angular-architects/module-federation` | `share()` helper for MF shared config |
| `@angular-builders/custom-webpack` | Injects `webpack.config.js` into Angular's build |
| `@angular-devkit/build-angular` | Angular core build infrastructure |
| `@angular/cli` | The `ng` command |
| `@angular/compiler-cli` | AOT compiler (`ngc`) |
| `typescript` | TypeScript compiler (`~5.8.0` = tight patch-only pin) |

---

## 2. `package-lock.json`

A **generated file** — never manually edited. Records the exact resolved version of every
installed package so `npm install` produces byte-for-byte identical results on every
machine and in CI.

Same structure as the MFE's lock file (`lockfileVersion: 3`, flat `packages` map with
`version`, `resolved`, `integrity` per entry). The shell's lock file is larger than the
MFE's because it includes Ionic's dependency tree on top of Angular's.

Always reinstall with `--legacy-peer-deps` — needed due to version conflicts between
`@angular-architects/module-federation@^18` and Angular 20.

---

## 3. `tsconfig.json`

Base TypeScript configuration, identical in structure to the MFE's. Inherited by
`tsconfig.app.json`.

### `compilerOptions`

| Option | Value | Purpose |
|---|---|---|
| `baseUrl` | `"./"` | Root for non-relative imports |
| `moduleResolution` | `"node"` | Node.js module resolution rules |
| `module` | `"ES2022"` | Native ES module output — required for webpack tree-shaking |
| `target` | `"ES2022"` | Keep modern JS syntax as-is |
| `lib` | `["ES2022", "dom"]` | Type definitions including browser APIs |
| `importHelpers` | `true` | Import helpers from `tslib` — reduces bundle size |
| `sourceMap` | `true` | Source maps for DevTools debugging |
| `declaration` | `false` | No `.d.ts` files — this is an app, not a library |
| `experimentalDecorators` | `true` | Required for `@Component`, `@Input`, etc. |
| `useDefineForClassFields` | `false` | Use TypeScript `[[Set]]` semantics — required for Angular decorators |
| `esModuleInterop` | `true` | Default imports from CommonJS modules |
| `skipLibCheck` | `true` | Skip type-checking `node_modules` — faster builds |
| `forceConsistentCasingInFileNames` | `true` | Prevent cross-platform import casing bugs |
| `strict` | `true` | Enables all strict checks (`strictNullChecks`, `noImplicitAny`, etc.) |
| `noImplicitOverride` | `true` | Subclass overrides must use `override` keyword |
| `noPropertyAccessFromIndexSignature` | `true` | Index-signature properties must use bracket notation |
| `noImplicitReturns` | `true` | All code paths must return a value |
| `noFallthroughCasesInSwitch` | `true` | No silent fallthrough in `switch` statements |

### `angularCompilerOptions`

Read by `ngc` (Angular's AOT compiler):

| Option | Purpose |
|---|---|
| `strictInjectionParameters: true` | DI parameter types must be resolvable at compile time |
| `strictInputAccessModifiers: true` | `@Input()` must be `public` |
| `strictTemplates: true` | Type-check templates as strictly as TypeScript checks `.ts` |
| `enableI18nLegacyMessageIdFormat: false` | Use new i18n message ID format |

---

## 4. `tsconfig.app.json`

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

Identical structure to the MFE's `tsconfig.app.json`:

- `"types": []` — opts out of auto-included `@types/*` packages. Prevents `@types/node`
  from leaking Node.js globals (`process`, `require`) into the browser type environment.
- `"files": ["src/main.ts"]` — TypeScript / `ngc` starts here and follows imports to
  discover all app files.
- `"include": ["src/**/*.d.ts"]` — includes ambient type declaration files in `src/`.

---

## 5. `angular.json`

Angular CLI workspace configuration for the shell project.

### Project identity

```json
"projectType": "application",
"root": "",
"sourceRoot": "src",
"prefix": "app"
```

Single-project workspace. `prefix: "app"` is the default selector prefix for generated
components (e.g. `ng g component foo` → `selector: 'app-foo'`).

### `schematics`

```json
"@schematics/angular:component": { "style": "scss", "standalone": true }
```

All generated components default to standalone with SCSS styles.

### `build` target

#### `builder: "@angular-builders/custom-webpack:browser"`

Same custom-webpack builder as the MFE — allows injecting `webpack.config.js` to add
`ModuleFederationPlugin`. Without this builder, Module Federation cannot be added to an
Angular build.

#### Key `options`

| Option | Value | Purpose |
|---|---|---|
| `customWebpackConfig.path` | `"./webpack.config.js"` | Custom config file location |
| `customWebpackConfig.mergeStrategies.plugins` | `"append"` | Preserve Angular's plugins, append MF plugin |
| `main` | `"src/main.ts"` | Webpack entry point |
| `polyfills` | `["zone.js"]` | zone.js loaded synchronously before MF runtime |
| `tsConfig` | `"tsconfig.app.json"` | TypeScript config for AOT compiler |
| `outputPath` | `"dist/shell"` | Production build output directory |

#### `styles` array — Ionic CSS

```json
"styles": [
  "node_modules/@ionic/angular/css/core.css",
  "node_modules/@ionic/angular/css/normalize.css",
  "node_modules/@ionic/angular/css/structure.css",
  "node_modules/@ionic/angular/css/typography.css",
  "node_modules/@ionic/angular/css/display.css",
  "src/styles.scss"
]
```

The shell loads five Ionic CSS files **globally** before `src/styles.scss`. The MFE has
none of these — Ionic styles are a shell-only concern.

| Ionic CSS file | Purpose |
|---|---|
| `core.css` | CSS custom properties (colours, spacing, font sizes) |
| `normalize.css` | Cross-browser CSS reset on top of browser defaults |
| `structure.css` | Layout rules for `<ion-app>`, `<ion-content>`, `<ion-page>` |
| `typography.css` | Default font stack and heading styles |
| `display.css` | Utility display classes used by Ionic components |

These are the only Ionic CSS files loaded — optional CSS (padding helpers, flex utilities)
is not included, keeping the bundle lean.

#### `production` configuration

```json
"budgets": [
  { "type": "initial", "maximumWarning": "2mb", "maximumError": "5mb" },
  { "type": "anyComponentStyle", "maximumWarning": "2kb", "maximumError": "4kb" }
],
"outputHashing": "all"
```

- `budgets` — build fails if initial bundle exceeds 5MB or any component style exceeds 4KB.
- `outputHashing: "all"` — content-hash filenames for long-term browser caching.
- `defaultConfiguration: "production"` — `ng build` with no flags = production.

#### `development` configuration

Same as MFE: `buildOptimizer: false`, `optimization: false`, `vendorChunk: true`,
`sourceMap: true`, `namedChunks: true`. Produces readable, debuggable output.

### `serve` target

```json
"builder": "@angular-builders/custom-webpack:dev-server",
"defaultConfiguration": "development",
"options": {
  "port": 4200
}
```

- `port: 4200` — conventional Angular default. Unlike the MFE, the shell does NOT
  disable `liveReload` or `hmr` — the shell's own hot reload is desirable.
- The MFE disables its dev-server client to prevent cross-contamination. The shell has
  no such requirement.

---

## 6. `module-federation.config.js`

> **This file is NOT directly consumed by the build.** It is a reference/documentation
> file. The actual plugin is wired in `webpack.config.js`.

```js
const mfConfig = {
  remotes: {
    disputes_mfe: 'disputes_mfe@http://localhost:4201/remoteEntry.js'
  },
  shared: share({ ... })
};
```

### HOST vs REMOTE distinction

The shell is a **HOST** — it consumes remotes but does not expose modules. Therefore:
- No `name` field (hosts don't need a global identity)
- No `filename` field (hosts don't emit a `remoteEntry.js`)
- No `exposes` field (hosts don't publish anything)
- Only `remotes` and `shared`

### `remotes`

```js
disputes_mfe: 'disputes_mfe@http://localhost:4201/remoteEntry.js'
```

Format: `<globalWindowVar>@<remoteEntryUrl>`

- `disputes_mfe` (key) — the name used in `loadRemoteModule({ remoteName: 'disputes_mfe' })`.
  Must match the MFE's `name` field exactly.
- `disputes_mfe@http://localhost:4201/remoteEntry.js` (value) — tells the MF runtime the
  global variable name and where to fetch the remote manifest.

### `shared` — differences from MFE

The shell shares **more packages** than the MFE:

| Package | In MFE shared | In shell shared |
|---|---|---|
| `@angular/core` | ✓ | ✓ |
| `@angular/common` | ✓ | ✓ |
| `@angular/platform-browser` | ✓ | ✓ |
| `@angular/platform-browser-dynamic` | ✓ | ✓ |
| `@angular/elements` | ✓ | ✗ (shell doesn't use it) |
| `@angular/router` | ✗ | ✓ (shell owns routing) |
| `rxjs` | ✓ | ✓ |
| `zone.js` | ✗ (excluded in actual webpack.config.js) | ✗ (same reason) |

`@angular/router` is added here because the shell owns the router and if the MFE were
ever to use routing features they'd share the same router instance. `@angular/elements`
is absent — the shell never calls `createCustomElement()`.

All packages use `singleton: true, strictVersion: false, requiredVersion: 'auto'`.

---

## 7. `webpack.config.js`

The file that **actually wires Module Federation** into the Angular build.

### `ModuleFederationPlugin` resolution trick

```js
const customWebpackDir = path.dirname(
  require.resolve('@angular-builders/custom-webpack/package.json')
);
const webpack = require(path.join(customWebpackDir, 'node_modules/webpack'));
const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;
```

Same trick as the MFE. `@angular-builders/custom-webpack` may bundle a different webpack
version than the top-level `node_modules/webpack`. Using two different webpack instances
causes:

```
TypeError: The 'compilation' argument must be an instance of Compilation
```

Fix: resolve `ModuleFederationPlugin` from `@angular-builders/custom-webpack`'s own
nested `node_modules/webpack` — guaranteeing both the plugin and the Angular build pipeline
use the same webpack instance and the same `Compilation` class.

### `module.exports = (config) => { ... }`

Exported as a **function**. The custom-webpack builder calls this with Angular's base
config. Returning a function gives full control — bypasses the merge algorithm.

### The shell config is simpler than the MFE's

The shell does **not** need:

- `config.output.publicPath` — the shell serves its own chunks from its own origin
  (`localhost:4200`). Relative URLs work fine since the page is also at `localhost:4200`.
- `config.devServer.client = false` — the shell's own HMR/live-reload is desirable.
- `config.optimization.runtimeChunk = false` — only remotes need this. The HOST's
  webpack runtime can coexist with the MF runtime normally.

The shell config only pushes `ModuleFederationPlugin`:

```js
module.exports = (config) => {
  config.plugins.push(
    new ModuleFederationPlugin({
      remotes: {
        disputes_mfe: 'disputes_mfe@http://localhost:4201/remoteEntry.js'
      },
      shared: share({
        '@angular/core':                     { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/common':                   { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/router':                   { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/platform-browser':         { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        '@angular/platform-browser-dynamic': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
        'rxjs':                              { singleton: true, strictVersion: false, requiredVersion: 'auto' }
        // zone.js excluded — loaded synchronously via polyfills before MF runtime
      })
    })
  );
  return config;
};
```

### `zone.js` excluded from `shared`

Same reason as the MFE:
- `zone.js` is listed in `angular.json` `polyfills` — loaded **synchronously** before the
  MF runtime initialises.
- If it were also in `shared`, MF would try to manage it asynchronously — conflicting
  with the already-loaded synchronous copy → "Shared module is not available for eager
  consumption" error.
- Both shell and MFE load it independently via polyfills. Zone.js is idempotent (checks
  `window.Zone` before patching) so loading it twice is safe.

---

## 8. `src/main.ts`

```ts
import('./bootstrap').catch((err) => console.error('[Shell] Bootstrap error:', err));
```

**Identical pattern to the MFE's `main.ts`.** Even the HOST needs this.

### Why — the eager consumption problem applies to both sides

Any application participating in Module Federation — whether HOST or REMOTE — must defer
its real bootstrap behind a dynamic import. Reason:

If `main.ts` had static imports:
```ts
import { bootstrapApplication } from '@angular/platform-browser'; // static
```

This is bundled into the entry chunk and executed immediately — before the MF runtime has
had time to negotiate shared module versions with any remotes. Angular core gets consumed
eagerly from the shell's own bundle. When the MF runtime then tries to register it as a
shared singleton, it finds it was already consumed:

```
Error: Shared module is not available for eager consumption: @angular/core
```

The dynamic `import('./bootstrap')` creates a pause point:

```
1. Entry chunk (main.js) executes — no Angular imports
2. MF runtime initialises, reads remotes config, sets up shared scope
3. import('./bootstrap') fires
4. bootstrap.ts runs — @angular/core resolved through shared scope ✓
```

### `[Shell]` prefix in `.catch()`

Distinguishes shell errors from MFE errors in the browser console when both are running
simultaneously.

---

## 9. `src/bootstrap.ts`

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('[Shell] Bootstrap error:', err));
```

Standard Angular 20 standalone bootstrap. Simple compared to the MFE's `bootstrap.ts`.

### `bootstrapApplication()` vs MFE's `createApplication()`

| | Shell (`bootstrapApplication`) | MFE (`createApplication`) |
|---|---|---|
| Renders root component? | Yes — `AppComponent` into `<app-root>` in `index.html` | No — no root component rendered |
| Creates Angular platform? | Yes | Yes |
| Purpose | Full Angular app boot | Boot Angular for Angular Elements only |

The shell uses `bootstrapApplication()` because it needs a root component (`AppComponent`)
rendered into the DOM immediately. The MFE uses `createApplication()` because it only
needs an Angular platform and injector — the component rendering happens via the custom
element, not via direct Angular bootstrapping.

### `appConfig`

Imported from `app.config.ts`. Contains the providers: Ionic route strategy, Ionic
initialisation, and the router with routes.

---

## 10. `src/app/app.config.ts`

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes)
  ]
};
```

The Angular `ApplicationConfig` object passed to `bootstrapApplication()`. Defines the
root-level providers for the entire shell application.

### `{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }`

Replaces Angular's default `RouteReuseStrategy` with Ionic's.

**Why this is needed:** Ionic's navigation model is stack-based — pages slide in/out and
are kept alive in a stack so the back-button can return to them. Angular's default router
destroys and re-creates components on every navigation. `IonicRouteStrategy` overrides
this behaviour so pages are cached in the Ionic page stack rather than destroyed. Without
it, Ionic page animations and the back-button stack break.

### `provideIonicAngular({ mode: 'md' })`

Initialises the Ionic framework with **Material Design** mode.

Ionic supports two visual modes:
- `'md'` — Material Design (used on Android, also used cross-platform for consistency)
- `'ios'` — iOS Human Interface Guidelines style

Setting `mode: 'md'` ensures consistent styling across all platforms regardless of what
device or OS the user is on. Without this, Ionic auto-detects the platform and applies
the native mode — which can cause visual inconsistencies in testing and development.

### `provideRouter(routes)`

Registers the application's route table. Uses Angular's standalone router provider. The
`routes` array is defined in `app.routes.ts`.

---

## 11. `src/app/app.routes.ts`

```ts
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'disputes',
    pathMatch: 'full'
  },
  {
    path: 'disputes',
    loadComponent: () =>
      import('./disputes/disputes-wrapper.component').then(
        (m) => m.DisputesWrapperComponent
      )
  },
  {
    path: '**',
    redirectTo: 'disputes'
  }
];
```

Defines three routes for the entire shell application.

### Route 1 — root redirect

```ts
{ path: '', redirectTo: 'disputes', pathMatch: 'full' }
```

When the user navigates to `/` (the root), redirect to `/disputes`.

`pathMatch: 'full'` — only redirect if the **entire** URL path is empty, not just if it
starts with an empty string. Without `'full'`, this redirect would match every route
(since every path starts with `''`) and create an infinite redirect loop.

### Route 2 — disputes (lazy-loaded)

```ts
{
  path: 'disputes',
  loadComponent: () =>
    import('./disputes/disputes-wrapper.component').then(
      (m) => m.DisputesWrapperComponent
    )
}
```

`loadComponent()` is Angular's standalone component lazy-loading. The component JS chunk
is only downloaded when a user navigates to `/disputes` for the first time.

This has a two-level lazy-loading effect:
1. **Angular lazy-loads** `DisputesWrapperComponent` chunk when the route is activated
2. **`DisputesWrapperComponent.ngAfterViewInit()`** then lazy-loads the MFE via
   `loadRemoteModule()` — fetching `remoteEntry.js` and the MFE's JS chunks

Neither the wrapper component nor the MFE is downloaded on initial page load. Both are
fetched only on demand when `/disputes` is first visited.

### Route 3 — catch-all redirect

```ts
{ path: '**', redirectTo: 'disputes' }
```

Any unknown URL (e.g. `/settings`, `/foo/bar`) redirects to `/disputes`. Ensures the
app never shows a blank page for unrecognised routes. In a real app this would route to
a `404` / "Not Found" page.

---

## 12. `src/app/app.component.ts`

```ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonApp, IonContent, IonHeader, IonItem, IonLabel, IonList,
    IonMenu, IonMenuButton, IonMenuToggle, IonRouterOutlet,
    IonTitle, IonToolbar,
    RouterLink, RouterLinkActive
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'WDP Shell';
}
```

The shell's **root component** — the topmost Angular component in the app tree. It is
bootstrapped by `bootstrapApplication()` and rendered into `<app-root>` in `index.html`.

### Role of this component

`AppComponent` defines the **persistent application chrome** — the UI that is always
visible regardless of which route is active. In this case: the Ionic side menu and the
router outlet.

`AppComponent` itself has **zero logic** — no methods, no lifecycle hooks, no services
injected. All routing logic is in `app.routes.ts`, all provider setup is in
`app.config.ts`, and all MFE loading logic is in `DisputesWrapperComponent`.

`title = 'WDP Shell'` — a leftover scaffolding default. Not used in the template.

### Ionic imports

All Ionic components must be explicitly imported as they are standalone. Each `Ion*` import
corresponds to a web component backed by Ionic's framework:

| Import | HTML tag | Purpose |
|---|---|---|
| `IonApp` | `<ion-app>` | Root Ionic container — wraps the entire app |
| `IonMenu` | `<ion-menu>` | Slide-in side navigation panel |
| `IonMenuButton` | `<ion-menu-button>` | Hamburger button that toggles the menu |
| `IonMenuToggle` | `<ion-menu-toggle>` | Wrapper that auto-closes menu when content clicked |
| `IonHeader` | `<ion-header>` | Sticky header bar container |
| `IonToolbar` | `<ion-toolbar>` | Content inside a header/footer bar |
| `IonTitle` | `<ion-title>` | Title text inside a toolbar |
| `IonContent` | `<ion-content>` | Scrollable page content area |
| `IonList` | `<ion-list>` | Styled list container |
| `IonItem` | `<ion-item>` | A row inside a list |
| `IonLabel` | `<ion-label>` | Text label inside an item |
| `IonRouterOutlet` | `<ion-router-outlet>` | Angular router outlet with Ionic page transitions |

### Angular Router imports

- `RouterLink` — enables `[routerLink]="/disputes"` on elements.
- `RouterLinkActive` — enables `[routerLinkActive]="'selected'"` to add a CSS class to
  active nav links.

---

## 13. `src/app/app.component.html`

```html
<ion-app>

  <ion-menu contentId="main-content">
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>WDP Shell</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-menu-toggle auto-hide="false">
          <ion-item
            routerLink="/disputes"
            routerLinkActive="selected"
            lines="none">
            <ion-label>Disputes MFE</ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>
    </ion-content>
  </ion-menu>

  <ion-router-outlet id="main-content"></ion-router-outlet>

</ion-app>
```

### `<ion-app>`

The required root element for any Ionic application. It sets up the global Ionic context
(gesture controller, keyboard detection, safe-area insets, etc.). Everything must be
nested inside it.

### `<ion-menu contentId="main-content">`

Defines a slide-out side menu. `contentId="main-content"` links it to the element with
`id="main-content"` — which is the `<ion-router-outlet>` below. Ionic uses this link to:
- Know which element to push/overlay when the menu opens
- Enable swipe-to-open gesture on the correct content area

#### Menu header

```html
<ion-toolbar color="primary">
  <ion-title>WDP Shell</ion-title>
</ion-toolbar>
```

`color="primary"` applies Ionic's primary colour (blue, from `@ionic/angular/css/core.css`
custom properties) to the toolbar background. This is set globally as a CSS variable —
it can be overridden per-app by redefining `--ion-color-primary`.

#### Menu nav item

```html
<ion-menu-toggle auto-hide="false">
  <ion-item
    routerLink="/disputes"
    routerLinkActive="selected"
    lines="none">
    <ion-label>Disputes MFE</ion-label>
  </ion-item>
</ion-menu-toggle>
```

- `<ion-menu-toggle>` — automatically closes the menu when the item inside is tapped.
  `auto-hide="false"` keeps the toggle visible even on wide screens (by default
  `<ion-menu-toggle>` hides itself on large viewports where the menu may always be open).
- `routerLink="/disputes"` — Angular router navigation directive. Clicking navigates to
  `/disputes`.
- `routerLinkActive="selected"` — adds the CSS class `selected` to this item when `/disputes`
  is the active route. Used for visual highlighting of the current nav item.
- `lines="none"` — removes the default bottom border Ionic adds to list items.

### `<ion-router-outlet id="main-content">`

The Angular router outlet — where routed components are rendered. Ionic's version adds
page transition animations (slide in/out) on top of Angular's standard outlet.

`id="main-content"` — this ID is the link referenced by `<ion-menu contentId="main-content">`.

**Important:** there is no `<ion-page>` here. Each routed component (like
`DisputesWrapperComponent`) owns its own `<ion-header>` and `<ion-content>` wrapped in a
`<div class="ion-page">`. This is the correct Ionic standalone routing pattern — the root
layout provides the outlet; each page provides its own chrome.

---

## 14. `src/app/disputes/disputes-wrapper.component.ts`

This is the **most important file in the shell** — the bridge between Angular routing and
the MFE. It implements the WebComponentWrapper pattern.

```ts
@Component({
  selector: 'app-disputes-wrapper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonTitle, IonMenuButton, IonContent],
  template: `...`
})
export class DisputesWrapperComponent implements AfterViewInit { ... }
```

### `ChangeDetectionStrategy.OnPush`

OnPush is used here for the same reason as in the MFE's `AppComponent` — this component
performs async operations and must manually call `cdr.markForCheck()` after state changes.
Without OnPush, Angular would only update the view when all CD checks run (potentially
too late or too often).

### The inline template

The template is defined inline (not in a separate `.html` file) because this component
is a thin wrapper — its template is short and tightly coupled to the component's loading
logic. It contains:

1. An Ionic page structure (`<div class="ion-page">`, `<ion-header>`, `<ion-content>`)
2. Loading and error states rendered conditionally
3. A mount point `<div #mfeContainer>` where the custom element will be appended

```html
<div class="ion-page">
  <ion-header>
    <ion-toolbar color="primary">
      <ion-menu-button slot="start"></ion-menu-button>
      <ion-title>WDP Shell — Micro-Frontend PoC (Angular 20)</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <div style="padding: 16px;">
      @if (loading) {
        <p>Loading wdp-disputes element…</p>
      }
      @if (error) {
        <pre style="color: red;">{{ error }}</pre>
      }
      <div #mfeContainer></div>
    </div>
  </ion-content>
</div>
```

`<ion-menu-button slot="start">` — renders the hamburger icon in the toolbar's start
(left) slot. Tapping it opens the `<ion-menu>` defined in `AppComponent`.

`<div #mfeContainer>` — the **mount point**. The `<wdp-disputes>` custom element will be
appended here as a DOM child via `mfeContainer.nativeElement.appendChild(el)`.

### `@ViewChild('mfeContainer')`

```ts
@ViewChild('mfeContainer') mfeContainer!: ElementRef<HTMLDivElement>;
```

Gets a reference to the `<div #mfeContainer>` element in the template. Available only
after `ngAfterViewInit` — which is precisely when it's used. The `!` non-null assertion
tells TypeScript: "I know this won't be null after view init, trust me."

### `appContext` — the shell's data for the MFE

```ts
private readonly appContext: AppContext = {
  appName: 'enterprise-app-a',
  getToken: () => new Promise<string>((resolve) => {
    resolve('mock-bearer-token-initial');
  }),
  userId: 'user-001',
  tenantId: 'tenant-001',
  userRoles: ['dispute-viewer', 'dispute-responder']
};
```

The shell constructs this object once and passes it as a DOM property to `<wdp-disputes>`.

**`getToken` is a function, not a string.** The shell owns auth logic. Passing a function
lets the MFE invoke it whenever it needs a fresh token — the shell can internally call a
token refresh service without the MFE knowing anything about auth mechanics. In this PoC
it resolves immediately with a hardcoded string.

`private readonly` — this object is an internal shell concern, never exposed outside
this component, and never reassigned.

### `ngZone.runOutsideAngular()`

```ts
await this.ngZone.runOutsideAngular(async () => {
  // entire MFE loading sequence
});
```

The **entire MFE loading sequence** runs outside Angular's zone. Without this, `createApplication()`
inside the MFE's `bootstrap.ts` throws:

```
NG0908: ApplicationRef.bootstrap should not be called from inside Zone.js's code
```

Why: Angular detects if `bootstrapApplication()` / `createApplication()` is called while
inside a Zone.js task. If it is, Angular warns because it can't reliably set up its own
zone-based change detection. `runOutsideAngular()` temporarily exits zone.js patching for
the duration of the async block.

After `runOutsideAngular()` completes, `this.loading = false` and `this.cdr.markForCheck()`
run back in the Angular zone (they're outside the `ngZone.runOutsideAngular()` callback)
— so the shell's view correctly updates.

### The 4-step MFE loading sequence

```ts
// 1. Load the remote module
await loadRemoteModule({
  type: 'script',
  remoteEntry: 'http://localhost:4201/remoteEntry.js',
  remoteName: 'disputes_mfe',
  exposedModule: './DisputesElement'
});
```

`loadRemoteModule()` from `@angular-architects/module-federation`:
1. Injects a `<script src="http://localhost:4201/remoteEntry.js">` tag
2. `remoteEntry.js` executes → registers `window.disputes_mfe` container
3. Uses the container to find and fetch the `'./DisputesElement'` module chunks
4. Executes `bootstrap.ts` in the MFE → `createApplication()` → `customElements.define('wdp-disputes')`

`type: 'script'` — uses the script-tag loading approach (required when the remote's
`library.type` is `'var'`, which sets `window.disputes_mfe`).

```ts
// 2. Wait for the custom element to be defined
await customElements.whenDefined('wdp-disputes');
```

`createApplication()` in `bootstrap.ts` is async. There's a brief gap between
`loadRemoteModule()` resolving and `customElements.define()` completing. This browser
native API returns a `Promise` that resolves exactly when `customElements.define('wdp-disputes')`
is called — the precise synchronisation point.

This is more reliable than `setTimeout()` — it resolves at exactly the right moment
regardless of how long Angular takes to boot.

```ts
// 3. Create the element and set appContext as a DOM property
const el = document.createElement('wdp-disputes') as HTMLElement & {
  appContext: AppContext;
};
el.appContext = this.appContext;
```

`document.createElement('wdp-disputes')` — creates an instance of `DisputesElement`
(the Angular Elements-wrapped `AppComponent`).

**Why DOM property, not HTML attribute:**

HTML attributes are always strings:
```html
<wdp-disputes appContext="[object Object]">  ← useless
```

DOM properties can hold any JavaScript value:
```ts
el.appContext = { appName: 'enterprise-app-a', getToken: () => ..., ... }  ← works
```

`appContext` contains a function (`getToken`) and an array (`userRoles`) — impossible to
pass as HTML attributes. Setting as a DOM property is the only correct approach for complex
objects.

The TypeScript cast `as HTMLElement & { appContext: AppContext }` tells the compiler that
`appContext` is a valid property on this element so `el.appContext = ...` doesn't produce
a type error.

```ts
// 4. Mount into the shell DOM
this.mfeContainer.nativeElement.appendChild(el);
```

Appends the custom element as a child of the `<div #mfeContainer>`. At this moment:
- Angular Elements fires `connectedCallback`
- Angular detects `appContext` was already set before mount — fires `ngOnChanges`
- `resolveToken()` and `fetchDisputes()` run in the MFE
- The disputes UI renders

### Error handling

```ts
} catch (err: unknown) {
  this.loading = false;
  this.error =
    `Failed to load disputes MFE:\n\n${err instanceof Error ? err.stack : String(err)}\n\n` +
    'Make sure disputes-mfe is running on http://localhost:4201';
  this.cdr.markForCheck();
}
```

Any failure in the 4-step sequence (network error fetching `remoteEntry.js`, MFE bootstrap
error, etc.) is caught here. The error is displayed in a `<pre>` block in the template
with a helpful hint. `err.stack` provides the full stack trace for debugging.

### Dependency injections

```ts
private cdr = inject(ChangeDetectorRef);
private ngZone = inject(NgZone);
```

Both use the modern function-based `inject()` API (Angular 14+) instead of constructor
injection. `ChangeDetectorRef` for manually triggering view updates after async operations.
`NgZone` for running the MFE load sequence outside Angular's zone.

---

## 15. `src/styles.scss`

```scss
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.disputes-host {
  padding: 16px;
}
```

Global stylesheet for the shell. More substantial than the MFE's single-rule file, but
still deliberately minimal.

### `* { box-sizing: border-box }`

Universal CSS reset — makes all elements use border-box sizing so padding and border are
included within declared widths/heights. Prevents layout overflow surprises.

### `body { margin: 0; font-family: ... }`

- `margin: 0` — removes the browser's default 8px body margin. Ionic's `<ion-app>` needs
  to fill the full viewport without gaps.
- `font-family` — system font stack: `-apple-system` (macOS/iOS), `BlinkMacSystemFont`
  (Chrome/macOS), `Segoe UI` (Windows), `Roboto` (Android), `Helvetica`, `Arial`, and
  finally the generic `sans-serif` fallback. Ensures native-looking text on each platform.

Ionic's own `typography.css` also sets fonts via CSS custom properties — this `body` rule
provides a baseline for any content that renders outside Ionic components.

### `.disputes-host { padding: 16px }`

A utility class available globally within the shell. Not currently used in any component
template — likely a placeholder from initial scaffolding for wrapping the MFE mount point.

---

## 16. `src/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>WDP Shell — Micro-Frontend PoC</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

The shell's HTML entry page. Unlike the MFE's `index.html` which contains dev-mode
JavaScript, this file is clean and used in both development and production.

### `<meta charset="utf-8">`

UTF-8 encoding declaration. Must appear first in `<head>`. Tells the browser to interpret
the document as UTF-8 — supports all Unicode characters.

### `<title>WDP Shell — Micro-Frontend PoC</title>`

Browser tab title. Unlike the MFE's title ("Standalone Dev Server"), this is appropriate
for production — it identifies the application without marking it as dev-only.

### `<base href="/">`

Sets the base URL for all relative links and Angular's router. Angular reads `<base href>`
to resolve route paths. Without it:
- Deep links (e.g. navigating directly to `/disputes`) fail to resolve correctly
- Angular's `Location` service miscalculates the app root

### `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`

Standard mobile viewport meta tag plus `viewport-fit=cover`:
- `width=device-width` — viewport matches the device's actual screen width
- `initial-scale=1` — no initial zoom
- `viewport-fit=cover` — content extends into the device's safe-area insets (notch,
  home indicator on iPhone X+). Required for Ionic apps to correctly fill the entire screen
  and respect notch/safe-area padding.

This is more complete than the MFE's viewport meta (which omits `viewport-fit=cover`) —
appropriate since the shell is the actual page and must handle device-specific insets.

### `<link rel="icon" type="image/x-icon" href="favicon.ico">`

Standard browser favicon. The MFE has no favicon — it's not a standalone page in
production.

### `<app-root></app-root>`

The mount point for the Angular application. `bootstrapApplication(AppComponent, appConfig)`
in `bootstrap.ts` finds this element (via `AppComponent`'s `selector: 'app-root'`) and
renders the root Angular component tree inside it.

Angular CLI injects `<script>` and `<link>` tags for the compiled JS bundles and CSS into
this file at build time. The final emitted `dist/shell/index.html` looks like:

```html
<body>
  <app-root></app-root>
  <script src="polyfills.js"></script>    ← zone.js
  <script src="vendor.js"></script>       ← Angular, Ionic, etc.
  <script src="main.js"></script>         ← app entry point
</body>
```

---

## End-to-end flow summary

```
Browser navigates to localhost:4200
  │
  ├─ index.html served
  ├─ polyfills.js (zone.js) loaded synchronously
  ├─ main.js executes (entry chunk)
  │    └─ MF runtime initialises — sets up shared scope, registers remote config
  │    └─ import('./bootstrap') fires
  │         └─ bootstrapApplication(AppComponent, appConfig)
  │              └─ Ionic router strategy + provideIonicAngular + provideRouter set up
  │              └─ AppComponent rendered into <app-root>
  │                   └─ <ion-app> + <ion-menu> + <ion-router-outlet> in DOM
  │
  ├─ Angular router evaluates URL → '' → redirectTo 'disputes'
  ├─ Route 'disputes' → loadComponent() → fetches DisputesWrapperComponent chunk
  │
  └─ DisputesWrapperComponent rendered into <ion-router-outlet>
       └─ ngAfterViewInit fires
            └─ ngZone.runOutsideAngular():
                 │
                 ├─ loadRemoteModule({ type:'script', remoteEntry:'...4201/remoteEntry.js' })
                 │    ├─ <script src="remoteEntry.js"> injected
                 │    ├─ window.disputes_mfe container registered
                 │    ├─ './DisputesElement' chunks fetched and executed
                 │    └─ bootstrap.ts runs:
                 │         ├─ createApplication() → Angular platform in MFE ready
                 │         ├─ createCustomElement(AppComponent) → DisputesElement class
                 │         └─ customElements.define('wdp-disputes') → element registered
                 │
                 ├─ customElements.whenDefined('wdp-disputes') resolves
                 │
                 ├─ document.createElement('wdp-disputes') → DisputesElement instance
                 ├─ el.appContext = { appName, getToken, userId, tenantId, userRoles }
                 └─ mfeContainer.nativeElement.appendChild(el)
                      └─ Angular Elements fires ngOnChanges in AppComponent
                           ├─ resolveToken() → calls shell's getToken() → 'mock-bearer-token-initial'
                           └─ fetchDisputes() → GET http://localhost:3001/disputes
                                └─ dispute rows rendered in <wdp-disputes>
```
