/**
 * DisputesWrapperComponent — enterprise-app host-side wrapper
 *
 * Loads the disputes-mfe remote via Webpack Module Federation,
 * waits for the 'wdp-disputes' custom element, then mounts it
 * with an enterprise-specific appContext.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
  inject
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import {
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

// ── AppContext shape passed to the MFE ────────────────────────────────────

interface AppContext {
  appName: string;
  getToken: () => Promise<string>;
  userId: string;
  tenantId: string;
  userRoles: string[];
}

// ── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-disputes-wrapper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonTitle, IonMenuButton, IonContent],
  template: `
    <div class="ion-page">
      <ion-header>
        <ion-toolbar color="dark">
          <ion-menu-button slot="start"></ion-menu-button>
          <ion-title>Enterprise Corp — Micro-Frontend PoC (Angular 20)</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <div style="padding: 16px;">
          <h2 style="margin-bottom: 8px; color: #333;">
            Disputes Micro-Frontend (loaded via Module Federation)
          </h2>

          <!-- Loading / error states -->
          @if (loading) {
            <p style="color: #666; font-style: italic;">Loading wdp-disputes element…</p>
          }
          @if (error) {
            <pre style="color: red; background: #fff0f0; padding: 12px; border-radius: 4px;">{{ error }}</pre>
          }

          <!-- MFE mount-point: the custom element is appended here -->
          <div #mfeContainer></div>
        </div>
      </ion-content>
    </div>
  `
})
export class DisputesWrapperComponent implements AfterViewInit {
  @ViewChild('mfeContainer') mfeContainer!: ElementRef<HTMLDivElement>;

  loading = true;
  error: string | null = null;

  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  // ── Enterprise-specific AppContext ──────────────────────────────────────

  private readonly appContext: AppContext = {
    appName:   'enterprise-corp',
    getToken:  () => Promise.resolve('enterprise-bearer-token-mock'),
    userId:    'corp-user-007',
    tenantId:  'enterprise-tenant-001',
    userRoles: ['admin', 'dispute-manager', 'audit-viewer']
  };

  // ── Lifecycle ───────────────────────────────────────────────────────────

  async ngAfterViewInit(): Promise<void> {
    try {
      // Run outside Angular's zone so that createApplication() inside the MFE's
      // bootstrap.ts does not throw NG0908 ("Should not be in Angular Zone").
      await this.ngZone.runOutsideAngular(async () => {
        // 1️⃣  Load the remote module — this executes bootstrap.ts in the MFE,
        //     which runs createApplication() and registers 'wdp-disputes'.
        await loadRemoteModule({
          type: 'script',
          remoteEntry: 'http://localhost:4201/remoteEntry.js',
          remoteName: 'disputes_mfe',
          exposedModule: './DisputesElement'
        });

        // 2️⃣  Wait until the custom element constructor is registered.
        await customElements.whenDefined('wdp-disputes');

        // 3️⃣  Create the element and set the complex `appContext` as a property.
        const el = document.createElement('wdp-disputes') as HTMLElement & {
          appContext: AppContext;
        };
        el.appContext = this.appContext;

        // 4️⃣  Mount into the enterprise-app DOM.
        this.mfeContainer.nativeElement.appendChild(el);
      });

      this.loading = false;
      this.cdr.markForCheck();

    } catch (err: unknown) {
      this.loading = false;
      this.error =
        `Failed to load disputes MFE:\n\n${err instanceof Error ? err.stack : String(err)}\n\n` +
        'Make sure disputes-mfe is running on http://localhost:4201';
      this.cdr.markForCheck();
    }
  }
}
