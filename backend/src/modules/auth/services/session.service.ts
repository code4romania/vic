import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import {
  AuthConfigService,
  JWT_AUDIENCE,
} from 'src/infrastructure/config/auth.config';
import { EntityManager } from 'typeorm';
import { REFRESH_REUSE_GRACE_MS } from '../auth.constants';
import { AuthIdentityStatus, AuthRealm } from '../enums/auth.enums';
import { AuthException, AuthExceptionCodes } from '../exceptions/exceptions';
import { IAuthIdentityModel } from '../models/auth-identity.model';
import { IRefreshTokenModel } from '../models/refresh-token.model';
import { AuthIdentityFacade } from './auth-identity.facade';

export interface SessionClient {
  userAgent?: string;
  ip?: string;
}

export interface AccessTokenPayload {
  sub: string; // identity id
  sid: string; // refresh_token id: the session, so change-password can keep it (decisions R11)
}

export interface SessionTokens {
  accessToken: string;
  expiresIn: number; // seconds
  // Absent when two requests crossed during a rotation: the client keeps the refresh token it already has.
  refreshToken?: string;
  sessionId: string;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly jwtService: JwtService,
    private readonly authConfig: AuthConfigService,
  ) {}

  public signAccessToken(
    identity: Pick<IAuthIdentityModel, 'id'>,
    realm: AuthRealm,
    sessionId: string,
  ): string {
    const payload: AccessTokenPayload = { sub: identity.id, sid: sessionId };
    return this.jwtService.sign(payload, { audience: JWT_AUDIENCE[realm] });
  }

  public async createSession(
    identity: Pick<IAuthIdentityModel, 'id'>,
    realm: AuthRealm,
    client: SessionClient = {},
    manager?: EntityManager,
  ): Promise<SessionTokens> {
    const refreshToken = this.newSecret();
    const session = await this.authIdentityFacade.createSession(
      {
        identityId: identity.id,
        tokenHash: this.hash(refreshToken),
        expiresAt: this.refreshExpiry(realm),
        userAgent: client.userAgent,
        ip: client.ip,
      },
      manager,
    );

    return this.tokens(identity, realm, session.id, refreshToken);
  }

  // Exchanges a refresh token for a new pair. The old hash moves to previous_hash. Presenting it again
  // within 10 s of the rotation (two tabs crossing) returns a new access token only; later it is a
  // replay: the session is revoked and AUTH_008 thrown.
  public async rotate(
    secret: string,
    realm: AuthRealm,
  ): Promise<SessionTokens> {
    if (typeof secret !== 'string' || !secret) {
      throw new AuthException(AuthExceptionCodes.AUTH_008);
    }
    const hash = this.hash(secret);

    const session = await this.authIdentityFacade.findSessionByHash(hash);
    if (session) {
      this.assertLive(session);
      const identity = await this.activeIdentity(session, realm);

      const refreshToken = this.newSecret();
      const rotated = await this.authIdentityFacade.rotateSession(
        session.id,
        hash,
        this.hash(refreshToken),
        this.refreshExpiry(realm),
      );

      // Another request rotated this token a moment ago: same as the crossed-tabs case.
      return rotated
        ? this.tokens(identity, realm, session.id, refreshToken)
        : this.tokens(identity, realm, session.id);
    }

    const rotatedAway =
      await this.authIdentityFacade.findSessionByPreviousHash(hash);
    if (!rotatedAway) {
      throw new AuthException(AuthExceptionCodes.AUTH_008);
    }
    this.assertLive(rotatedAway);

    const withinGrace =
      rotatedAway.rotatedAt &&
      Date.now() - rotatedAway.rotatedAt.getTime() <= REFRESH_REUSE_GRACE_MS;
    if (!withinGrace) {
      await this.authIdentityFacade.revokeSession(rotatedAway.id);
      throw new AuthException(AuthExceptionCodes.AUTH_008);
    }

    const identity = await this.activeIdentity(rotatedAway, realm);
    return this.tokens(identity, realm, rotatedAway.id);
  }

  public async revoke(
    sessionId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.authIdentityFacade.revokeSession(sessionId, manager);
  }

  // The session a refresh token belongs to (revoked or expired included), or null.
  public async findByRefreshToken(secret: string): Promise<IRefreshTokenModel> {
    if (typeof secret !== 'string' || !secret) return null;

    return this.authIdentityFacade.findSessionByHash(this.hash(secret));
  }

  // Logout presents the refresh token itself; an unknown token is ignored.
  public async revokeByRefreshToken(secret: string): Promise<boolean> {
    if (typeof secret !== 'string' || !secret) return false;

    const session = await this.authIdentityFacade.findSessionByHash(
      this.hash(secret),
    );
    return session ? this.authIdentityFacade.revokeSession(session.id) : false;
  }

  public async revokeAll(
    identityId: string,
    exceptSessionId?: string,
    manager?: EntityManager,
  ): Promise<number> {
    return this.authIdentityFacade.revokeAllSessions(
      identityId,
      exceptSessionId,
      manager,
    );
  }

  private tokens(
    identity: Pick<IAuthIdentityModel, 'id'>,
    realm: AuthRealm,
    sessionId: string,
    refreshToken?: string,
  ): SessionTokens {
    return {
      accessToken: this.signAccessToken(identity, realm, sessionId),
      expiresIn: this.authConfig.accessTokenTtlSeconds,
      ...(refreshToken ? { refreshToken } : {}),
      sessionId,
    };
  }

  private assertLive(session: IRefreshTokenModel): void {
    if (session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
      throw new AuthException(AuthExceptionCodes.AUTH_008);
    }
  }

  // A session only refreshes while its login is active and belongs to the realm asking.
  private async activeIdentity(
    session: IRefreshTokenModel,
    realm: AuthRealm,
  ): Promise<IAuthIdentityModel> {
    const identity = await this.authIdentityFacade.findIdentity({
      id: session.identityId,
    });
    if (
      !identity ||
      identity.realm !== realm ||
      identity.status !== AuthIdentityStatus.ACTIVE
    ) {
      throw new AuthException(AuthExceptionCodes.AUTH_008);
    }
    return identity;
  }

  private refreshExpiry(realm: AuthRealm): Date {
    return new Date(
      Date.now() + this.authConfig.refreshTtlDays(realm) * 24 * 60 * 60 * 1000,
    );
  }

  private newSecret(): string {
    return randomBytes(32).toString('base64url');
  }

  private hash(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
  }
}
