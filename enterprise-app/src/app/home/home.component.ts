import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonBadge],
  template: `
    <div class="page">
      <header class="page-toolbar">
        <span class="page-title">Enterprise Corp</span>
      </header>

      <div class="page-content">

        <!-- Hero banner -->
        <div style="background: linear-gradient(135deg, #1B2A4A 0%, #243860 100%);
                    padding: 36px 28px 32px; color: #fff;">
          <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: .12em;
                     text-transform: uppercase; color: #C9921A;">Enterprise Portal</p>
          <h1 style="margin: 0 0 12px; font-size: 30px; font-weight: 700; letter-spacing: -0.5px;">
            Enterprise Corp
          </h1>
          <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #A8BCDA; max-width: 580px;">
            Enterprise host application on <strong style="color:#fff;">Angular 18</strong> consuming the same
            <strong style="color:#fff;">disputes-mfe</strong> (Angular 20) via
            <strong style="color:#fff;">Webpack Module Federation</strong> —
            proving version-agnostic MFE loading.
          </p>
        </div>

        <!-- PoC architecture bar -->
        <div style="background: #0F1E38; padding: 12px 28px; display: flex; align-items: center;
                    gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase;
                       letter-spacing: .08em; color: #C9921A;">PoC:</span>
          <span style="font-size: 12px; color: #8A9BC0;">WDP Shell <span style="color:#4A6080;">:4200 (Angular 20)</span></span>
          <span style="color: #4A6080; font-size: 12px;">+</span>
          <span style="font-size: 12px; color: #E8A020; font-weight: 600;">Enterprise Corp <span style="color:#C9921A;">:4202 (Angular 18)</span></span>
          <span style="color: #4A6080; font-size: 12px;">+</span>
          <span style="font-size: 12px; color: #61dafb;">React Enterprise <span style="color:#4A6080;">:4203 (React 18)</span></span>
          <span style="color: #4A6080; font-size: 12px;">→ all consume</span>
          <span style="font-size: 12px; background: rgba(201,146,26,.15); color: #E8A020;
                       padding: 2px 8px; border-radius: 10px; border: 1px solid rgba(201,146,26,.3);">
            disputes-mfe :4201 (Angular 20)
          </span>
        </div>

        <!-- Module cards -->
        <div style="padding: 24px 28px 32px;">
          <p style="margin: 0 0 16px; font-size: 11px; font-weight: 700; text-transform: uppercase;
                     letter-spacing: .1em; color: #7A90B0;">Modules</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 16px;">

            <ion-card button routerLink="/disputes"
                      style="--background: #fff; border-top: 3px solid #C9921A; margin: 0; cursor: pointer;">
              <ion-card-header>
                <div style="font-size: 26px; margin-bottom: 8px;">⚖️</div>
                <ion-card-title style="font-size: 15px; color: #1B2A4A;">Disputes</ion-card-title>
                <ion-card-subtitle style="color: #C9921A; font-size: 11px; font-weight: 700;
                                          text-transform: uppercase; letter-spacing: .06em;">
                  MFE · port 4201
                </ion-card-subtitle>
              </ion-card-header>
              <ion-card-content style="color: #5A7090; font-size: 13px; line-height: 1.5;">
                Live micro-frontend (Angular 20) via Module Federation. Injected with enterprise appContext.
              </ion-card-content>
            </ion-card>

            <ion-card button routerLink="/transactions"
                      style="--background: #fff; border-top: 3px solid #2E6DA4; margin: 0; cursor: pointer;">
              <ion-card-header>
                <div style="font-size: 26px; margin-bottom: 8px;">🔍</div>
                <ion-card-title style="font-size: 15px; color: #1B2A4A;">Transaction Search</ion-card-title>
                <ion-card-subtitle style="color: #2E6DA4; font-size: 11px; font-weight: 700;
                                          text-transform: uppercase; letter-spacing: .06em;">
                  Placeholder
                </ion-card-subtitle>
              </ion-card-header>
              <ion-card-content style="color: #5A7090; font-size: 13px; line-height: 1.5;">
                Search payment history, audit trails, and transaction records across the enterprise.
              </ion-card-content>
            </ion-card>

          </div>
        </div>

      </div>
    </div>
  `
})
export class HomeComponent {}
