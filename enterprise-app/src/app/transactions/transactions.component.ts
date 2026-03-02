import { Component } from '@angular/core';
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonBadge],
  template: `
    <div class="page">
      <header class="page-toolbar">
        <span class="page-title">Transaction Search</span>
      </header>
      <div class="page-content" style="padding: 32px 28px;">

        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: .1em;
                   text-transform: uppercase; color: #C9921A;">Enterprise Corp · Placeholder</p>
        <h1 style="margin: 0 0 24px; font-size: 26px; font-weight: 700; color: #1B2A4A;">
          Transaction Search
        </h1>

        <ion-card style="--background: #fff; border-top: 4px solid #2E6DA4; max-width: 520px; margin: 0 auto;">
          <ion-card-header style="text-align: center; padding-bottom: 0;">
            <div style="font-size: 48px; margin-bottom: 8px;">🔍</div>
            <ion-card-subtitle style="color: #2E6DA4; font-size: 11px; font-weight: 700;
                                      text-transform: uppercase; letter-spacing: .1em;">
              Enterprise Corp
            </ion-card-subtitle>
            <ion-card-title style="font-size: 20px; font-weight: 700; color: #1B2A4A;">
              Transaction Search
            </ion-card-title>
          </ion-card-header>
          <ion-card-content style="text-align: center; padding-top: 16px;">
            <div style="height: 2px; background: linear-gradient(90deg, #DDE4EF, #2E6DA4, #DDE4EF);
                        border-radius: 1px; margin: 0 auto 20px; width: 60px;"></div>
            <p style="margin: 0 0 20px; font-size: 14px; color: #5A7090; line-height: 1.7;">
              This module will provide enterprise-wide transaction search —
              payment history, audit trails, reconciliation reports, and
              real-time transaction status tracking.
            </p>
            <ion-badge color="medium" style="font-size: 11px; font-weight: 700; letter-spacing: .06em;
                                             text-transform: uppercase; padding: 6px 14px; border-radius: 20px;">
              Placeholder — not yet implemented
            </ion-badge>
          </ion-card-content>
        </ion-card>

      </div>
    </div>
  `
})
export class TransactionsComponent {}
