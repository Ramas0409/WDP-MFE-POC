import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-org',
  standalone: true,
  imports: [IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar],
  template: `
    <div class="ion-page">
      <ion-header>
        <ion-toolbar style="--background: #1B2A4A; --color: #ffffff; --border-color: #C9921A;">
          <ion-menu-button slot="start" style="color: #C9921A;"></ion-menu-button>
          <ion-title style="font-weight: 600; letter-spacing: 0.03em;">
            Org Management
          </ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <div style="padding: 40px 24px; max-width: 620px; margin: 0 auto;">

          <div style="background: #fff; border-radius: 10px; border: 1px solid #DDE4EF;
                      border-top: 4px solid #C9921A; padding: 36px; text-align: center;
                      box-shadow: 0 2px 12px rgba(27,42,74,.07);">
            <div style="font-size: 52px; margin-bottom: 16px;">🏢</div>
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; text-transform: uppercase;
                       letter-spacing: .1em; color: #C9921A;">
              Enterprise Corp
            </p>
            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1B2A4A;">
              Org Management
            </h1>
            <div style="height: 1px; background: #DDE4EF; margin: 0 0 20px;"></div>
            <p style="margin: 0 0 10px; font-size: 15px; color: #4A6080; line-height: 1.7;">
              This module will provide organisation management — corporate structure,
              department hierarchy, tenant configuration, and enterprise settings.
            </p>
            <p style="margin: 20px 0 0; display: inline-block; font-size: 12px; font-weight: 600;
                       background: #EEF2F7; color: #7A90B0; padding: 6px 16px;
                       border-radius: 20px; border: 1px solid #DDE4EF; text-transform: uppercase;
                       letter-spacing: .06em;">
              Placeholder — not yet implemented
            </p>
          </div>

        </div>
      </ion-content>
    </div>
  `
})
export class OrgComponent {}
