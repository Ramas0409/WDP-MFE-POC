import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

interface Dispute {
  id: string;
  merchantName: string;
  amount: number;
  status: string;
  date?: string;
  category?: string;
  orgId?: string;
  priority?: string;
}

interface CategoryStat {
  name: string;
  count: number;
  amount: number;
}

interface StatusRow {
  label: string;
  count: number;
  color: string;
  bg: string;
}

// Header cell style reused across both tables
const TH = 'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;' +
           'color:#9ca3af;padding:0 0 8px;border-bottom:1px solid #f3f4f6;';
const TH_R = TH + 'text-align:right;';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, RouterLink],
  template: `
    <div class="ion-page">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-menu-button slot="start"></ion-menu-button>
          <ion-title>WDP Shell — Disputes Dashboard</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <div style="padding:24px 20px;max-width:1100px;margin:0 auto;background:#f0f4f8;min-height:100%;">

          <!-- ── Page heading ──────────────────────────────────────── -->
          <div style="display:flex;align-items:flex-end;justify-content:space-between;
                      flex-wrap:wrap;gap:8px;margin-bottom:20px;">
            <div>
              <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;
                         letter-spacing:.1em;color:#3880ff;">WDP Team · Analytics</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#0d1b2a;">
                Dispute Analytics Dashboard
              </h1>
            </div>
            <span style="font-size:12px;font-weight:600;padding:4px 14px;border-radius:20px;"
                  [style.background]="loading() ? '#fef9c3' : error() ? '#fee2e2' : '#dcfce7'"
                  [style.color]="loading() ? '#854d0e' : error() ? '#991b1b' : '#166534'">
              {{ loading() ? 'Fetching data...' : error() ? 'API unreachable' : 'Live · mock-api port 3001' }}
            </span>
          </div>

          <!-- ── Loading ───────────────────────────────────────────── -->
          @if (loading()) {
            <p style="text-align:center;color:#9ca3af;padding:60px 0;font-size:15px;">
              Loading disputes from mock-api...
            </p>

          <!-- ── API Error ─────────────────────────────────────────── -->
          } @else if (error()) {
            <div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:8px;
                        padding:16px 20px;">
              <p style="margin:0 0 4px;font-weight:700;color:#dc2626;">Cannot reach mock-api</p>
              <p style="margin:0;font-size:13px;color:#555;">
                Start the API: <code style="background:#fee2e2;padding:1px 6px;border-radius:3px;">npm run start:api</code>
                (port 3001)
              </p>
            </div>

          } @else {

            <!-- ── KPI Cards ─────────────────────────────────────── -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));
                        gap:12px;margin-bottom:12px;">

              <div style="background:#fff;border-radius:10px;padding:16px 14px;
                          border-top:3px solid #3880ff;box-shadow:0 1px 4px rgba(0,0,0,.06);">
                <div style="font-size:34px;font-weight:700;color:#0d1b2a;line-height:1;">{{ total() }}</div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                             letter-spacing:.07em;color:#9ca3af;margin-top:4px;">Total</div>
              </div>

              <div style="background:#fff;border-radius:10px;padding:16px 14px;
                          border-top:3px solid #f97316;box-shadow:0 1px 4px rgba(0,0,0,.06);">
                <div style="font-size:34px;font-weight:700;color:#f97316;line-height:1;">{{ openCount() }}</div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                             letter-spacing:.07em;color:#9ca3af;margin-top:4px;">Open</div>
              </div>

              <div style="background:#fff;border-radius:10px;padding:16px 14px;
                          border-top:3px solid #3b82f6;box-shadow:0 1px 4px rgba(0,0,0,.06);">
                <div style="font-size:34px;font-weight:700;color:#3b82f6;line-height:1;">{{ underReviewCount() }}</div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                             letter-spacing:.07em;color:#9ca3af;margin-top:4px;">Under Review</div>
              </div>

              <div style="background:#fff;border-radius:10px;padding:16px 14px;
                          border-top:3px solid #ef4444;box-shadow:0 1px 4px rgba(0,0,0,.06);">
                <div style="font-size:34px;font-weight:700;color:#ef4444;line-height:1;">{{ escalatedCount() }}</div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                             letter-spacing:.07em;color:#9ca3af;margin-top:4px;">Escalated</div>
              </div>

              <div style="background:#fff;border-radius:10px;padding:16px 14px;
                          border-top:3px solid #22c55e;box-shadow:0 1px 4px rgba(0,0,0,.06);">
                <div style="font-size:34px;font-weight:700;color:#22c55e;line-height:1;">{{ resolvedCount() }}</div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                             letter-spacing:.07em;color:#9ca3af;margin-top:4px;">Resolved</div>
              </div>

              <div style="background:#fff;border-radius:10px;padding:16px 14px;
                          border-top:3px solid #6b7280;box-shadow:0 1px 4px rgba(0,0,0,.06);">
                <div style="font-size:34px;font-weight:700;color:#6b7280;line-height:1;">{{ closedCount() }}</div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                             letter-spacing:.07em;color:#9ca3af;margin-top:4px;">Closed</div>
              </div>

            </div>

            <!-- ── Amount + Resolution Banner ───────────────────── -->
            <div style="background:linear-gradient(135deg,#1e3a8a 0%,#3880ff 100%);
                        border-radius:10px;padding:18px 24px;margin-bottom:20px;
                        display:flex;align-items:center;justify-content:space-between;
                        box-shadow:0 2px 8px rgba(56,128,255,.3);">
              <div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                             letter-spacing:.1em;color:rgba(255,255,255,.65);">
                  Total Amount at Dispute
                </div>
                <div style="font-size:36px;font-weight:700;color:#fff;margin-top:2px;letter-spacing:-.5px;">
                  {{ fmtAmt(totalAmount()) }}
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                             letter-spacing:.1em;color:rgba(255,255,255,.65);">Resolution Rate</div>
                <div style="font-size:36px;font-weight:700;color:#fff;margin-top:2px;">
                  {{ resolutionPct() }}%
                </div>
                <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px;">
                  {{ resolvedCount() + closedCount() }} of {{ total() }} cases closed
                </div>
              </div>
            </div>

            <!-- ── Analytics Grid ────────────────────────────────── -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">

              <!-- Status Distribution -->
              <div style="background:#fff;border-radius:10px;padding:20px;
                          box-shadow:0 1px 4px rgba(0,0,0,.06);">
                <p style="margin:0 0 16px;font-size:12px;font-weight:700;text-transform:uppercase;
                           letter-spacing:.07em;color:#6b7280;">Status Distribution</p>

                <!-- Stacked bar -->
                <div style="display:flex;height:10px;border-radius:5px;overflow:hidden;
                            background:#f3f4f6;margin-bottom:18px;">
                  @for (row of statusRows(); track row.label) {
                    <div [style.width]="barPct(row.count)"
                         [style.background]="row.color"
                         style="transition:width .5s ease;height:100%;">
                    </div>
                  }
                </div>

                <!-- Legend rows -->
                @for (row of statusRows(); track row.label) {
                  <div style="display:flex;align-items:center;justify-content:space-between;
                              margin-bottom:10px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <div [style.background]="row.color"
                           style="width:9px;height:9px;border-radius:2px;flex-shrink:0;"></div>
                      <span style="font-size:13px;color:#374151;">{{ row.label }}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <!-- Mini bar -->
                      <div style="width:80px;height:5px;background:#f3f4f6;border-radius:3px;overflow:hidden;">
                        <div [style.width]="barPct(row.count)"
                             [style.background]="row.color"
                             style="height:100%;transition:width .5s ease;"></div>
                      </div>
                      <span style="font-size:13px;font-weight:700;color:#0d1b2a;min-width:18px;text-align:right;">
                        {{ row.count }}
                      </span>
                      <span style="font-size:11px;color:#9ca3af;min-width:30px;text-align:right;">
                        {{ barPct(row.count) }}
                      </span>
                    </div>
                  </div>
                }
              </div>

              <!-- Category Breakdown -->
              <div style="background:#fff;border-radius:10px;padding:20px;
                          box-shadow:0 1px 4px rgba(0,0,0,.06);">
                <p style="margin:0 0 16px;font-size:12px;font-weight:700;text-transform:uppercase;
                           letter-spacing:.07em;color:#6b7280;">Category Breakdown</p>
                <table style="width:100%;border-collapse:collapse;">
                  <thead>
                    <tr>
                      <th [style]="TH" style="text-align:left;padding-right:8px;">Category</th>
                      <th [style]="TH_R">Cases</th>
                      <th [style]="TH_R">Amount</th>
                      <th [style]="TH_R">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (cat of categories(); track cat.name; let last = $last) {
                      <tr>
                        <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                            style="padding:8px 8px 8px 0;font-size:13px;color:#374151;">
                          {{ cat.name }}
                        </td>
                        <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                            style="padding:8px 0 8px 8px;font-size:13px;font-weight:700;
                                   color:#0d1b2a;text-align:right;">
                          {{ cat.count }}
                        </td>
                        <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                            style="padding:8px 0 8px 8px;font-size:12px;color:#6b7280;text-align:right;">
                          {{ fmtAmt(cat.amount) }}
                        </td>
                        <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                            style="padding:8px 0 8px 8px;text-align:right;">
                          <span style="font-size:11px;font-weight:700;padding:2px 6px;
                                       border-radius:10px;background:#eff6ff;color:#1d4ed8;">
                            {{ barPct(cat.count) }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

            </div>

            <!-- ── Recent Disputes ───────────────────────────────── -->
            <div style="background:#fff;border-radius:10px;padding:20px;
                        box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:20px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;
                           letter-spacing:.07em;color:#6b7280;">Recent Disputes</p>
                <a routerLink="/disputes"
                   style="font-size:12px;font-weight:700;color:#3880ff;text-decoration:none;">
                  Open Disputes MFE →
                </a>
              </div>
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr>
                    <th [style]="TH" style="text-align:left;">ID</th>
                    <th [style]="TH" style="text-align:left;padding-left:12px;">Merchant</th>
                    <th [style]="TH" style="text-align:left;padding-left:12px;">Category</th>
                    <th [style]="TH_R">Amount</th>
                    <th [style]="TH" style="text-align:left;padding-left:12px;">Priority</th>
                    <th [style]="TH" style="text-align:left;padding-left:12px;">Status</th>
                    <th [style]="TH_R">Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (d of recent(); track d.id; let last = $last) {
                    <tr>
                      <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                          style="padding:10px 0;">
                        <code style="font-size:11px;background:#eff6ff;color:#3880ff;
                                     padding:2px 6px;border-radius:4px;">{{ d.id }}</code>
                      </td>
                      <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                          style="padding:10px 0 10px 12px;font-size:13px;font-weight:600;color:#0d1b2a;">
                        {{ d.merchantName }}
                      </td>
                      <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                          style="padding:10px 0 10px 12px;font-size:12px;color:#6b7280;">
                        {{ d.category ?? 'Unknown' }}
                      </td>
                      <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                          style="padding:10px 0;font-size:13px;font-weight:700;
                                 color:#0d1b2a;text-align:right;white-space:nowrap;">
                        {{ fmtAmt(d.amount) }}
                      </td>
                      <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                          style="padding:10px 0 10px 12px;">
                        <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;"
                              [style.background]="priorityBg(d.priority)"
                              [style.color]="priorityColor(d.priority)">
                          {{ d.priority ?? 'medium' }}
                        </span>
                      </td>
                      <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                          style="padding:10px 0 10px 12px;">
                        <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:12px;"
                              [style.background]="statusBg(d.status)"
                              [style.color]="statusColor(d.status)">
                          {{ statusLabel(d.status) }}
                        </span>
                      </td>
                      <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                          style="padding:10px 0;font-size:12px;color:#9ca3af;
                                 text-align:right;white-space:nowrap;">
                        {{ d.date ?? '' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

          } <!-- end @else (data loaded) -->

        </div>
      </ion-content>
    </div>
  `
})
export class HomeComponent implements OnInit {

  private http = inject(HttpClient);

  readonly TH   = TH;
  readonly TH_R = TH_R;

  // ── State ─────────────────────────────────────────────────────────────────

  readonly disputes = signal<Dispute[]>([]);
  readonly loading  = signal(true);
  readonly error    = signal<string | null>(null);

  // ── Computed metrics ──────────────────────────────────────────────────────

  readonly total            = computed(() => this.disputes().length);
  readonly openCount        = computed(() => this.disputes().filter(d => d.status === 'open').length);
  readonly underReviewCount = computed(() => this.disputes().filter(d => d.status === 'under-review').length);
  readonly escalatedCount   = computed(() => this.disputes().filter(d => d.status === 'escalated').length);
  readonly resolvedCount    = computed(() => this.disputes().filter(d => d.status === 'resolved').length);
  readonly closedCount      = computed(() => this.disputes().filter(d => d.status === 'closed').length);
  readonly totalAmount      = computed(() => this.disputes().reduce((s, d) => s + d.amount, 0));
  readonly resolutionPct    = computed(() => {
    const t = this.total();
    return t ? Math.round(((this.resolvedCount() + this.closedCount()) / t) * 100) : 0;
  });

  readonly recent = computed(() => [...this.disputes()].reverse().slice(0, 5));

  readonly categories = computed((): CategoryStat[] => {
    const map = new Map<string, { count: number; amount: number }>();
    for (const d of this.disputes()) {
      const cat = d.category ?? 'Unknown';
      const e = map.get(cat) ?? { count: 0, amount: 0 };
      map.set(cat, { count: e.count + 1, amount: e.amount + d.amount });
    }
    return [...map.entries()]
      .map(([name, s]) => ({ name, count: s.count, amount: s.amount }))
      .sort((a, b) => b.count - a.count);
  });

  readonly statusRows = computed((): StatusRow[] => [
    { label: 'Open',         count: this.openCount(),        color: '#f97316', bg: '#fff7ed' },
    { label: 'Under Review', count: this.underReviewCount(), color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Escalated',    count: this.escalatedCount(),   color: '#ef4444', bg: '#fef2f2' },
    { label: 'Resolved',     count: this.resolvedCount(),    color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Closed',       count: this.closedCount(),      color: '#6b7280', bg: '#f9fafb' },
  ]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.http.get<Dispute[]>('http://localhost:3001/disputes').subscribe({
      next:  (data) => { this.disputes.set(data); this.loading.set(false); },
      error: ()     => { this.error.set('unreachable'); this.loading.set(false); }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  barPct(n: number): string {
    const t = this.total();
    return t ? Math.round((n / t) * 100) + '%' : '0%';
  }

  fmtAmt(n: number): string {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  statusColor(s: string): string {
    const m: Record<string, string> = {
      'open': '#c2410c', 'under-review': '#1d4ed8',
      'escalated': '#b91c1c', 'resolved': '#15803d', 'closed': '#374151'
    };
    return m[s] ?? '#6b7280';
  }

  statusBg(s: string): string {
    const m: Record<string, string> = {
      'open': '#fff7ed', 'under-review': '#eff6ff',
      'escalated': '#fef2f2', 'resolved': '#f0fdf4', 'closed': '#f9fafb'
    };
    return m[s] ?? '#f3f4f6';
  }

  statusLabel(s: string): string {
    return s === 'under-review' ? 'Under Review' : s.charAt(0).toUpperCase() + s.slice(1);
  }

  priorityColor(p: string = 'medium'): string {
    return p === 'high' ? '#b91c1c' : p === 'low' ? '#15803d' : '#92400e';
  }

  priorityBg(p: string = 'medium'): string {
    return p === 'high' ? '#fef2f2' : p === 'low' ? '#f0fdf4' : '#fffbeb';
  }
}
