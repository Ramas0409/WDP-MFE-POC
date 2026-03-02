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

// ── AppContext interface (mirrors the shell's definition) ──────────────────

export interface AppContext {
  appName: string;
  getToken: () => Promise<string>;
  userId: string;
  tenantId: string;
  userRoles: string[];
}

// ── Dispute model (matches mock-api response) ──────────────────────────────

interface Dispute {
  id: string;
  merchantName: string;
  amount: number;
  status: string;
}

// ── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-root',   // Angular Elements uses the custom element tag, not this selector
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './app.component.html',
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-info    { background: #e3f2fd; color: #1565c0; }
    .badge-success { background: #e8f5e9; color: #2e7d32; }
    .badge-warn    { background: #fff3e0; color: #e65100; }
    .badge-neutral { background: #f5f5f5; color: #616161; }

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

    .token-ok  { color: #2e7d32; font-weight: 600; }
    .token-err { color: #c62828; font-weight: 600; }
  `]
})
export class AppComponent implements OnChanges {

  // ── Input from the shell ─────────────────────────────────────────────────

  @Input() appContext: AppContext | null = null;

  // ── Derived display state ────────────────────────────────────────────────

  /** Angular version running inside this element */
  readonly angularVersion = VERSION.full;

  /** Token resolution result */
  tokenStatus: 'idle' | 'loading' | 'ok' | 'error' = 'idle';
  tokenValue: string | null = null;
  tokenError: string | null = null;

  /** Disputes fetched from mock-api */
  disputes: Dispute[] = [];
  disputesStatus: 'idle' | 'loading' | 'ok' | 'error' = 'idle';
  disputesError: string | null = null;

  private cdr = inject(ChangeDetectorRef);

  // ── Template helpers ─────────────────────────────────────────────────────

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'open':          return 'badge-warn';
      case 'under-review':  return 'badge-info';
      case 'resolved':      return 'badge-success';
      default:              return 'badge-neutral';
    }
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['appContext'] && this.appContext) {
      // Run both async operations in parallel once context arrives.
      await Promise.all([
        this.resolveToken(),
        this.fetchDisputes()
      ]);
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
