/**
 * AppComponent — the disputes MFE root component.
 *
 * Registered as the 'wdp-disputes' custom element via Angular Elements.
 *
 * Key behaviours:
 *  • Receives `appContext` as a DOM property (not an HTML attribute).
 *  • Uses ngOnChanges to react when the shell sets the property after mount.
 *  • Calls appContext.getToken(), awaits the Promise, and displays the result.
 *  • Displays the Angular version from VERSION.full.
 *  • Fetches /disputes from the mock-api and lists them.
 */

import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  VERSION,
  inject
} from '@angular/core';
import { DecimalPipe } from '@angular/common';

// webpack provides require() at runtime; declare it so TypeScript is satisfied.
declare const require: (module: string) => any;

// ── AppContext interface (mirrors the shell's definition) ──────────────────

export interface AppContext {
  appName: string;
  getToken: () => Promise<string>;
  userId: string;
  tenantId: string;
  userRoles: string[];
  shellVersion?: string;
  shellIonicVersion?: string;
}

// ── Dispute model (matches mock-api response) ──────────────────────────────

interface Dispute {
  id: string;
  merchantName: string;
  amount: number;
  status: string;
}

// ── Detail-page static data models ────────────────────────────────────────

interface DisputeNote {
  id: number;
  author: string;
  date: string;
  text: string;
}

interface DisputeDocument {
  name: string;
  type: string;
  size: string;
  date: string;
}

// ── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-root',   // Angular Elements uses the custom element tag, not this selector
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; }
    th { background: #f8f8f8; font-weight: 600; }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: #555;
      margin: 0 0 8px;
    }

  `]
})
export class AppComponent implements OnChanges {

  // ── Input from the shell ─────────────────────────────────────────────────

  @Input() appContext: AppContext | null = null;

  // ── Derived display state ────────────────────────────────────────────────

  /** Angular version running inside this element */
  readonly angularVersion = VERSION.full;

  /** Ionic version running inside this element (resolved by webpack at build time) */
  readonly ionicVersion: string = (require('@ionic/angular/package.json') as { version: string }).version;

  /** Token resolution result */
  tokenStatus: 'idle' | 'loading' | 'ok' | 'error' = 'idle';
  tokenValue: string | null = null;
  tokenError: string | null = null;

  /** Disputes fetched from mock-api */
  disputes: Dispute[] = [];
  disputesStatus: 'idle' | 'loading' | 'ok' | 'error' = 'idle';
  disputesError: string | null = null;

  /** Detail-page navigation state */
  selectedDispute: Dispute | null = null;
  confirmationMessage: string | null = null;

  /** Hardcoded notes shown on every dispute detail page */
  readonly disputeNotes: DisputeNote[] = [
    {
      id: 1,
      author: 'System',
      date: '15 Jan 2024, 09:00',
      text: 'Initial chargeback request submitted by cardholder. Case assigned to dispute team for review.'
    },
    {
      id: 2,
      author: 'J. Williams (Dispute Analyst)',
      date: '17 Jan 2024, 11:45',
      text: 'Supporting documentation requested from merchant. Awaiting merchant response within 5 business days.'
    },
    {
      id: 3,
      author: 'M. Patel (Senior Analyst)',
      date: '22 Jan 2024, 14:20',
      text: 'Merchant response received. Transaction log and delivery confirmation provided. Case under active review.'
    }
  ];

  /** Hardcoded documents shown on every dispute detail page */
  readonly disputeDocuments: DisputeDocument[] = [
    { name: 'Chargeback_Request_Form.pdf',       type: 'PDF', size: '124 KB', date: '15 Jan 2024' },
    { name: 'Cardholder_Statement_Jan2024.pdf',  type: 'PDF', size: '312 KB', date: '15 Jan 2024' },
    { name: 'Merchant_Response_Letter.pdf',      type: 'PDF', size: '89 KB',  date: '22 Jan 2024' }
  ];

  private cdr = inject(ChangeDetectorRef);

  // ── Template helpers ─────────────────────────────────────────────────────

  statusBadgeColorIonic(status: string): string {
    switch (status) {
      case 'open':          return 'warning';
      case 'under-review':  return 'primary';
      case 'resolved':      return 'success';
      default:              return 'medium';
    }
  }

  // ── Token update (called by "Update Token" button in the template) ───────

  updateToken(): void {
    this.resolveToken();
  }

  // ── Detail-page navigation ────────────────────────────────────────────────

  selectDispute(dispute: Dispute): void {
    this.selectedDispute = dispute;
    this.cdr.markForCheck();
  }

  goBack(): void {
    this.selectedDispute = null;
    this.cdr.markForCheck();
  }

  acceptDispute(): void {
    this.confirmationMessage = 'Dispute Accepted';
    this.cdr.markForCheck();
  }

  contestDispute(): void {
    this.confirmationMessage = 'Dispute Contested';
    this.cdr.markForCheck();
  }

  closeConfirmation(): void {
    this.confirmationMessage = null;
    this.selectedDispute = null;
    this.cdr.markForCheck();
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['appContext'] && this.appContext) {
      const isFirstLoad = changes['appContext'].previousValue == null;
      if (isFirstLoad) {
        // First time context arrives: fetch disputes and resolve token.
        await Promise.all([this.resolveToken(), this.fetchDisputes()]);
      } else {
        // Subsequent updates (e.g. org switch): re-resolve token for the new
        // context but keep the disputes list — the data doesn't change per org
        // in this PoC and we don't want a loading flicker on every selection.
        await this.resolveToken();
        this.cdr.markForCheck();
      }
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async resolveToken(): Promise<void> {
    if (!this.appContext?.getToken) return;

    this.tokenStatus = 'loading';
    this.cdr.markForCheck();

    try {
      const token = await this.appContext.getToken();
      this.tokenValue = token;
      this.tokenStatus = 'ok';
    } catch (err: unknown) {
      this.tokenError = err instanceof Error ? err.message : String(err);
      this.tokenStatus = 'error';
    }

    this.cdr.markForCheck();
  }

  private async fetchDisputes(): Promise<void> {
    this.disputesStatus = 'loading';
    this.cdr.markForCheck();

    try {
      const res = await fetch('http://localhost:3001/disputes');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.disputes = await res.json() as Dispute[];
      this.disputesStatus = 'ok';
    } catch (err: unknown) {
      this.disputesError = err instanceof Error ? err.message : String(err);
      this.disputesStatus = 'error';
    }

    this.cdr.markForCheck();
  }
}
