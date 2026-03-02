import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, RouterLink],
  template: `
    <div class="ion-page">
      <ion-header>
        <ion-toolbar color="dark">
          <ion-menu-button slot="start"></ion-menu-button>
          <ion-title>Enterprise Corp</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <div style="padding: 24px 20px; max-width: 860px; margin: 0 auto;">

          <!-- Hero -->
          <div style="margin-bottom: 32px;">
            <h1 style="margin: 0 0 6px; font-size: 28px; font-weight: 700; color: #1a1a1a;">
              Enterprise Corp
            </h1>
            <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; text-transform: uppercase;
                       letter-spacing: .06em; color: #333;">
              Enterprise Team — Host Application
            </p>
            <p style="margin: 12px 0 0; font-size: 15px; line-height: 1.7; color: #444;">
              Enterprise Corp's host application demonstrating how an enterprise team can consume
              WDP micro-frontends without owning them. The
              <strong>disputes-mfe</strong> is loaded via <strong>Webpack Module Federation</strong>
              at runtime — the enterprise app supplies its own
              <code style="background:#f0f0f0; padding: 1px 5px; border-radius: 3px;">appContext</code>
              to the MFE, keeping authentication and identity fully decoupled.
            </p>
          </div>

          <!-- Architecture note -->
          <div style="background: #f5f5f5; border-left: 4px solid #333; border-radius: 6px;
                      padding: 14px 16px; margin-bottom: 32px;">
            <p style="margin: 0 0 6px; font-weight: 700; font-size: 13px; color: #333;">
              PoC Architecture
            </p>
            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #333;">
              Two independent host applications — <strong>WDP Shell</strong> (port 4200) and
              <strong>Enterprise Corp</strong> (port 4202) — both consume the same
              <code style="background:#e0e0e0; padding: 1px 5px; border-radius: 3px;">disputes-mfe</code>
              remote (port 4201), each injecting its own
              <code style="background:#e0e0e0; padding: 1px 5px; border-radius: 3px;">appContext</code>.
              This proves the MFE is host-agnostic.
            </p>
          </div>

          <!-- Section cards -->
          <h2 style="margin: 0 0 14px; font-size: 14px; font-weight: 700; text-transform: uppercase;
                     letter-spacing: .06em; color: #666;">
            Sections
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px;">

            <a routerLink="/disputes" style="text-decoration: none;">
              <div style="border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px;
                          background: #fff; cursor: pointer; transition: box-shadow .15s;"
                   onmouseover="this.style.boxShadow='0 4px 14px rgba(0,0,0,.12)'"
                   onmouseout="this.style.boxShadow='none'">
                <div style="font-size: 28px; margin-bottom: 10px;">⚖️</div>
                <p style="margin: 0 0 6px; font-weight: 700; font-size: 15px; color: #1a1a1a;">
                  Disputes
                </p>
                <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.5;">
                  Micro-frontend loaded via Module Federation. Displays live dispute records
                  from the mock-api and exposes the injected enterprise appContext.
                </p>
                <span style="display: inline-block; margin-top: 10px; font-size: 12px; font-weight: 600;
                             color: #333;">
                  Angular Elements · port 4201 →
                </span>
              </div>
            </a>

            <a routerLink="/users" style="text-decoration: none;">
              <div style="border: 1px solid #e8f5e9; border-radius: 10px; padding: 20px;
                          background: #fff; cursor: pointer; transition: box-shadow .15s;"
                   onmouseover="this.style.boxShadow='0 4px 14px rgba(46,125,50,.12)'"
                   onmouseout="this.style.boxShadow='none'">
                <div style="font-size: 28px; margin-bottom: 10px;">👥</div>
                <p style="margin: 0 0 6px; font-weight: 700; font-size: 15px; color: #1a1a1a;">
                  User Management
                </p>
                <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.5;">
                  Manage enterprise users, roles, and access controls across the organisation.
                </p>
                <span style="display: inline-block; margin-top: 10px; font-size: 12px; font-weight: 600;
                             color: #2e7d32;">
                  Placeholder →
                </span>
              </div>
            </a>

            <a routerLink="/org" style="text-decoration: none;">
              <div style="border: 1px solid #fff3e0; border-radius: 10px; padding: 20px;
                          background: #fff; cursor: pointer; transition: box-shadow .15s;"
                   onmouseover="this.style.boxShadow='0 4px 14px rgba(230,81,0,.1)'"
                   onmouseout="this.style.boxShadow='none'">
                <div style="font-size: 28px; margin-bottom: 10px;">🏢</div>
                <p style="margin: 0 0 6px; font-weight: 700; font-size: 15px; color: #1a1a1a;">
                  Org Management
                </p>
                <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.5;">
                  Configure enterprise organisation structure, departments, and settings.
                </p>
                <span style="display: inline-block; margin-top: 10px; font-size: 12px; font-weight: 600;
                             color: #e65100;">
                  Placeholder →
                </span>
              </div>
            </a>

          </div>
        </div>
      </ion-content>
    </div>
  `
})
export class HomeComponent {}
