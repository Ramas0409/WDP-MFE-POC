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
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner
} from '@ionic/angular/standalone';

// webpack provides require() at runtime; declare it so TypeScript is satisfied.
declare const require: (module: string) => any;

interface AppContext {
  appName: string;
  getToken: () => Promise<string>;
  userId: string;
  tenantId: string;
  userRoles: string[];
  shellVersion: string;
  shellIonicVersion: string;
}

@Component({
  selector: 'app-disputes-wrapper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // Registers Ionic custom elements used by the disputes-mfe web component
    IonButton, IonBadge, IonCard, IonCardContent, IonChip,
    IonSpinner, IonList, IonItem, IonLabel
  ],
  template: `
    <div class="page">
      <header class="page-toolbar">
        <span class="page-title">Disputes</span>
      </header>

      <div class="page-content" style="padding: 16px;">
        @if (loading) {
          <p style="color: #666; font-style: italic;">Loading wdp-disputes element…</p>
        }
        @if (error) {
          <pre style="color: red; background: #fff0f0; padding: 12px; border-radius: 4px;">{{ error }}</pre>
        }
        <div #mfeContainer></div>
      </div>
    </div>
  `
})
export class DisputesWrapperComponent implements AfterViewInit {
  @ViewChild('mfeContainer') mfeContainer!: ElementRef<HTMLDivElement>;

  loading = true;
  error: string | null = null;

  private cdr    = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  private readonly appContext: AppContext = {
    appName:      'enterprise-corp',
    getToken:     () => Promise.resolve('enterprise-bearer-token-mock'),
    userId:       'corp-user-007',
    tenantId:     'enterprise-tenant-001',
    userRoles:    ['admin', 'dispute-manager', 'audit-viewer'],
    shellVersion: 'Angular 18',
    shellIonicVersion: (require('@ionic/angular/package.json') as { version: string }).version
  };

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.ngZone.runOutsideAngular(async () => {
        await loadRemoteModule({
          type: 'script',
          remoteEntry: 'http://localhost:4201/remoteEntry.js',
          remoteName: 'disputes_mfe',
          exposedModule: './DisputesElement'
        });
        await customElements.whenDefined('wdp-disputes');

        const el = document.createElement('wdp-disputes') as HTMLElement & { appContext: AppContext };
        el.appContext = this.appContext;
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
