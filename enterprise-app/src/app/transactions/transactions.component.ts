import { Component } from '@angular/core';
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';

interface Transaction {
  id: string;
  date: string;
  description: string;
  orgId: string;
  type: 'ACH Credit' | 'ACH Debit' | 'Wire' | 'Card';
  amount: number;
  account: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Under Review';
}

const TH = 'background:#1B2A4A;color:rgba(255,255,255,0.85);font-size:11px;font-weight:700;' +
           'text-transform:uppercase;letter-spacing:.06em;padding:10px 12px;text-align:left;';
const TH_R = TH + 'text-align:right;';
const TD = 'padding:10px 12px;border-bottom:1px solid #E8EDF5;font-size:13px;vertical-align:middle;';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [IonCard, IonCardContent, IonBadge, IonSelect, IonSelectOption],
  template: `
    <div class="page">
      <header class="page-toolbar">
        <span class="page-title">Transaction Search</span>
      </header>
      <div class="page-content" style="padding: 28px;">

        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: .1em;
                   text-transform: uppercase; color: #C9921A;">Enterprise Corp · Transactions</p>
        <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 700; color: #1B2A4A;">
          Transaction Search
        </h1>

        <!-- ── Stats ────────────────────────────────────────────────────── -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">

          <ion-card style="margin: 0; --background: #fff;">
            <ion-card-content style="text-align: center; padding: 14px 8px;">
              <div style="font-size: 28px; font-weight: 700; color: #1B2A4A;">{{ filtered.length }}</div>
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                           letter-spacing: .08em; color: #888; margin-top: 2px;">Transactions</div>
            </ion-card-content>
          </ion-card>

          <ion-card style="margin: 0; --background: #fff;">
            <ion-card-content style="text-align: center; padding: 14px 8px;">
              <div style="font-size: 22px; font-weight: 700; color: #2E6DA4;">
                {{ fmtAmount(totalVolume) }}
              </div>
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                           letter-spacing: .08em; color: #888; margin-top: 2px;">Total Volume</div>
            </ion-card-content>
          </ion-card>

          <ion-card style="margin: 0; --background: #fff;">
            <ion-card-content style="text-align: center; padding: 14px 8px;">
              <div style="font-size: 28px; font-weight: 700; color: #C9921A;">{{ pendingCount }}</div>
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                           letter-spacing: .08em; color: #888; margin-top: 2px;">Pending / Review</div>
            </ion-card-content>
          </ion-card>

          <ion-card style="margin: 0; --background: #fff;">
            <ion-card-content style="text-align: center; padding: 14px 8px;">
              <div style="font-size: 28px; font-weight: 700; color: #c62828;">{{ failedCount }}</div>
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                           letter-spacing: .08em; color: #888; margin-top: 2px;">Failed</div>
            </ion-card-content>
          </ion-card>

        </div>

        <!-- ── Filters ──────────────────────────────────────────────────── -->
        <ion-card style="margin: 0 0 16px; --background: #fff;">
          <ion-card-content style="padding: 12px 16px;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">

              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                            letter-spacing: .1em; color: #2E6DA4;">Filter</span>

              <!-- Search -->
              <input
                type="text"
                placeholder="Search ID or description…"
                [value]="searchText"
                (input)="searchText = $any($event.target).value"
                style="flex: 1; min-width: 200px; max-width: 300px; font-size: 12px;
                       border: 1px solid #CBD5E8; border-radius: 6px; padding: 5px 10px;
                       outline: none; color: #1B2A4A;" />

              <!-- Status filter -->
              <ion-select
                [value]="filterStatus"
                (ionChange)="filterStatus = $event.detail.value"
                interface="popover"
                style="min-width: 130px; font-size: 12px; border: 1px solid #CBD5E8;
                       border-radius: 6px; --padding-start: 8px; --padding-end: 8px;
                       --padding-top: 3px; --padding-bottom: 3px; background: #fff;">
                <ion-select-option value="all">All Statuses</ion-select-option>
                <ion-select-option value="Completed">Completed</ion-select-option>
                <ion-select-option value="Pending">Pending</ion-select-option>
                <ion-select-option value="Under Review">Under Review</ion-select-option>
                <ion-select-option value="Failed">Failed</ion-select-option>
              </ion-select>

              <!-- Type filter -->
              <ion-select
                [value]="filterType"
                (ionChange)="filterType = $event.detail.value"
                interface="popover"
                style="min-width: 130px; font-size: 12px; border: 1px solid #CBD5E8;
                       border-radius: 6px; --padding-start: 8px; --padding-end: 8px;
                       --padding-top: 3px; --padding-bottom: 3px; background: #fff;">
                <ion-select-option value="all">All Types</ion-select-option>
                <ion-select-option value="Wire">Wire</ion-select-option>
                <ion-select-option value="ACH Credit">ACH Credit</ion-select-option>
                <ion-select-option value="ACH Debit">ACH Debit</ion-select-option>
                <ion-select-option value="Card">Card</ion-select-option>
              </ion-select>

              <!-- Org filter -->
              <ion-select
                [value]="filterOrg"
                (ionChange)="filterOrg = $event.detail.value"
                interface="popover"
                style="min-width: 120px; font-size: 12px; border: 1px solid #CBD5E8;
                       border-radius: 6px; --padding-start: 8px; --padding-end: 8px;
                       --padding-top: 3px; --padding-bottom: 3px; background: #fff;">
                <ion-select-option value="all">All Orgs</ion-select-option>
                <ion-select-option value="org-001">org-001</ion-select-option>
                <ion-select-option value="org-002">org-002</ion-select-option>
                <ion-select-option value="org-003">org-003</ion-select-option>
                <ion-select-option value="org-004">org-004</ion-select-option>
                <ion-select-option value="org-005">org-005</ion-select-option>
              </ion-select>

              @if (searchText || filterStatus !== 'all' || filterType !== 'all' || filterOrg !== 'all') {
                <button
                  (click)="clearFilters()"
                  style="font-size: 11px; color: #2E6DA4; background: none; border: none;
                         cursor: pointer; text-decoration: underline; padding: 0;">
                  Clear filters
                </button>
              }

            </div>
          </ion-card-content>
        </ion-card>

        <!-- ── Table ────────────────────────────────────────────────────── -->
        <ion-card style="margin: 0; --background: #fff;">
          <ion-card-content style="padding: 0; overflow-x: auto;">
            <div style="padding: 14px 16px 10px; border-bottom: 1px solid #E8EDF5;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase;
                            letter-spacing: .08em; color: #555;">
                Transactions — {{ filtered.length }} of {{ transactions.length }} records
              </span>
            </div>

            @if (filtered.length === 0) {
              <p style="padding: 24px; text-align: center; color: #888; font-style: italic;">
                No transactions match the current filters.
              </p>
            } @else {
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th [style]="TH">Transaction ID</th>
                    <th [style]="TH">Date</th>
                    <th [style]="TH">Description</th>
                    <th [style]="TH">Org</th>
                    <th [style]="TH">Type</th>
                    <th [style]="TH_R">Amount</th>
                    <th [style]="TH">Account</th>
                    <th [style]="TH">Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of filtered; track t.id; let last = $last) {
                    <tr>
                      <td [style]="last ? tdNoBorder : TD">
                        <code style="color: #2E6DA4; font-size: 11px; background: #EEF4FB;
                                     padding: 2px 6px; border-radius: 4px;">{{ t.id }}</code>
                      </td>
                      <td [style]="(last ? tdNoBorder : TD) + 'color:#555;font-size:12px;white-space:nowrap;'">{{ t.date }}</td>
                      <td [style]="(last ? tdNoBorder : TD) + 'font-weight:600;color:#1B2A4A;max-width:220px;'">{{ t.description }}</td>
                      <td [style]="last ? tdNoBorder : TD">
                        <code style="color: #555; font-size: 11px; background: #F4F4F4;
                                     padding: 2px 6px; border-radius: 4px;">{{ t.orgId }}</code>
                      </td>
                      <td [style]="last ? tdNoBorder : TD">
                        <ion-badge [color]="typeBadgeColor(t.type)" style="font-size: 10px; white-space: nowrap;">
                          {{ t.type }}
                        </ion-badge>
                      </td>
                      <td [style]="(last ? tdNoBorder : TD) + 'text-align:right;font-weight:700;color:#1B2A4A;white-space:nowrap;'">
                        {{ fmtAmount(t.amount) }}
                      </td>
                      <td [style]="last ? tdNoBorder : TD">
                        <code style="color: #555; font-size: 11px;">{{ t.account }}</code>
                      </td>
                      <td [style]="last ? tdNoBorder : TD">
                        <ion-badge [color]="statusBadgeColor(t.status)" style="font-size: 11px;">
                          {{ t.status }}
                        </ion-badge>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </ion-card-content>
        </ion-card>

      </div>
    </div>
  `
})
export class TransactionsComponent {

  readonly TH    = TH;
  readonly TH_R  = TH_R;
  readonly TD    = TD;
  readonly tdNoBorder = TD.replace('border-bottom:1px solid #E8EDF5;', '');

  searchText   = '';
  filterStatus = 'all';
  filterType   = 'all';
  filterOrg    = 'all';

  readonly transactions: Transaction[] = [
    { id: 'TXN-20240115-0042', date: '15 Jan 2024', description: 'Payroll Processing',          orgId: 'org-001', type: 'ACH Credit', amount: 2_847_500,  account: 'ACC-001-PAY', status: 'Completed'    },
    { id: 'TXN-20240116-0187', date: '16 Jan 2024', description: 'Interbank Wire Transfer',      orgId: 'org-002', type: 'Wire',       amount:   450_000,  account: 'ACC-002-WIR', status: 'Completed'    },
    { id: 'TXN-20240117-0293', date: '17 Jan 2024', description: 'API Settlement — NovaPay',     orgId: 'org-003', type: 'ACH Debit',  amount:    12_340,  account: 'ACC-003-API', status: 'Under Review'  },
    { id: 'TXN-20240118-0041', date: '18 Jan 2024', description: 'Payroll Run — Q1 Cycle',       orgId: 'org-004', type: 'ACH Credit', amount: 5_210_000,  account: 'ACC-004-PAY', status: 'Pending'       },
    { id: 'TXN-20240119-0054', date: '19 Jan 2024', description: 'Treasury Transfer',             orgId: 'org-005', type: 'Wire',       amount:   780_000,  account: 'ACC-005-TRS', status: 'Completed'    },
    { id: 'TXN-20240120-0078', date: '20 Jan 2024', description: 'Vendor Payment Batch',         orgId: 'org-001', type: 'ACH Debit',  amount:    34_200,  account: 'ACC-001-VND', status: 'Completed'    },
    { id: 'TXN-20240120-0099', date: '20 Jan 2024', description: 'Member Withdrawal',            orgId: 'org-002', type: 'ACH Debit',  amount:     8_750,  account: 'ACC-002-WDR', status: 'Failed'        },
    { id: 'TXN-20240121-0112', date: '21 Jan 2024', description: 'Merchant Settlement',          orgId: 'org-003', type: 'ACH Credit', amount:    67_890,  account: 'ACC-003-MER', status: 'Completed'    },
    { id: 'TXN-20240121-0134', date: '21 Jan 2024', description: 'Expense Reimbursement',        orgId: 'org-004', type: 'ACH Credit', amount:    22_450,  account: 'ACC-004-EXP', status: 'Completed'    },
    { id: 'TXN-20240122-0155', date: '22 Jan 2024', description: 'Card Settlement Batch',        orgId: 'org-001', type: 'Card',       amount: 1_247_300,  account: 'ACC-001-CRD', status: 'Completed'    },
    { id: 'TXN-20240122-0167', date: '22 Jan 2024', description: 'Large Treasury Transfer',      orgId: 'org-005', type: 'Wire',       amount: 3_500_000,  account: 'ACC-005-TRS', status: 'Under Review'  },
    { id: 'TXN-20240123-0178', date: '23 Jan 2024', description: 'Loan Disbursement',            orgId: 'org-002', type: 'Wire',       amount:   125_000,  account: 'ACC-002-LNS', status: 'Completed'    },
    { id: 'TXN-20240123-0190', date: '23 Jan 2024', description: 'Chargeback Settlement',        orgId: 'org-003', type: 'ACH Debit',  amount:     4_560,  account: 'ACC-003-CHB', status: 'Pending'       },
    { id: 'TXN-20240124-0201', date: '24 Jan 2024', description: 'Supplier Payment — Q1',        orgId: 'org-004', type: 'ACH Debit',  amount:   892_100,  account: 'ACC-004-SUP', status: 'Failed'        },
    { id: 'TXN-20240124-0214', date: '24 Jan 2024', description: 'Fed Wire — End-of-Day',        orgId: 'org-005', type: 'Wire',       amount: 10_000_000, account: 'ACC-005-FED', status: 'Completed'    },
  ];

  get filtered(): Transaction[] {
    const q = this.searchText.toLowerCase();
    return this.transactions.filter(t =>
      (!q || t.id.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) &&
      (this.filterStatus === 'all' || t.status === this.filterStatus) &&
      (this.filterType   === 'all' || t.type   === this.filterType)   &&
      (this.filterOrg    === 'all' || t.orgId   === this.filterOrg)
    );
  }

  get totalVolume():  number { return this.filtered.reduce((s, t) => s + t.amount, 0); }
  get pendingCount(): number { return this.filtered.filter(t => t.status === 'Pending' || t.status === 'Under Review').length; }
  get failedCount():  number { return this.filtered.filter(t => t.status === 'Failed').length; }

  clearFilters(): void {
    this.searchText   = '';
    this.filterStatus = 'all';
    this.filterType   = 'all';
    this.filterOrg    = 'all';
  }

  statusBadgeColor(status: string): string {
    switch (status) {
      case 'Completed':    return 'success';
      case 'Pending':      return 'warning';
      case 'Failed':       return 'danger';
      case 'Under Review': return 'primary';
      default:             return 'medium';
    }
  }

  fmtAmount(n: number): string {
    return '$' + n.toLocaleString('en-US');
  }

  typeBadgeColor(type: string): string {
    switch (type) {
      case 'Wire':       return 'primary';
      case 'ACH Credit': return 'success';
      case 'ACH Debit':  return 'warning';
      case 'Card':       return 'secondary';
      default:           return 'medium';
    }
  }
}
