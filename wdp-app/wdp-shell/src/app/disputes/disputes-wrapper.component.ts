/**
 * DisputesWrapperComponent — WebComponentWrapper pattern
 *
 * This shell-side component:
 *  1. Loads the disputes-mfe remote entry via Webpack Module Federation.
 *  2. Waits for the 'wdp-disputes' custom element to be defined.
 *  3. Creates the element programmatically and sets the `appContext` property
 *     (complex object — must be a DOM property, NOT an HTML attribute).
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

// webpack provides require() at runtime; declare it so TypeScript is satisfied.
declare const require: (module: string) => any;
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonSpinner,
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
  shellVersion: string;
  shellIonicVersion: string;
}

// ── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-disputes-wrapper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonMenuButton, IonContent,
    // Registers Ionic custom elements used by the disputes-mfe web component
    IonButton, IonBadge, IonCard, IonCardContent, IonChip,
    IonSpinner, IonList, IonItem, IonLabel
  ],
  template: `
    <div class="ion-page">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-menu-button slot="start"></ion-menu-button>
          <ion-title>WDP Shell — Micro-Frontend PoC (Angular 20)</ion-title>
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

  // ── AppContext injected into the MFE ────────────────────────────────────

  /**
   * The shell builds this object once and passes it as a DOM property to the
   * wdp-disputes element.  getToken returns a native Promise (not Observable).
   */
  private readonly appContext: AppContext = {
    appName: 'enterprise-app-a',
    getToken: () => new Promise<string>((resolve) => {
      // In a real app this would call an auth service / refresh token endpoint.
      resolve('mock-bearer-token-initial');
    }),
    userId: 'user-001',
    tenantId: 'tenant-001',
    userRoles: ['dispute-viewer', 'dispute-responder'],
    shellVersion: 'Angular 20',
    shellIonicVersion: (require('@ionic/angular/package.json') as { version: string }).version
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
        //     (createApplication is async so we use whenDefined as a fence.)
        await customElements.whenDefined('wdp-disputes');

        // 3️⃣  Create the element and set the complex `appContext` as a property.
        const el = document.createElement('wdp-disputes') as HTMLElement & {
          appContext: AppContext;
        };
        el.appContext = this.appContext;

        // 4️⃣  Mount into the shell DOM.
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
