import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

// ── Domain models ─────────────────────────────────────────────────────────────

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

interface QueueDef {
  id: string;
  label: string;
  description: string;
  color: string;
  filter: (d: Dispute) => boolean;
}

interface CaseNote {
  id: number;
  author: string;
  date: string;
  text: string;
}

interface CaseDocument {
  name: string;
  type: string;
  size: string;
  date: string;
}

// ── Predefined queues ─────────────────────────────────────────────────────────

const QUEUES: QueueDef[] = [
  {
    id: 'high-priority',
    label: 'High Priority',
    description: 'Cases flagged as high priority requiring immediate attention',
    color: '#dc2626',
    filter: (d) => d.priority === 'high'
  },
  {
    id: 'escalated',
    label: 'Escalated',
    description: 'Cases escalated to senior analysts',
    color: '#b91c1c',
    filter: (d) => d.status === 'escalated'
  },
  {
    id: 'open-new',
    label: 'Open — New Cases',
    description: 'Newly opened disputes awaiting initial triage',
    color: '#ea580c',
    filter: (d) => d.status === 'open'
  },
  {
    id: 'under-review',
    label: 'Under Review',
    description: 'Cases currently being reviewed by analysts',
    color: '#2563eb',
    filter: (d) => d.status === 'under-review'
  },
  {
    id: 'fraud',
    label: 'Fraud & Unauthorized',
    description: 'Fraud or unauthorized transaction disputes',
    color: '#7c3aed',
    filter: (d) => d.category === 'Fraud' || d.category === 'Unauthorized Transaction'
  },
  {
    id: 'large-amount',
    label: 'Large Amounts',
    description: 'High-value disputes exceeding $500',
    color: '#0f766e',
    filter: (d) => d.amount > 500
  },
  {
    id: 'subscription',
    label: 'Subscription Issues',
    description: 'Subscription and recurring billing disputes',
    color: '#0369a1',
    filter: (d) => d.category === 'Subscription'
  }
];

// ── Static detail-page data (same as disputes-mfe) ────────────────────────────

const NOTES: CaseNote[] = [
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

const DOCS: CaseDocument[] = [
  { name: 'Chargeback_Request_Form.pdf',      type: 'PDF', size: '124 KB', date: '15 Jan 2024' },
  { name: 'Cardholder_Statement_Jan2024.pdf', type: 'PDF', size: '312 KB', date: '15 Jan 2024' },
  { name: 'Merchant_Response_Letter.pdf',     type: 'PDF', size: '89 KB',  date: '22 Jan 2024' }
];

// ── Shared table-header style ─────────────────────────────────────────────────

const TH = 'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;' +
           'color:#9ca3af;padding:0 0 8px;border-bottom:1px solid #e5e7eb;text-align:left;';
const TH_R = TH + 'text-align:right;';

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-queues',
  standalone: true,
  imports: [IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar],
  template: `
    <div class="ion-page">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-menu-button slot="start"></ion-menu-button>
          <ion-title>
            Queues
            @if (!loading() && !error()) {
              &mdash; {{ selectedQueue().label }} ({{ queueCases().length }})
            }
          </ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content style="--overflow: hidden;">
        <div style="position: absolute; inset: 0; display: flex; overflow: hidden;">

          <!-- ═══════════════════════════════════════════════════════════
               LEFT SIDEBAR — Queue list
               ═══════════════════════════════════════════════════════════ -->
          <div style="width: 264px; flex-shrink: 0; overflow-y: auto;
                      background: #fff; border-right: 1px solid #e5e7eb;
                      display: flex; flex-direction: column;">

            <div style="padding: 16px 16px 10px; border-bottom: 1px solid #f3f4f6;">
              <p style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase;
                         letter-spacing: .1em; color: #9ca3af;">Dispute Queues</p>
            </div>

            @for (queue of sortedQueues(); track queue.id) {
              <div (click)="selectQueue(queue.id)"
                   style="padding: 11px 16px; cursor: pointer; border-left: 3px solid transparent;
                          border-bottom: 1px solid #f9fafb;"
                   [style.background]="selectedQueueId() === queue.id ? '#eff6ff' : '#fff'"
                   [style.border-left-color]="selectedQueueId() === queue.id ? '#3880ff' : 'transparent'">
                <div style="display: flex; align-items: center; justify-content: space-between;
                            margin-bottom: 3px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div [style.background]="queue.color"
                         style="width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;"></div>
                    <span style="font-size: 13px; font-weight: 600; color: #111827;">
                      {{ queue.label }}
                    </span>
                  </div>
                  @if (!loading() && !error()) {
                    <span style="font-size: 11px; font-weight: 700; min-width: 22px; text-align: center;
                                 padding: 1px 7px; border-radius: 10px; background: #f3f4f6; color: #374151;">
                      {{ caseCount(queue.id) }}
                    </span>
                  }
                </div>
                <p style="margin: 0 0 0 16px; font-size: 11px; color: #9ca3af; line-height: 1.4;">
                  {{ queue.description }}
                </p>
              </div>
            }
          </div>

          <!-- ═══════════════════════════════════════════════════════════
               RIGHT PANEL — Case list  |  Case detail
               ═══════════════════════════════════════════════════════════ -->
          <div style="flex: 1; overflow-y: auto; background: #f0f4f8;">

            <!-- Loading ───────────────────────────────────────────────── -->
            @if (loading()) {
              <p style="text-align: center; color: #9ca3af; padding: 80px 0; font-size: 15px;">
                Loading disputes from mock-api...
              </p>

            <!-- API error ─────────────────────────────────────────────── -->
            } @else if (error()) {
              <div style="margin: 24px; background: #fef2f2; border-left: 4px solid #dc2626;
                          border-radius: 8px; padding: 16px 20px;">
                <p style="margin: 0 0 4px; font-weight: 700; color: #dc2626;">Cannot reach mock-api</p>
                <p style="margin: 0; font-size: 13px; color: #555;">
                  Start the API:
                  <code style="background: #fee2e2; padding: 1px 6px; border-radius: 3px;">
                    npm run start:api
                  </code>
                  (port 3001)
                </p>
              </div>

            <!-- ── DETAIL VIEW ─────────────────────────────────────────── -->
            } @else if (selectedCase()) {
              <div style="padding: 24px; max-width: 860px;">

                <!-- Back button -->
                <button (click)="goBack()"
                        style="display: inline-flex; align-items: center; gap: 6px; background: none;
                               border: none; cursor: pointer; color: #3880ff; font-size: 13px;
                               font-weight: 600; padding: 0; margin-bottom: 20px;">
                  &#8592; Back to {{ selectedQueue().label }}
                </button>

                <!-- Case header card -->
                <div style="background: #fff; border-radius: 10px; padding: 20px 24px;
                            box-shadow: 0 1px 4px rgba(0,0,0,.07); margin-bottom: 14px;">

                  <div style="display: flex; align-items: flex-start; justify-content: space-between;
                              flex-wrap: wrap; gap: 12px; margin-bottom: 18px;">
                    <div>
                      <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700;
                                 text-transform: uppercase; letter-spacing: .1em; color: #9ca3af;">
                        Case ID
                      </p>
                      <code style="font-size: 17px; font-weight: 700; color: #3880ff;
                                   background: #eff6ff; padding: 4px 12px; border-radius: 6px;">
                        {{ selectedCase()!.id }}
                      </code>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                      <span style="font-size: 12px; font-weight: 700; padding: 5px 13px; border-radius: 20px;"
                            [style.background]="statusBg(selectedCase()!.status)"
                            [style.color]="statusColor(selectedCase()!.status)">
                        {{ statusLabel(selectedCase()!.status) }}
                      </span>
                      <span style="font-size: 12px; font-weight: 700; padding: 5px 13px; border-radius: 20px;"
                            [style.background]="priorityBg(selectedCase()!.priority)"
                            [style.color]="priorityColor(selectedCase()!.priority)">
                        {{ (selectedCase()!.priority ?? 'medium') }} priority
                      </span>
                    </div>
                  </div>

                  <!-- Info grid -->
                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
                              gap: 16px;">
                    <div>
                      <p style="margin: 0 0 3px; font-size: 11px; font-weight: 600;
                                 text-transform: uppercase; letter-spacing: .06em; color: #9ca3af;">
                        Merchant
                      </p>
                      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0d1b2a;">
                        {{ selectedCase()!.merchantName }}
                      </p>
                    </div>
                    <div>
                      <p style="margin: 0 0 3px; font-size: 11px; font-weight: 600;
                                 text-transform: uppercase; letter-spacing: .06em; color: #9ca3af;">
                        Amount at Dispute
                      </p>
                      <p style="margin: 0; font-size: 20px; font-weight: 700; color: #0d1b2a;">
                        {{ fmtAmt(selectedCase()!.amount) }}
                      </p>
                    </div>
                    <div>
                      <p style="margin: 0 0 3px; font-size: 11px; font-weight: 600;
                                 text-transform: uppercase; letter-spacing: .06em; color: #9ca3af;">
                        Category
                      </p>
                      <p style="margin: 0; font-size: 14px; color: #374151;">
                        {{ selectedCase()!.category ?? 'Unknown' }}
                      </p>
                    </div>
                    <div>
                      <p style="margin: 0 0 3px; font-size: 11px; font-weight: 600;
                                 text-transform: uppercase; letter-spacing: .06em; color: #9ca3af;">
                        Organisation
                      </p>
                      <p style="margin: 0; font-size: 14px; color: #374151;">
                        {{ selectedCase()!.orgId ?? '&#8212;' }}
                      </p>
                    </div>
                    <div>
                      <p style="margin: 0 0 3px; font-size: 11px; font-weight: 600;
                                 text-transform: uppercase; letter-spacing: .06em; color: #9ca3af;">
                        Date Filed
                      </p>
                      <p style="margin: 0; font-size: 14px; color: #374151;">
                        {{ selectedCase()!.date ?? '&#8212;' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Action buttons / confirmation -->
                @if (!confirmationMessage()) {
                  <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                    <button (click)="acceptCase()"
                            style="padding: 10px 24px; background: #16a34a; color: #fff;
                                   border: none; border-radius: 8px; font-size: 14px;
                                   font-weight: 700; cursor: pointer;">
                      Accept Case
                    </button>
                    <button (click)="contestCase()"
                            style="padding: 10px 24px; background: #dc2626; color: #fff;
                                   border: none; border-radius: 8px; font-size: 14px;
                                   font-weight: 700; cursor: pointer;">
                      Contest Case
                    </button>
                  </div>
                } @else {
                  <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px;
                              padding: 14px 20px; margin-bottom: 16px; display: flex;
                              align-items: center; justify-content: space-between; gap: 12px;">
                    <div>
                      <p style="margin: 0 0 2px; font-weight: 700; font-size: 14px; color: #15803d;">
                        Action Recorded
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #166534;">
                        {{ confirmationMessage() }}
                      </p>
                    </div>
                    <button (click)="closeConfirmation()"
                            style="flex-shrink: 0; background: #15803d; color: #fff; border: none;
                                   border-radius: 6px; padding: 7px 16px; font-size: 13px;
                                   font-weight: 600; cursor: pointer;">
                      Close
                    </button>
                  </div>
                }

                <!-- Case Notes -->
                <div style="background: #fff; border-radius: 10px; padding: 20px 24px;
                            box-shadow: 0 1px 4px rgba(0,0,0,.07); margin-bottom: 14px;">
                  <p style="margin: 0 0 16px; font-size: 12px; font-weight: 700;
                             text-transform: uppercase; letter-spacing: .07em; color: #6b7280;">
                    Case Notes
                  </p>
                  @for (note of notes; track note.id; let last = $last) {
                    <div [style.padding-bottom]="last ? '0' : '16px'"
                         [style.margin-bottom]="last ? '0' : '16px'"
                         [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'">
                      <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 5px;">
                        <span style="font-size: 13px; font-weight: 700; color: #0d1b2a;">
                          {{ note.author }}
                        </span>
                        <span style="font-size: 11px; color: #9ca3af;">{{ note.date }}</span>
                      </div>
                      <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.65;">
                        {{ note.text }}
                      </p>
                    </div>
                  }
                </div>

                <!-- Documents -->
                <div style="background: #fff; border-radius: 10px; padding: 20px 24px;
                            box-shadow: 0 1px 4px rgba(0,0,0,.07);">
                  <p style="margin: 0 0 16px; font-size: 12px; font-weight: 700;
                             text-transform: uppercase; letter-spacing: .07em; color: #6b7280;">
                    Documents
                  </p>
                  @for (doc of docs; track doc.name; let last = $last) {
                    <div style="display: flex; align-items: center; justify-content: space-between;"
                         [style.padding-bottom]="last ? '0' : '14px'"
                         [style.margin-bottom]="last ? '0' : '14px'"
                         [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 34px; height: 34px; background: #fef2f2; border-radius: 7px;
                                    display: flex; align-items: center; justify-content: center;
                                    font-size: 10px; font-weight: 800; color: #dc2626; flex-shrink: 0;">
                          {{ doc.type }}
                        </div>
                        <div>
                          <p style="margin: 0 0 2px; font-size: 13px; font-weight: 600; color: #0d1b2a;">
                            {{ doc.name }}
                          </p>
                          <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                            {{ doc.size }} &middot; {{ doc.date }}
                          </p>
                        </div>
                      </div>
                      <button style="flex-shrink: 0; background: none; border: 1px solid #e5e7eb;
                                     border-radius: 6px; padding: 5px 14px; font-size: 12px;
                                     color: #374151; cursor: pointer;">
                        Download
                      </button>
                    </div>
                  }
                </div>

              </div>
              <!-- END DETAIL VIEW -->

            <!-- ── CASE LIST ────────────────────────────────────────────── -->
            } @else {
              <div style="padding: 24px;">

                <!-- Queue header -->
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                    <div [style.background]="selectedQueue().color"
                         style="width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;"></div>
                    <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #0d1b2a;">
                      {{ selectedQueue().label }}
                    </h2>
                    <span style="font-size: 13px; font-weight: 700; padding: 2px 10px;
                                 border-radius: 12px; background: #eff6ff; color: #1d4ed8;">
                      {{ queueCases().length }} cases
                    </span>
                  </div>
                  <p style="margin: 0 0 0 20px; font-size: 13px; color: #6b7280;">
                    {{ selectedQueue().description }}
                  </p>
                </div>

                <!-- Empty state -->
                @if (queueCases().length === 0) {
                  <div style="background: #fff; border-radius: 10px; padding: 60px 24px;
                              text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,.06);">
                    <p style="margin: 0 0 6px; font-size: 15px; color: #9ca3af;">No cases in this queue.</p>
                    <p style="margin: 0; font-size: 13px; color: #d1d5db;">
                      All cases matching this criterion have been resolved.
                    </p>
                  </div>

                } @else {

                  <!-- Cases table -->
                  <div style="background: #fff; border-radius: 10px;
                              box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="background: #f9fafb;">
                          <th [style]="TH" style="padding: 12px 12px 12px 20px;">ID</th>
                          <th [style]="TH" style="padding: 12px;">Merchant</th>
                          <th [style]="TH" style="padding: 12px;">Category</th>
                          <th [style]="TH_R" style="padding: 12px;">Amount</th>
                          <th [style]="TH" style="padding: 12px;">Priority</th>
                          <th [style]="TH" style="padding: 12px;">Status</th>
                          <th [style]="TH_R" style="padding: 12px 20px 12px 12px;">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (d of queueCases(); track d.id; let last = $last) {
                          <tr (click)="selectCase(d)"
                              style="cursor: pointer;"
                              onmouseover="this.style.background='#f5f8ff'"
                              onmouseout="this.style.background='transparent'">
                            <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                                style="padding: 13px 12px 13px 20px;">
                              <code style="font-size: 11px; background: #eff6ff; color: #3880ff;
                                           padding: 2px 7px; border-radius: 4px;">
                                {{ d.id }}
                              </code>
                            </td>
                            <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                                style="padding: 13px 12px; font-size: 13px; font-weight: 600;
                                       color: #0d1b2a; max-width: 200px;">
                              {{ d.merchantName }}
                            </td>
                            <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                                style="padding: 13px 12px; font-size: 12px; color: #6b7280;">
                              {{ d.category ?? '&#8212;' }}
                            </td>
                            <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                                style="padding: 13px 12px; font-size: 13px; font-weight: 700;
                                       color: #0d1b2a; text-align: right; white-space: nowrap;">
                              {{ fmtAmt(d.amount) }}
                            </td>
                            <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                                style="padding: 13px 12px;">
                              <span style="font-size: 11px; font-weight: 700; padding: 2px 8px;
                                           border-radius: 10px;"
                                    [style.background]="priorityBg(d.priority)"
                                    [style.color]="priorityColor(d.priority)">
                                {{ d.priority ?? 'medium' }}
                              </span>
                            </td>
                            <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                                style="padding: 13px 12px;">
                              <span style="font-size: 11px; font-weight: 700; padding: 3px 10px;
                                           border-radius: 12px;"
                                    [style.background]="statusBg(d.status)"
                                    [style.color]="statusColor(d.status)">
                                {{ statusLabel(d.status) }}
                              </span>
                            </td>
                            <td [style.border-bottom]="last ? 'none' : '1px solid #f3f4f6'"
                                style="padding: 13px 20px 13px 12px; font-size: 12px; color: #9ca3af;
                                       text-align: right; white-space: nowrap;">
                              {{ d.date ?? '&#8212;' }}
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>

                }
              </div>
            } <!-- END CASE LIST -->

          </div>
          <!-- END RIGHT PANEL -->

        </div>
      </ion-content>
    </div>
  `
})
export class QueuesComponent implements OnInit {

  private http = inject(HttpClient);

  // Expose constants for template bindings
  readonly TH   = TH;
  readonly TH_R = TH_R;
  readonly queues = QUEUES;
  readonly notes  = NOTES;
  readonly docs   = DOCS;

  // ── State signals ─────────────────────────────────────────────────────────

  readonly disputes            = signal<Dispute[]>([]);
  readonly loading             = signal(true);
  readonly error               = signal<string | null>(null);
  readonly selectedQueueId     = signal<string>('high-priority');
  readonly selectedCase        = signal<Dispute | null>(null);
  readonly confirmationMessage = signal<string | null>(null);

  // ── Derived state ─────────────────────────────────────────────────────────

  readonly selectedQueue = computed(
    () => this.queues.find(q => q.id === this.selectedQueueId()) ?? this.queues[0]
  );

  readonly queueCases = computed(() =>
    this.disputes().filter(this.selectedQueue().filter)
  );

  // Queues sorted so empty ones always appear at the bottom.
  // Within each group (non-empty / empty) original order is preserved.
  readonly sortedQueues = computed(() => {
    if (this.loading() || this.disputes().length === 0) return QUEUES;
    const data = this.disputes();
    return [...QUEUES].sort((a, b) => {
      const ca = data.filter(a.filter).length;
      const cb = data.filter(b.filter).length;
      if (ca > 0 && cb === 0) return -1;
      if (ca === 0 && cb > 0) return  1;
      return 0;
    });
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.http.get<Dispute[]>('http://localhost:3001/disputes').subscribe({
      next:  (data) => { this.disputes.set(data); this.loading.set(false); },
      error: ()     => { this.error.set('unreachable'); this.loading.set(false); }
    });
  }

  // ── Queue / case navigation ───────────────────────────────────────────────

  selectQueue(id: string): void {
    this.selectedQueueId.set(id);
    this.selectedCase.set(null);
    this.confirmationMessage.set(null);
  }

  selectCase(d: Dispute): void {
    this.selectedCase.set(d);
    this.confirmationMessage.set(null);
  }

  goBack(): void {
    this.selectedCase.set(null);
    this.confirmationMessage.set(null);
  }

  // ── Case actions ──────────────────────────────────────────────────────────

  acceptCase(): void {
    const id = this.selectedCase()?.id ?? '';
    this.confirmationMessage.set(
      'Case ' + id + ' has been accepted and marked for resolution.'
    );
  }

  contestCase(): void {
    const id = this.selectedCase()?.id ?? '';
    this.confirmationMessage.set(
      'Case ' + id + ' has been contested and flagged for further review.'
    );
  }

  closeConfirmation(): void {
    this.confirmationMessage.set(null);
    this.selectedCase.set(null);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  caseCount(queueId: string): number {
    const q = this.queues.find(q => q.id === queueId);
    return q ? this.disputes().filter(q.filter).length : 0;
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
