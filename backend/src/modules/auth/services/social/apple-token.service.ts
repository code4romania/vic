import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { DataSource } from 'typeorm';
import { openSecret, sealSecret } from '../secret-box';

const APPLE_ISSUER = 'https://appleid.apple.com';
const PURPOSE = 'apple-refresh-token';

export interface AppleGrant {
  clientId: string;
  refreshToken: string;
}

// App Store guideline 5.1.1(v): deleting an account that signed in with Apple revokes its Apple
// tokens. At sign-in the client may send Apple's one-time authorization code; it is exchanged here
// for a refresh token, kept encrypted on the login (auth_identity.apple_refresh_token) and revoked
// when the account is deleted. Off without APPLE_TEAM_ID, APPLE_KEY_ID and APPLE_PRIVATE_KEY. Never
// fails a login or a deletion: problems are logged, without the tokens.
@Injectable()
export class AppleTokenService {
  private readonly logger = new Logger(AppleTokenService.name);
  private readonly jwt = new JwtService();

  constructor(
    private readonly authConfig: AuthConfigService,
    private readonly dataSource: DataSource,
  ) {}

  get enabled(): boolean {
    return !!this.authConfig.appleSignInKey;
  }

  // The client id the code was issued to: the app's bundle id, or the web Services ID
  async storeFromAuthorizationCode(
    identityId: string,
    authorizationCode: string,
    web = false,
  ): Promise<void> {
    if (!this.enabled || !authorizationCode) return;
    const clientId = web
      ? this.authConfig.appleWebClientId
      : this.authConfig.appleBundleId;
    if (!clientId) return;
    try {
      const body: Record<string, string> = {
        client_id: clientId,
        client_secret: this.clientSecret(clientId),
        code: authorizationCode,
        grant_type: 'authorization_code',
      };
      if (web && this.authConfig.appleWebRedirectUri) {
        body.redirect_uri = this.authConfig.appleWebRedirectUri;
      }
      const response = await fetch(`${APPLE_ISSUER}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(body).toString(),
      });
      const json = (await response.json().catch(() => ({}))) as {
        refresh_token?: string;
        error?: string;
      };
      if (!response.ok || !json.refresh_token) {
        this.logger.warn(
          `Apple code exchange failed: ${response.status} ${json.error ?? ''}`,
        );
        return;
      }
      const sealed = sealSecret(
        this.authConfig.authTokenKey,
        PURPOSE,
        JSON.stringify({ clientId, refreshToken: json.refresh_token }),
      );
      await this.dataSource.query(
        `UPDATE auth_identity SET apple_refresh_token = $2 WHERE id = $1`,
        [identityId, sealed],
      );
    } catch (error) {
      this.logger.warn(`Apple code exchange failed: ${error?.message}`);
    }
  }

  // Read before the logins are deleted; revoke() after the deletion is committed.
  async grantsOfUsers(userIds: string[]): Promise<AppleGrant[]> {
    if (!userIds.length) return [];
    const rows: { apple_refresh_token: string }[] = await this.dataSource.query(
      `SELECT apple_refresh_token FROM auth_identity
        WHERE user_id = ANY($1::uuid[]) AND apple_refresh_token IS NOT NULL`,
      [userIds],
    );
    return rows
      .map((row) =>
        openSecret(
          this.authConfig.authTokenKey,
          PURPOSE,
          row.apple_refresh_token,
        ),
      )
      .filter(Boolean)
      .map((json) => JSON.parse(json) as AppleGrant);
  }

  async revoke(grants: AppleGrant[]): Promise<void> {
    if (!this.enabled) return;
    await Promise.all(
      grants.map(async ({ clientId, refreshToken }) => {
        try {
          const response = await fetch(`${APPLE_ISSUER}/auth/revoke`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: this.clientSecret(clientId),
              token: refreshToken,
              token_type_hint: 'refresh_token',
            }).toString(),
          });
          if (!response.ok) {
            this.logger.warn(
              `Apple token revocation failed: ${response.status}`,
            );
          }
        } catch (error) {
          this.logger.warn(`Apple token revocation failed: ${error?.message}`);
        }
      }),
    );
  }

  // The client secret Apple asks for: a short ES256 JWT signed with the team's key
  private clientSecret(clientId: string): string {
    const { teamId, keyId, privateKey } = this.authConfig.appleSignInKey;
    return this.jwt.sign(
      { iss: teamId, aud: APPLE_ISSUER, sub: clientId },
      { privateKey, algorithm: 'ES256', keyid: keyId, expiresIn: 300 },
    );
  }
}
