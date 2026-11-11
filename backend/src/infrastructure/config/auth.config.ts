import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';

export const JWT_ISSUER = 'vic-api';

export const JWT_AUDIENCE: Record<AuthRealm, string> = {
  [AuthRealm.WEB]: 'vic-web',
  [AuthRealm.MOBILE]: 'vic-mobile',
};

const decodePem = (base64: string): string =>
  Buffer.from(base64, 'base64').toString('utf8');

const splitList = (value: string): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// Typed access to the own-auth settings; the keys arrive base64 encoded on one line.
@Injectable()
export class AuthConfigService implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  get privateKey(): string {
    return decodePem(this.configService.get('JWT_PRIVATE_KEY'));
  }

  get publicKey(): string {
    return decodePem(this.configService.get('JWT_PUBLIC_KEY'));
  }

  get keyId(): string {
    return this.configService.get('JWT_KEY_ID');
  }

  get accessTokenTtlSeconds(): number {
    return +this.configService.get('JWT_ACCESS_TTL_SECONDS');
  }

  refreshTtlDays(realm: AuthRealm): number {
    return +this.configService.get(
      realm === AuthRealm.WEB
        ? 'REFRESH_TTL_DAYS_WEB'
        : 'REFRESH_TTL_DAYS_MOBILE',
    );
  }

  get authTokenKey(): Buffer {
    return Buffer.from(
      this.configService.get<string>('AUTH_TOKEN_KEY'),
      'base64',
    );
  }

  get webAppUrl(): string {
    return this.configService.get<string>('WEB_APP_URL').replace(/\/+$/, '');
  }

  get corsOrigins(): string[] {
    return splitList(this.configService.get('CORS_ORIGINS'));
  }

  get mobileMinVersion(): string {
    return this.configService.get('MOBILE_MIN_VERSION');
  }

  get maintenanceMode(): boolean {
    return this.configService.get('MAINTENANCE_MODE') === 'true';
  }

  get maintenanceAllowedIps(): string[] {
    return splitList(this.configService.get('MAINTENANCE_ALLOWED_IPS'));
  }

  get googleClientIds(): string[] {
    return splitList(this.configService.get('GOOGLE_CLIENT_IDS'));
  }

  get appleBundleId(): string {
    return this.configService.get('APPLE_BUNDLE_ID');
  }

  // The app signs in with the bundle id as audience, the web with the Services ID.
  get appleAudiences(): string[] {
    return [
      this.appleBundleId,
      ...splitList(this.configService.get('APPLE_SERVICES_ID')),
    ].filter(Boolean);
  }

  // Revoking Apple tokens on account deletion needs the team's Sign in with Apple key. Without all
  // three settings the feature is off: logins work, nothing is exchanged or revoked.
  get appleSignInKey(): {
    teamId: string;
    keyId: string;
    privateKey: string;
  } | null {
    const teamId = this.configService.get<string>('APPLE_TEAM_ID');
    const keyId = this.configService.get<string>('APPLE_KEY_ID');
    const raw = this.configService.get<string>('APPLE_PRIVATE_KEY');
    if (!teamId || !keyId || !raw) return null;
    const privateKey = raw.includes('BEGIN')
      ? raw.replace(/\\n/g, '\n')
      : decodePem(raw);
    return { teamId, keyId, privateKey };
  }

  get appleWebRedirectUri(): string | undefined {
    return (
      this.configService.get<string>('APPLE_WEB_REDIRECT_URI') || undefined
    );
  }

  // The client id an Apple token was issued to: the app's bundle id, or the web Services ID
  get appleWebClientId(): string | undefined {
    return splitList(this.configService.get('APPLE_SERVICES_ID'))[0];
  }

  createJwtOptions(): JwtModuleOptions {
    return {
      privateKey: this.privateKey,
      publicKey: this.publicKey,
      signOptions: {
        algorithm: 'RS256',
        keyid: this.keyId,
        issuer: JWT_ISSUER,
        expiresIn: this.accessTokenTtlSeconds,
      },
      verifyOptions: {
        algorithms: ['RS256'],
        issuer: JWT_ISSUER,
      },
    };
  }
}
