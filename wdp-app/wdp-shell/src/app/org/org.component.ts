import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

interface Org {
  id: string;
  name: string;
  type: 'Bank' | 'Credit Union' | 'Fintech' | 'Enterprise';
  region: string;
  status: 'Active' | 'Inactive';
  userCount: number;
  createdDate: string;
}

@Component({
  selector: 'app-org',
  standalone: true,
  imports: [DecimalPipe, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar,
            IonBadge, IonCard, IonCardContent],
  styles: [`
    table { width: 100%; border-collapse: collapse; }
    th { background: #f0f4ff; font-size: 11px; font-weight: 700; text-transform: uppercase;
         letter-spacing: .06em; color: #555; padding: 10px 12px; text-align: left;
         border-bottom: 2px solid #dde4f5; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f5f8ff; }
  `],
  template: `
    <div class="ion-page">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-menu-button slot="start"></ion-menu-button>
          <ion-title>WDP Shell — Org Management</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content style="--background: #EEF2F7;">
        <div style="padding: 20px;">

          <!-- Summary stats -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
            <ion-card style="margin: 0;">
              <ion-card-content style="text-align: center; padding: 14px 8px;">
                <div style="font-size: 30px; font-weight: 700; color: #1565c0;">{{ orgs.length }}</div>
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                             letter-spacing: .08em; color: #888; margin-top: 2px;">Total Orgs</div>
              </ion-card-content>
            </ion-card>
            <ion-card style="margin: 0;">
              <ion-card-content style="text-align: center; padding: 14px 8px;">
                <div style="font-size: 30px; font-weight: 700; color: #2e7d32;">{{ activeCount }}</div>
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                             letter-spacing: .08em; color: #888; margin-top: 2px;">Active</div>
              </ion-card-content>
            </ion-card>
            <ion-card style="margin: 0;">
              <ion-card-content style="text-align: center; padding: 14px 8px;">
                <div style="font-size: 30px; font-weight: 700; color: #555;">{{ totalUsers | number }}</div>
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                             letter-spacing: .08em; color: #888; margin-top: 2px;">Total Users</div>
              </ion-card-content>
            </ion-card>
            <ion-card style="margin: 0;">
              <ion-card-content style="text-align: center; padding: 14px 8px;">
                <div style="font-size: 30px; font-weight: 700; color: #7c3aed;">{{ orgTypes }}</div>
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                             letter-spacing: .08em; color: #888; margin-top: 2px;">Org Types</div>
              </ion-card-content>
            </ion-card>
          </div>

          <!-- Orgs table -->
          <ion-card style="margin: 0;">
            <ion-card-content style="padding: 16px;">
              <p style="font-size: 11px; font-weight: 700; text-transform: uppercase;
                         letter-spacing: .08em; color: #555; margin: 0 0 14px;">
                Organisations — {{ orgs.length }} records
              </p>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Region</th>
                    <th style="text-align: right;">Users</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  @for (o of orgs; track o.id) {
                    <tr>
                      <td>
                        <code style="color: #1565c0; font-size: 12px; background: #f0f4ff;
                                     padding: 2px 6px; border-radius: 4px;">
                          {{ o.id }}
                        </code>
                      </td>
                      <td style="font-weight: 600; color: #1a1a1a;">{{ o.name }}</td>
                      <td>
                        <ion-badge [color]="typeBadgeColor(o.type)" style="font-size: 10px;">
                          {{ o.type }}
                        </ion-badge>
                      </td>
                      <td style="color: #555; font-size: 12px;">{{ o.region }}</td>
                      <td style="text-align: right; font-weight: 600; color: #333;">
                        {{ o.userCount | number }}
                      </td>
                      <td>
                        <ion-badge [color]="o.status === 'Active' ? 'success' : 'medium'"
                                   style="font-size: 11px;">
                          {{ o.status }}
                        </ion-badge>
                      </td>
                      <td style="color: #777; font-size: 12px;">{{ o.createdDate }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </ion-card-content>
          </ion-card>

        </div>
      </ion-content>
    </div>
  `
})
export class OrgComponent {

  readonly orgs: Org[] = [
    { id: 'org-001', name: 'Alpha Financial Group',  type: 'Bank',         region: 'US-East', status: 'Active',   userCount: 247, createdDate: '15 Jun 2023' },
    { id: 'org-002', name: 'Pacific Credit Union',   type: 'Credit Union', region: 'US-West', status: 'Active',   userCount: 89,  createdDate: '22 Aug 2023' },
    { id: 'org-003', name: 'NovaPay Fintech',        type: 'Fintech',      region: 'EU',      status: 'Active',   userCount: 34,  createdDate: '10 Oct 2023' },
    { id: 'org-004', name: 'Global Enterprise Corp', type: 'Enterprise',   region: 'US-East', status: 'Inactive', userCount: 512, createdDate: '03 Mar 2023' },
    { id: 'org-005', name: 'Coastal Bank',           type: 'Bank',         region: 'US-West', status: 'Active',   userCount: 183, createdDate: '01 Nov 2023' },
  ];

  get activeCount(): number { return this.orgs.filter(o => o.status === 'Active').length; }
  get totalUsers():  number { return this.orgs.reduce((sum, o) => sum + o.userCount, 0); }
  get orgTypes():    number { return new Set(this.orgs.map(o => o.type)).size; }

  typeBadgeColor(type: string): string {
    switch (type) {
      case 'Bank':         return 'primary';
      case 'Credit Union': return 'secondary';
      case 'Fintech':      return 'warning';
      case 'Enterprise':   return 'dark';
      default:             return 'medium';
    }
  }
}
