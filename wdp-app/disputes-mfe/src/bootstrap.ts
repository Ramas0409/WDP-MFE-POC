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

// Initialise Ionic's global config (mode, gesture etc.) for standalone mode.
// IMPORTANT: must import from '@ionic/core/components' (not '@ionic/core' main entry)
// because the per-component bundles in @ionic/core/components/ use their own
// Stencil runtime (p-DWoUQeZ3.js).  Calling initialize() from that same runtime
// is the only way to set defaultMode and register the setMode handler that
// getIonMode() inside every component relies on.  Importing from '@ionic/core'
// main entry calls setMode() on a completely separate Stencil instance and has
// no effect on the components' CSS injection.
import { initialize as initializeIonic } from '@ionic/core/components';
initializeIonic({ mode: 'md' });

// Register Ionic web components using the non-lazy per-component bundles from
// @ionic/core/components. These are synchronous, fully self-contained, and safe
// to call even when the host shell has already registered them (Stencil skips
// re-registration internally). This ensures Ionic styling works at localhost:4201.
import { defineCustomElement as defineIonBadge }       from '@ionic/core/components/ion-badge';
import { defineCustomElement as defineIonButton }      from '@ionic/core/components/ion-button';
import { defineCustomElement as defineIonCard }        from '@ionic/core/components/ion-card';
import { defineCustomElement as defineIonCardContent } from '@ionic/core/components/ion-card-content';
import { defineCustomElement as defineIonCardHeader }  from '@ionic/core/components/ion-card-header';
import { defineCustomElement as defineIonCardTitle }   from '@ionic/core/components/ion-card-title';
import { defineCustomElement as defineIonChip }        from '@ionic/core/components/ion-chip';
import { defineCustomElement as defineIonItem }        from '@ionic/core/components/ion-item';
import { defineCustomElement as defineIonLabel }       from '@ionic/core/components/ion-label';
import { defineCustomElement as defineIonList }        from '@ionic/core/components/ion-list';
import { defineCustomElement as defineIonRipple }      from '@ionic/core/components/ion-ripple-effect';
import { defineCustomElement as defineIonSpinner }     from '@ionic/core/components/ion-spinner';

defineIonBadge();
defineIonButton();
defineIonCard();
defineIonCardContent();
defineIonCardHeader();
defineIonCardTitle();
defineIonChip();
defineIonItem();
defineIonLabel();
defineIonList();
defineIonRipple();
defineIonSpinner();

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
