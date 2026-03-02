/**
 * bootstrap.ts — exposed via Module Federation as './DisputesElement'
 *
 * When the shell's loadRemoteModule() imports this module:
 *  1. createApplication() bootstraps an Angular platform.
 *  2. createCustomElement() wraps AppComponent as a Web Component.
 *  3. customElements.define() registers it as 'wdp-disputes'.
 *
 * After this module resolves, the shell can safely do:
 *   await customElements.whenDefined('wdp-disputes');
 *   const el = document.createElement('wdp-disputes');
 *   el.appContext = { ... };
 */

import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';

// Export a promise so callers can optionally await full registration.
export const elementReady: Promise<void> = (async () => {
  try {
    const app = await createApplication({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true })
      ]
    });

    const DisputesElement = createCustomElement(AppComponent, {
      injector: app.injector
    });

    if (!customElements.get('wdp-disputes')) {
      customElements.define('wdp-disputes', DisputesElement);
      console.log('[disputes-mfe] Custom element "wdp-disputes" registered.');
    } else {
      console.warn('[disputes-mfe] "wdp-disputes" already defined — skipping.');
    }
  } catch (err) {
    console.error('[disputes-mfe] Failed to register custom element:', err);
    throw err;
  }
})();
