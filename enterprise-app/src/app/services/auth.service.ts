import { Injectable } from '@angular/core';

/**
 * AuthService — shell-side token authority.
 *
 * Generates a signed-looking bearer token on startup and rotates it
 * automatically every 5 minutes via an internal scheduler.
 *
 * getToken() always returns the cached token; it auto-regenerates only
 * if the scheduler somehow hasn't fired by the time expiry is reached.
 *
 * The function reference is passed into appContext.getToken so the MFE
 * can request a token without knowing anything about the shell's internals.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private static readonly TTL_MS = 2 * 60 * 1000; // 2 minutes

  /** Full bearer token string — passed to the MFE via getToken(). */
  currentToken = '';

  /** Epoch-ms timestamp when the current token expires. */
  tokenExpiresAt = 0;

  private readonly scheduler: ReturnType<typeof setInterval>;

  constructor() {
    this.generateToken();
    this.scheduler = setInterval(() => this.generateToken(), AuthService.TTL_MS);
  }

  /** Called by the MFE via appContext.getToken(). Returns a Promise<string>. */
  getToken(): Promise<string> {
    if (Date.now() >= this.tokenExpiresAt) {
      this.generateToken(); // safety net — scheduler should have already fired
    }
    return Promise.resolve(this.currentToken);
  }

  private generateToken(): void {
    const rand = Math.random().toString(36).slice(2, 10);
    const ts   = Date.now().toString(36);
    this.currentToken  = `Bearer ent.${rand}.${ts}`;
    this.tokenExpiresAt = Date.now() + AuthService.TTL_MS;
  }
}
