import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AUTH_LOCKOUT } from '../auth.constants';
import { AuthProvider, AuthTokenType } from '../enums/auth.enums';
import {
  CreateAuthIdentityOptions,
  FindAuthIdentityOptions,
  IAuthIdentityModel,
  UpdateAuthIdentityOptions,
  UpsertAuthIdentityResult,
} from '../models/auth-identity.model';
import {
  CreateAuthIdentityProviderOptions,
  IAuthIdentityProviderModel,
} from '../models/auth-identity-provider.model';
import {
  CreateAuthTokenOptions,
  IAuthTokenModel,
} from '../models/auth-token.model';
import {
  CreateRefreshTokenOptions,
  IRefreshTokenModel,
} from '../models/refresh-token.model';
import { AuthIdentityRepository } from '../repositories/auth-identity.repository';
import { AuthIdentityProviderRepository } from '../repositories/auth-identity-provider.repository';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';

// The only class other modules import from auth persistence. It also owns the lockout rule.
@Injectable()
export class AuthIdentityFacade {
  constructor(
    private readonly authIdentityRepository: AuthIdentityRepository,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly authIdentityProviderRepository: AuthIdentityProviderRepository,
  ) {}

  // Identities

  public async findIdentity(
    options: FindAuthIdentityOptions,
  ): Promise<IAuthIdentityModel> {
    return this.authIdentityRepository.find(options);
  }

  public async createIdentity(
    options: CreateAuthIdentityOptions,
    manager?: EntityManager,
  ): Promise<IAuthIdentityModel> {
    return this.authIdentityRepository.create(options, manager);
  }

  public async updateIdentity(
    id: string,
    options: UpdateAuthIdentityOptions,
    manager?: EntityManager,
  ): Promise<IAuthIdentityModel> {
    return this.authIdentityRepository.update(id, options, manager);
  }

  public async upsertIdentity(
    options: CreateAuthIdentityOptions,
    manager?: EntityManager,
  ): Promise<UpsertAuthIdentityResult> {
    return this.authIdentityRepository.upsert(options, manager);
  }

  public async deleteByUserId(userId: string): Promise<number> {
    return this.authIdentityRepository.deleteByUserId(userId);
  }

  public async findSuperAdmins(): Promise<IAuthIdentityModel[]> {
    return this.authIdentityRepository.findSuperAdmins();
  }

  public async findByOrganizationId(
    organizationId: string,
  ): Promise<IAuthIdentityModel[]> {
    return this.authIdentityRepository.findByOrganizationId(organizationId);
  }

  public async deleteUnverifiedMobileBefore(date: Date): Promise<number> {
    return this.authIdentityRepository.deleteUnverifiedMobileBefore(date);
  }

  // Lockout: the fifth failure in a row locks the login for 15 minutes and starts the count again.

  public async registerFailedLogin(
    identity: IAuthIdentityModel,
  ): Promise<IAuthIdentityModel> {
    const lockUntil = new Date(
      Date.now() + AUTH_LOCKOUT.LOCK_MINUTES * 60 * 1000,
    );

    return this.authIdentityRepository.registerFailedLogin(
      identity.id,
      AUTH_LOCKOUT.MAX_FAILED_ATTEMPTS,
      lockUntil,
    );
  }

  public async registerSuccessfulLogin(
    identity: IAuthIdentityModel,
  ): Promise<IAuthIdentityModel> {
    // lastLoginAt is set with the session (createSession)
    return this.authIdentityRepository.update(identity.id, {
      failedAttempts: 0,
      lockedUntil: null,
    });
  }

  public isLocked(identity: IAuthIdentityModel, now = new Date()): boolean {
    return !!identity.lockedUntil && identity.lockedUntil > now;
  }

  // One-time tokens

  public async createToken(
    options: CreateAuthTokenOptions,
    manager?: EntityManager,
  ): Promise<IAuthTokenModel> {
    return this.authTokenRepository.create(options, manager);
  }

  public async findTokenByHash(tokenHash: string): Promise<IAuthTokenModel> {
    return this.authTokenRepository.findByHash(tokenHash);
  }

  public async findAnyTokenByHash(tokenHash: string): Promise<IAuthTokenModel> {
    return this.authTokenRepository.findAnyByHash(tokenHash);
  }

  public async findLiveToken(
    identityId: string,
    type: AuthTokenType,
  ): Promise<IAuthTokenModel> {
    return this.authTokenRepository.findLiveToken(identityId, type);
  }

  public async replaceLiveTokens(
    identityId: string,
    types: AuthTokenType[],
    manager?: EntityManager,
  ): Promise<number> {
    return this.authTokenRepository.replaceLiveTokens(
      identityId,
      types,
      manager,
    );
  }

  public async consumeToken(
    id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.authTokenRepository.consume(id, manager);
  }

  public async findLatestToken(
    identityId: string,
    type: AuthTokenType,
  ): Promise<IAuthTokenModel> {
    return this.authTokenRepository.findLatest(identityId, type);
  }

  public async incrementTokenAttempts(id: string): Promise<number> {
    return this.authTokenRepository.incrementAttempts(id);
  }

  public async deleteTokensEndedBefore(date: Date): Promise<number> {
    return this.authTokenRepository.deleteEndedBefore(date);
  }

  // Sessions (refresh tokens)

  // Every new session is a login (password, social, reset code, or a set-password / confirm-email link),
  // so lastLoginAt is recorded here rather than in each use case. Refresh rotations do not pass here.
  public async createSession(
    options: CreateRefreshTokenOptions,
    manager?: EntityManager,
  ): Promise<IRefreshTokenModel> {
    const session = await this.refreshTokenRepository.create(options, manager);
    await this.authIdentityRepository.update(
      options.identityId,
      { lastLoginAt: new Date() },
      manager,
    );
    return session;
  }

  public async findSessionByHash(
    tokenHash: string,
  ): Promise<IRefreshTokenModel> {
    return this.refreshTokenRepository.findSessionByHash(tokenHash);
  }

  public async findSessionByPreviousHash(
    previousHash: string,
  ): Promise<IRefreshTokenModel> {
    return this.refreshTokenRepository.findSessionByPreviousHash(previousHash);
  }

  public async rotateSession(
    id: string,
    currentTokenHash: string,
    newTokenHash: string,
    expiresAt: Date,
    manager?: EntityManager,
  ): Promise<IRefreshTokenModel> {
    return this.refreshTokenRepository.rotate(
      id,
      currentTokenHash,
      newTokenHash,
      expiresAt,
      manager,
    );
  }

  public async revokeSession(
    id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.refreshTokenRepository.revoke(id, manager);
  }

  public async revokeAllSessions(
    identityId: string,
    exceptSessionId?: string,
    manager?: EntityManager,
  ): Promise<number> {
    return this.refreshTokenRepository.revokeAllForIdentity(
      identityId,
      exceptSessionId,
      manager,
    );
  }

  public async deleteSessionsExpiredOrRevokedBefore(
    expiredBefore: Date,
    revokedBefore?: Date,
  ): Promise<number> {
    return this.refreshTokenRepository.deleteExpiredOrRevokedBefore(
      expiredBefore,
      revokedBefore,
    );
  }

  // Social provider links

  public async findProviderLink(
    provider: AuthProvider,
    subject: string,
  ): Promise<IAuthIdentityProviderModel> {
    return this.authIdentityProviderRepository.findByProvider(
      provider,
      subject,
    );
  }

  public async linkProvider(
    options: CreateAuthIdentityProviderOptions,
    manager?: EntityManager,
  ): Promise<IAuthIdentityProviderModel> {
    return this.authIdentityProviderRepository.linkProvider(options, manager);
  }
}
