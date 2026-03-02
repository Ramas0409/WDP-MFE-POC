import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar],
  template: `
    <div class="ion-page">
      <ion-header>
        <ion-toolbar color="dark">
          <ion-menu-button slot="start"></ion-menu-button>
          <ion-title>Enterprise Corp — User Management</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <div style="padding: 32px 20px; max-width: 600px; margin: 0 auto; text-align: center;">
          <div style="font-size: 56px; margin-bottom: 16px;">👥</div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1a1a1a;">
            User Management
          </h1>
          <p style="margin: 0 0 24px; font-size: 14px; font-weight: 600; text-transform: uppercase;
                     letter-spacing: .06em; color: #333;">
            Enterprise Corp · Placeholder
          </p>
          <div style="background: #f8f9fa; border: 1px dashed #ccc; border-radius: 10px;
                      padding: 28px 24px;">
            <p style="margin: 0 0 8px; font-size: 16px; color: #555; line-height: 1.6;">
              This section will provide user management capabilities for Enterprise Corp —
              including user creation, role assignment, and access control management.
            </p>
            <p style="margin: 16px 0 0; font-size: 13px; color: #999;">
              Feature not yet implemented — placeholder page.
            </p>
          </div>
        </div>
      </ion-content>
    </div>
  `
})
export class UsersComponent {}
