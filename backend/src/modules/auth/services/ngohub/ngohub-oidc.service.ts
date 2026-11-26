import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import Redis from 'ioredis';
import { JwksClient } from 'jwks-rsa';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { REDIS_CLIENT } from 'src/infrastructure/providers/redis/redis-provider.module';
import { AuthException, AuthExceptionCodes } from '../../exceptions/exceptions';
import {
  NgoHubFlowStart,
  NgoHubOrganizationClaim,
  NgoHubProfile,
} from './ngohub.types';

const FLOW_TTL_SECONDS = 10 * 60;
const DISCOVERY_TTL_MS = 60 * 60 * 1000;
const HTTP_TIMEOUT_MS = 10_000;
const SCOPES = 'openid email profile organization';

interface Discovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  userinfo_endpoint: string;
  authorization_response_iss_parameter_supported?: boolean;
}

interface StoredFlow {
  nonce: string;
  verifier: string;
  cookieHash: string;
}

export interface NgoHubCallbackInput {
  code: string;
  state: string;
  iss?: string;
  // The random value /start put in the httpOnly flow cookie
  flowCookie: string;
}

const random = (): string => randomBytes(32).toString('base64url');
const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('base64url');

const sameHash = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

// Login with NGO Hub (OIDC authorization code + PKCE, client_secret_basic). The flow is bound to the
// browser that started it: /start sets a random httpOnly cookie and Redis keeps its hash next to the
// state, nonce and PKCE verifier for 10 minutes. The callback needs both and deletes the record
// atomically (GETDEL), so a state works once and only in the browser that asked for it; without this
// an attacker could finish their own login in the victim's browser.
@Injectable()
export class NgoHubOidcService {
  private readonly logger = new Logger(NgoHubOidcService.name);
  private readonly jwt = new JwtService();
  private discovery: { value: Discovery; fetchedAt: number } | null = null;
  private jwks: JwksClient | null = null;

  constructor(
    private readonly authConfig: AuthConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  get enabled(): boolean {
    return this.authConfig.ngohub !== null;
  }

  // The NGO Hub authorization URL, and the value for the flow cookie. promptLogin asks NGO Hub for a
  // fresh login (after a VIC logout, so the next person on a shared computer does not walk in).
  async start(
    options: { promptLogin?: boolean } = {},
  ): Promise<NgoHubFlowStart> {
    const config = this.config();
    const discovery = await this.getDiscovery();

    const state = random();
    const nonce = random();
    const verifier = random();
    const flowCookie = random();
    const flow: StoredFlow = {
      nonce,
      verifier,
      cookieHash: sha256(flowCookie),
    };
    await this.redis.set(
      this.flowKey(state),
      JSON.stringify(flow),
      'EX',
      FLOW_TTL_SECONDS,
    );

    const url = new URL(discovery.authorization_endpoint);
    url.search = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: SCOPES,
      state,
      nonce,
      code_challenge: sha256(verifier),
      code_challenge_method: 'S256',
      ...(options.promptLogin ? { prompt: 'login' } : {}),
    }).toString();

    return {
      url: url.toString(),
      flowCookie,
      flowTtlSeconds: FLOW_TTL_SECONDS,
    };
  }

  // Checks the flow, exchanges the code and returns who logged in. AUTH_019 for anything wrong.
  async callback(input: NgoHubCallbackInput): Promise<NgoHubProfile> {
    const config = this.config();
    if (!input?.state || !input.code || !input.flowCookie) {
      throw new AuthException(AuthExceptionCodes.AUTH_019);
    }

    // Deleted before anything else is checked: a state never works twice, even after a failure.
    const raw = await this.redis.getdel(this.flowKey(input.state));
    if (!raw) throw this.fail('unknown or reused state');
    const flow: StoredFlow = JSON.parse(raw);
    if (!sameHash(flow.cookieHash, sha256(input.flowCookie))) {
      throw this.fail('flow cookie does not match');
    }

    const discovery = await this.getDiscovery();
    // RFC 9207: the authorization response names its issuer (mix-up attacks)
    if (
      (discovery.authorization_response_iss_parameter_supported || input.iss) &&
      input.iss !== discovery.issuer
    ) {
      throw this.fail('iss parameter does not match');
    }

    const tokens = await this.exchangeCode(discovery, config, input.code, flow);
    const subject = await this.verifyIdToken(
      tokens.id_token,
      discovery,
      config.clientId,
      flow.nonce,
    );
    const userinfo = await this.fetchUserinfo(discovery, tokens.access_token);
    if (String(userinfo.sub) !== subject) {
      throw this.fail('userinfo subject differs from the ID token');
    }

    return {
      subject,
      email: typeof userinfo.email === 'string' ? userinfo.email : undefined,
      emailVerified: userinfo.email_verified === true,
      name: typeof userinfo.name === 'string' ? userinfo.name : undefined,
      organization:
        (userinfo.organization as NgoHubOrganizationClaim) ?? undefined,
    };
  }

  private config(): NonNullable<AuthConfigService['ngohub']> {
    const config = this.authConfig.ngohub;
    if (!config) throw new AuthException(AuthExceptionCodes.AUTH_020);
    return config;
  }

  private flowKey(state: string): string {
    return `auth:ngohub:flow:${sha256(state)}`;
  }

  private fail(reason: string): AuthException {
    this.logger.warn(`NGO Hub login refused: ${reason}`);
    return new AuthException(AuthExceptionCodes.AUTH_019);
  }

  private async getDiscovery(): Promise<Discovery> {
    if (
      this.discovery &&
      Date.now() - this.discovery.fetchedAt < DISCOVERY_TTL_MS
    ) {
      return this.discovery.value;
    }
    const { issuer } = this.config();
    let value: Discovery;
    try {
      value = await this.getJson(`${issuer}/.well-known/openid-configuration`);
    } catch (error) {
      this.logger.error(`NGO Hub discovery failed: ${error}`);
      throw new AuthException(AuthExceptionCodes.AUTH_020);
    }
    if (value.issuer !== issuer) {
      this.logger.error(
        `NGO Hub discovery names issuer ${value.issuer}, expected ${issuer}`,
      );
      throw new AuthException(AuthExceptionCodes.AUTH_020);
    }
    this.discovery = { value, fetchedAt: Date.now() };
    this.jwks = new JwksClient({
      jwksUri: value.jwks_uri,
      cache: true,
      rateLimit: true,
      timeout: HTTP_TIMEOUT_MS,
    });
    return value;
  }

  private async exchangeCode(
    discovery: Discovery,
    config: NonNullable<AuthConfigService['ngohub']>,
    code: string,
    flow: StoredFlow,
  ): Promise<{ id_token: string; access_token: string }> {
    // client_secret_basic: both parts form-urlencoded first (RFC 6749 2.3.1)
    const basic = Buffer.from(
      `${encodeURIComponent(config.clientId)}:${encodeURIComponent(config.clientSecret)}`,
    ).toString('base64');
    let response: Response;
    try {
      response = await fetch(discovery.token_endpoint, {
        method: 'POST',
        headers: {
          authorization: `Basic ${basic}`,
          'content-type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.redirectUri,
          code_verifier: flow.verifier,
        }),
        redirect: 'error',
        signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
      });
    } catch (error) {
      throw this.fail(`token request failed: ${error}`);
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.id_token || !body.access_token) {
      throw this.fail(
        `token endpoint answered ${response.status} ${body.error ?? ''}`,
      );
    }
    return body;
  }

  // Signature against NGO Hub's JWKS (RS256 only), issuer, audience = our client id, expiry, nonce.
  private async verifyIdToken(
    idToken: string,
    discovery: Discovery,
    clientId: string,
    nonce: string,
  ): Promise<string> {
    try {
      const header = JSON.parse(
        Buffer.from(String(idToken).split('.')[0], 'base64url').toString(),
      );
      const publicKey = (
        await this.jwks.getSigningKey(header.kid)
      ).getPublicKey();
      const payload = await this.jwt.verifyAsync(idToken, {
        publicKey,
        algorithms: ['RS256'],
        issuer: discovery.issuer,
        audience: clientId,
      });
      if (!payload?.sub) throw new Error('no subject');
      if (payload.nonce !== nonce) throw new Error('nonce');
      return String(payload.sub);
    } catch (error) {
      throw this.fail(`ID token rejected: ${(error as Error).message}`);
    }
  }

  private async fetchUserinfo(
    discovery: Discovery,
    accessToken: string,
  ): Promise<Record<string, unknown>> {
    try {
      return await this.getJson(discovery.userinfo_endpoint, {
        authorization: `Bearer ${accessToken}`,
      });
    } catch (error) {
      throw this.fail(`userinfo failed: ${error}`);
    }
  }

  private async getJson<T>(
    url: string,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const response = await fetch(url, {
      headers: { accept: 'application/json', ...headers },
      redirect: 'error',
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
    return (await response.json()) as T;
  }
}
