import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
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
  IonSelect,
  IonSelectOption,
  IonSpinner
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

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

const ORG_IDS = ['org-001', 'org-002', 'org-003'];

@Component({
  selector: 'app-disputes-wrapper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonSelect, IonSelectOption,
    IonButton, IonBadge, IonCard, IonCardContent, IonChip,
    IonSpinner, IonList, IonItem, IonLabel
  ],
  template: `
    <div class="page">

      <!-- ── Shell toolbar with logged-in user ─────────────────────────── -->
      <header class="page-toolbar" style="justify-content: space-between;">
        <span class="page-title">Disputes</span>
        <span style="font-size: 12px; color: rgba(255,255,255,0.8);
                     display: flex; align-items: center; gap: 5px;">
          <span style="font-size: 15px;">👤</span> {{ userId }}
        </span>
      </header>

      <div class="page-content">

        <!-- ── Shell controls strip ──────────────────────────────────────── -->
        <div style="background: #243860; border-bottom: 2px solid #C9921A;
                    padding: 6px 20px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">

          <!-- OrgId -->
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                       letter-spacing: .1em; color: #C9921A;">Shell</span>
          <span style="color: rgba(201,146,26,0.4);">·</span>
          <span style="font-size: 12px; font-weight: 600; color: #A8BCDA;">OrgId</span>
          <ion-select
            [value]="selectedOrgId"
            (ionChange)="selectOrgId($event.detail.value)"
            interface="popover"
            style="max-width: 110px; font-size: 12px;
                   --padding-start: 6px; --padding-end: 6px;
                   --padding-top: 2px; --padding-bottom: 2px;
                   border: 1px solid #C9921A; border-radius: 6px; background: #1B2A4A;">
            @for (id of orgIds; track id) {
              <ion-select-option [value]="id">{{ id }}</ion-select-option>
            }
          </ion-select>

          <!-- Divider -->
          <span style="color: rgba(201,146,26,0.35); margin: 0 4px;">|</span>

          <!-- Token info -->
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                       letter-spacing: .1em; color: #C9921A;">Token</span>
          <span style="font-size: 13px; font-family: monospace; color: #E8D5A0;
                       background: #1B2A4A; border: 1px solid #C9921A; border-radius: 4px;
                       padding: 2px 8px;">
            {{ tokenDisplay }}
          </span>

          <!-- Expiry countdown -->
          <span style="font-size: 11px; color: #A8BCDA;">expires in</span>
          <span style="font-size: 11px; font-weight: 700;"
                [style.color]="countdownUrgent ? '#ff6b6b' : '#81C784'">
            {{ countdown }}
          </span>
        </div>

        <!-- ── MFE boundary label ─────────────────────────────────────────── -->
        <div style="background: #C9921A; padding: 3px 20px; display: flex; align-items: center;">
          <span style="font-size: 9px; font-weight: 700; letter-spacing: .12em;
                       text-transform: uppercase; color: rgba(255,255,255,0.85);">
            ↓ &nbsp;MFE &nbsp;·&nbsp; wdp-disputes &nbsp;·&nbsp; Angular Elements &nbsp;·&nbsp; port 4201
          </span>
        </div>

        <!-- ── MFE mount-point ────────────────────────────────────────────── -->
        @if (loading) {
          <p style="padding: 16px; color: #666; font-style: italic;">Loading wdp-disputes element…</p>
        }
        @if (error) {
          <pre style="margin: 16px; color: red; background: #fff0f0;
                      padding: 12px; border-radius: 4px;">{{ error }}</pre>
        }
        <div #mfeContainer></div>

      </div>
    </div>
  `
})
export class DisputesWrapperComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mfeContainer') mfeContainer!: ElementRef<HTMLDivElement>;

  loading = true;
  error: string | null = null;

  readonly orgIds = ORG_IDS;
  readonly userId = 'corp-user-007';
  selectedOrgId   = ORG_IDS[0];

  tokenDisplay    = '—';
  countdown       = '—';
  countdownUrgent = false;

  private cdr         = inject(ChangeDetectorRef);
  private ngZone      = inject(NgZone);
  private authService = inject(AuthService);

  private mfeEl: (HTMLElement & { appContext: AppContext }) | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  private appContext: AppContext = {
    appName:  'enterprise-corp',
    getToken: () => this.authService.getToken(),
    userId:   this.userId,
    tenantId: ORG_IDS[0],
    userRoles: ['admin', 'dispute-manager', 'audit-viewer'],
    shellVersion: 'Angular 18',
    shellIonicVersion: (require('@ionic/angular/package.json') as { version: string }).version
  };

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.refreshTokenDisplay();
    this.countdownTimer = setInterval(() => {
      this.refreshTokenDisplay();
      this.cdr.markForCheck();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownTimer !== null) clearInterval(this.countdownTimer);
  }

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
        this.mfeEl = el;
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

  // ── OrgId change handler ─────────────────────────────────────────────────

  selectOrgId(orgId: string): void {
    this.selectedOrgId = orgId;
    this.appContext = { ...this.appContext, tenantId: orgId };
    if (this.mfeEl) this.mfeEl.appContext = this.appContext;
    this.cdr.markForCheck();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private refreshTokenDisplay(): void {
    const token = this.authService.currentToken;
    this.tokenDisplay = token || '—';

    const diffMs = this.authService.tokenExpiresAt - Date.now();
    if (diffMs <= 0) {
      this.countdown = 'expired';
      this.countdownUrgent = true;
    } else {
      const m = Math.floor(diffMs / 60_000);
      const s = Math.floor((diffMs % 60_000) / 1000);
      this.countdown = `${m}m ${s.toString().padStart(2, '0')}s`;
      this.countdownUrgent = diffMs < 60_000;
    }
  }
}
