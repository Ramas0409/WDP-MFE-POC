import { Component } from '@angular/core';
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

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Senior Analyst' | 'Dispute Analyst' | 'Viewer';
  orgId: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar,
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
          <ion-title>WDP Shell — User Management</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content style="--background: #EEF2F7;">
        <div style="padding: 20px;">

          <!-- Summary stats -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
            <ion-card style="margin: 0;">
              <ion-card-content style="text-align: center; padding: 14px 8px;">
                <div style="font-size: 30px; font-weight: 700; color: #1565c0;">{{ users.length }}</div>
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                             letter-spacing: .08em; color: #888; margin-top: 2px;">Total Users</div>
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
                <div style="font-size: 30px; font-weight: 700; color: #c62828;">{{ inactiveCount }}</div>
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase;
                             letter-spacing: .08em; color: #888; margin-top: 2px;">Inactive / Suspended</div>
              </ion-card-content>
            </ion-card>
          </div>

          <!-- Users table -->
          <ion-card style="margin: 0;">
            <ion-card-content style="padding: 16px;">
              <p style="font-size: 11px; font-weight: 700; text-transform: uppercase;
                         letter-spacing: .08em; color: #555; margin: 0 0 14px;">
                Users — {{ users.length }} records
              </p>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>OrgId</th>
                    <th>Status</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of users; track u.id) {
                    <tr>
                      <td><code style="color: #555; font-size: 12px;">{{ u.id }}</code></td>
                      <td style="font-weight: 600; color: #1a1a1a;">{{ u.name }}</td>
                      <td style="color: #555; font-size: 12px;">{{ u.email }}</td>
                      <td>
                        <ion-badge [color]="roleBadgeColor(u.role)" style="font-size: 10px; white-space: nowrap;">
                          {{ u.role }}
                        </ion-badge>
                      </td>
                      <td>
                        <code style="color: #1565c0; font-size: 12px; background: #f0f4ff;
                                     padding: 2px 6px; border-radius: 4px;">
                          {{ u.orgId }}
                        </code>
                      </td>
                      <td>
                        <ion-badge [color]="statusBadgeColor(u.status)" style="font-size: 11px;">
                          {{ u.status }}
                        </ion-badge>
                      </td>
                      <td style="color: #777; font-size: 12px;">{{ u.lastLogin }}</td>
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
export class UsersComponent {

  readonly users: User[] = [
    { id: 'USR-001', name: 'James Williams',  email: 'j.williams@wdp.com',  role: 'Dispute Analyst',  orgId: 'org-001', status: 'Active',    lastLogin: '22 Jan 2024' },
    { id: 'USR-002', name: 'Maria Patel',     email: 'm.patel@wdp.com',     role: 'Senior Analyst',   orgId: 'org-001', status: 'Active',    lastLogin: '20 Jan 2024' },
    { id: 'USR-003', name: 'Robert Chen',     email: 'r.chen@wdp.com',      role: 'Admin',            orgId: 'org-001', status: 'Active',    lastLogin: '21 Jan 2024' },
    { id: 'USR-004', name: 'Sarah Johnson',   email: 's.johnson@wdp.com',   role: 'Viewer',           orgId: 'org-002', status: 'Active',    lastLogin: '18 Jan 2024' },
    { id: 'USR-005', name: 'David Kim',       email: 'd.kim@wdp.com',       role: 'Dispute Analyst',  orgId: 'org-002', status: 'Inactive',  lastLogin: '05 Dec 2023' },
    { id: 'USR-006', name: 'Emma Thompson',   email: 'e.thompson@wdp.com',  role: 'Senior Analyst',   orgId: 'org-002', status: 'Active',    lastLogin: '19 Jan 2024' },
    { id: 'USR-007', name: 'Michael Brown',   email: 'm.brown@wdp.com',     role: 'Viewer',           orgId: 'org-003', status: 'Suspended', lastLogin: '10 Nov 2023' },
    { id: 'USR-008', name: 'Lisa Garcia',     email: 'l.garcia@wdp.com',    role: 'Dispute Analyst',  orgId: 'org-003', status: 'Active',    lastLogin: '22 Jan 2024' },
    { id: 'USR-009', name: 'Kevin Wilson',    email: 'k.wilson@wdp.com',    role: 'Admin',            orgId: 'org-003', status: 'Active',    lastLogin: '17 Jan 2024' },
    { id: 'USR-010', name: 'Rachel Adams',    email: 'r.adams@wdp.com',     role: 'Dispute Analyst',  orgId: 'org-004', status: 'Active',    lastLogin: '23 Jan 2024' },
    { id: 'USR-011', name: 'Thomas Hughes',   email: 't.hughes@wdp.com',    role: 'Senior Analyst',   orgId: 'org-004', status: 'Inactive',  lastLogin: '14 Dec 2023' },
    { id: 'USR-012', name: 'Priya Sharma',    email: 'p.sharma@wdp.com',    role: 'Viewer',           orgId: 'org-005', status: 'Active',    lastLogin: '21 Jan 2024' },
  ];

  get activeCount():   number { return this.users.filter(u => u.status === 'Active').length; }
  get inactiveCount(): number { return this.users.filter(u => u.status !== 'Active').length; }

  statusBadgeColor(status: string): string {
    switch (status) {
      case 'Active':    return 'success';
      case 'Suspended': return 'danger';
      default:          return 'medium';
    }
  }

  roleBadgeColor(role: string): string {
    switch (role) {
      case 'Admin':           return 'primary';
      case 'Senior Analyst':  return 'secondary';
      case 'Dispute Analyst': return 'tertiary';
      default:                return 'medium';
    }
  }
}
