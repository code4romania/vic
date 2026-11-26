import {
  createHash,
  generateKeyPairSync,
  KeyObject,
  randomBytes,
} from 'crypto';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { JwtService } from '@nestjs/jwt';
import { NgoHubOrganizationClaim } from 'src/modules/auth/services/ngohub/ngohub.types';

// A small NGO Hub OIDC provider on 127.0.0.1 for specs and local runs: discovery, JWKS, /oidc/auth
// (logs in `loginAs` without a screen), /oidc/token (client_secret_basic + PKCE S256, one-time codes)
// and /oidc/me. Tokens are signed RS256 with a throwaway key, so VIC's real checks run against it.
// `tamper` breaks one thing on purpose for the negative specs.

export const FAKE_NGOHUB_CLIENT_ID = 'vic-test';
export const FAKE_NGOHUB_CLIENT_SECRET = 'vic-test-secret';

export interface FakeNgoHubUser {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  organization?: NgoHubOrganizationClaim | null;
}

export interface FakeNgoHubTamper {
  idToken?: Record<string, unknown>; // claims to override, e.g. { iss: 'x' }
  userinfoSub?: string;
  responseIss?: string | null; // null = leave the iss parameter out
  signWithOtherKey?: boolean;
}

interface IssuedCode {
  user: FakeNgoHubUser;
  nonce: string;
  challenge: string;
  redirectUri: string;
  used: boolean;
}

export function fakeOrganization(
  overrides: Partial<NgoHubOrganizationClaim> = {},
): NgoHubOrganizationClaim {
  return {
    id: 501,
    cui: '12345678',
    name: 'Asociatia din NGO Hub',
    role: 'admin',
    email: 'contact@ngohub-org.ro',
    phone: '+40712345678',
    address: 'Str. Exemplu 1',
    county: { id: 1, name: 'Cluj' },
    city: { id: 2, name: 'Cluj-Napoca' },
    short_description: 'Descriere scurtă',
    website: 'https://ngohub-org.ro',
    logo_url: null,
    logo_url_expires_at: null,
    ...overrides,
  };
}

export class FakeNgoHub {
  issuer = '';
  loginAs: FakeNgoHubUser | null = null;
  tamper: FakeNgoHubTamper = {};
  redirectUris: string[] = [];
  // Every /oidc/auth query, for specs that check what VIC asked for (prompt=login, scopes)
  readonly authorizeRequests: URLSearchParams[] = [];

  private server: Server;
  private readonly keyId = 'fake-ngohub';
  private readonly keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
  private readonly otherKeys = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  private readonly codes = new Map<string, IssuedCode>();
  private readonly accessTokens = new Map<string, FakeNgoHubUser>();

  async start(port = 0): Promise<this> {
    this.server = createServer((req, res) => {
      this.handle(req, res).catch((error) => {
        this.json(res, 500, { error: 'server_error', detail: String(error) });
      });
    });
    await new Promise<void>((resolve) =>
      this.server.listen(port, '127.0.0.1', resolve),
    );
    const { port: actual } = this.server.address() as AddressInfo;
    this.issuer = `http://127.0.0.1:${actual}`;
    return this;
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve) => this.server?.close(() => resolve()));
  }

  reset(): void {
    this.loginAs = null;
    this.tamper = {};
    this.codes.clear();
    this.accessTokens.clear();
    this.authorizeRequests.length = 0;
  }

  // What the browser does: follows VIC's authorization URL and comes back with the callback params.
  async authorize(
    url: string,
  ): Promise<{ code: string; state: string; iss?: string }> {
    const response = await fetch(url, { redirect: 'manual' });
    const location = response.headers.get('location');
    if (response.status !== 302 || !location) {
      throw new Error(
        `fake NGO Hub refused: ${response.status} ${await response.text()}`,
      );
    }
    const params = new URL(location).searchParams;
    return {
      code: params.get('code'),
      state: params.get('state'),
      ...(params.has('iss') ? { iss: params.get('iss') } : {}),
    };
  }

  private async handle(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    const url = new URL(req.url, this.issuer);
    switch (`${req.method} ${url.pathname}`) {
      case 'GET /.well-known/openid-configuration':
        return this.json(res, 200, {
          issuer: this.issuer,
          authorization_endpoint: `${this.issuer}/oidc/auth`,
          token_endpoint: `${this.issuer}/oidc/token`,
          jwks_uri: `${this.issuer}/oidc/jwks`,
          userinfo_endpoint: `${this.issuer}/oidc/me`,
          end_session_endpoint: `${this.issuer}/oidc/session/end`,
          authorization_response_iss_parameter_supported: true,
          code_challenge_methods_supported: ['S256'],
          id_token_signing_alg_values_supported: ['RS256'],
          token_endpoint_auth_methods_supported: ['client_secret_basic'],
        });
      case 'GET /oidc/jwks':
        return this.json(res, 200, {
          keys: [
            {
              ...this.keys.publicKey.export({ format: 'jwk' }),
              kid: this.keyId,
              use: 'sig',
              alg: 'RS256',
            },
          ],
        });
      case 'GET /oidc/auth':
        return this.authorizeEndpoint(url.searchParams, res);
      case 'POST /oidc/token':
        return this.token(req, res);
      case 'GET /oidc/me':
        return this.userinfo(req, res);
      default:
        return this.json(res, 404, { error: 'not_found' });
    }
  }

  private authorizeEndpoint(query: URLSearchParams, res: ServerResponse): void {
    this.authorizeRequests.push(query);
    const redirectUri = query.get('redirect_uri');
    if (
      query.get('client_id') !== FAKE_NGOHUB_CLIENT_ID ||
      query.get('response_type') !== 'code' ||
      query.get('code_challenge_method') !== 'S256' ||
      !query.get('code_challenge') ||
      !query.get('nonce') ||
      (this.redirectUris.length && !this.redirectUris.includes(redirectUri))
    ) {
      return this.json(res, 400, { error: 'invalid_request' });
    }
    const back = new URL(redirectUri);
    back.searchParams.set('state', query.get('state'));
    const iss =
      this.tamper.responseIss === undefined
        ? this.issuer
        : this.tamper.responseIss;
    if (iss !== null) back.searchParams.set('iss', iss);
    if (!this.loginAs) {
      back.searchParams.set('error', 'access_denied');
    } else {
      const code = randomBytes(16).toString('base64url');
      this.codes.set(code, {
        user: this.loginAs,
        nonce: query.get('nonce'),
        challenge: query.get('code_challenge'),
        redirectUri,
        used: false,
      });
      back.searchParams.set('code', code);
    }
    res.writeHead(302, { location: back.toString() }).end();
  }

  private async token(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    const expected = `Basic ${Buffer.from(`${FAKE_NGOHUB_CLIENT_ID}:${FAKE_NGOHUB_CLIENT_SECRET}`).toString('base64')}`;
    if (req.headers.authorization !== expected) {
      return this.json(res, 401, { error: 'invalid_client' });
    }
    const body = new URLSearchParams(await readBody(req));
    const issued = this.codes.get(body.get('code'));
    const verifier = body.get('code_verifier') ?? '';
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    if (
      body.get('grant_type') !== 'authorization_code' ||
      !issued ||
      issued.used ||
      issued.redirectUri !== body.get('redirect_uri') ||
      issued.challenge !== challenge
    ) {
      return this.json(res, 400, { error: 'invalid_grant' });
    }
    issued.used = true;

    const accessToken = randomBytes(24).toString('base64url');
    this.accessTokens.set(accessToken, issued.user);
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      iss: this.issuer,
      aud: FAKE_NGOHUB_CLIENT_ID,
      sub: issued.user.sub,
      nonce: issued.nonce,
      iat: now,
      exp: now + 600,
      ...this.tamper.idToken,
    };
    const key: KeyObject = this.tamper.signWithOtherKey
      ? this.otherKeys.privateKey
      : this.keys.privateKey;
    const idToken = new JwtService().sign(claims, {
      privateKey: key.export({ format: 'pem', type: 'pkcs8' }).toString(),
      algorithm: 'RS256',
      keyid: this.keyId,
    });
    return this.json(res, 200, {
      access_token: accessToken,
      id_token: idToken,
      token_type: 'Bearer',
      expires_in: 600,
      scope: 'openid email profile organization',
    });
  }

  private userinfo(req: IncomingMessage, res: ServerResponse): void {
    const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
    const user = this.accessTokens.get(token);
    if (!user) return this.json(res, 401, { error: 'invalid_token' });
    return this.json(res, 200, {
      sub: this.tamper.userinfoSub ?? user.sub,
      email: user.email,
      email_verified: user.email_verified ?? true,
      name: user.name ?? 'Admin NGO Hub',
      ...(user.organization === null
        ? {}
        : { organization: user.organization ?? fakeOrganization() }),
    });
  }

  private json(res: ServerResponse, status: number, body: unknown): void {
    res
      .writeHead(status, { 'content-type': 'application/json' })
      .end(JSON.stringify(body));
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
