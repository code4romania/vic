import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { DataSource, EntityManager } from 'typeorm';
import { AUTH_CODE_MAX_ATTEMPTS, AUTH_TOKEN_TTL_MS } from '../auth.constants';
import { AuthTokenForm, AuthTokenType } from '../enums/auth.enums';
import { AuthException, AuthExceptionCodes } from '../exceptions/exceptions';
import { IAuthIdentityModel } from '../models/auth-identity.model';
import { IAuthTokenModel } from '../models/auth-token.model';
import { AuthIdentityFacade } from './auth-identity.facade';

export interface IssueTokenOptions {
  identity: Pick<IAuthIdentityModel, 'id' | 'email'>;
  type: AuthTokenType;
  form: AuthTokenForm;
  sentById?: string;
  ttlMs?: number;
  // #508: where the secret goes when not to the identity's own email (a new address to confirm)
  sentTo?: string;
  // A code for one action only (e.g. a sensitive action): verifyCode must name the same purpose.
  purpose?: string;
}

export interface IssuedToken {
  secret: string; // goes into the email only; never stored or logged
  token: IAuthTokenModel;
}

const LINK_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const CODE_PATTERN = /^\d{6}$/;

// Consuming one of these ends every other live one for the identity: logging in ends every other login link or invite.
const LOGIN_TYPES = [AuthTokenType.LOGIN, AuthTokenType.INVITE];

@Injectable()
export class OneTimeTokenService {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly authConfig: AuthConfigService,
    private readonly dataSource: DataSource,
  ) {}

  // Ends the identity's live tokens of this type and stores a new one, in one transaction (the caller's when given).
  public async issue(
    options: IssueTokenOptions,
    manager?: EntityManager,
  ): Promise<IssuedToken> {
    const { identity, type, form } = options;
    const secret =
      form === AuthTokenForm.CODE
        ? randomInt(0, 1_000_000).toString().padStart(6, '0')
        : randomBytes(32).toString('base64url');
    const tokenHash =
      form === AuthTokenForm.CODE
        ? this.hashCode(identity.id, type, secret, options.purpose)
        : this.hashLink(type, secret);
    const expiresAt = new Date(
      Date.now() + (options.ttlMs ?? this.defaultTtl(type, form)),
    );

    const run = async (m: EntityManager): Promise<IAuthTokenModel> => {
      await this.authIdentityFacade.replaceLiveTokens(identity.id, [type], m);
      return this.authIdentityFacade.createToken(
        {
          identityId: identity.id,
          type,
          form,
          tokenHash,
          expiresAt,
          sentTo: options.sentTo ?? identity.email,
          sentById: options.sentById,
        },
        m,
      );
    };

    const token = manager
      ? await run(manager)
      : await this.dataSource.transaction(run);

    return { secret, token };
  }

  // The live link row (not used, replaced or expired) with its identity, or null. Changes nothing.
  public async peekLink(
    secret: string,
    type?: AuthTokenType,
  ): Promise<IAuthTokenModel> {
    return this.findLink(secret, type, (hash) =>
      this.authIdentityFacade.findTokenByHash(hash),
    );
  }

  // The link row in any state (used, replaced or expired), for token info and resend.
  public async findAnyByLink(secret: string): Promise<IAuthTokenModel> {
    return this.findLink(secret, undefined, (hash) =>
      this.authIdentityFacade.findAnyTokenByHash(hash),
    );
  }

  // Returns the live code row when the code matches. Every try takes one of the code's five attempts
  // first, atomically, so parallel requests cannot compare more than five codes. A mismatch is AUTH_005;
  // the fifth ends the code (AUTH_006). No live code at all is AUTH_005. A code issued for a purpose only
  // matches when verified for the same purpose.
  public async verifyCode(
    identity: Pick<IAuthIdentityModel, 'id'>,
    type: AuthTokenType,
    code: string,
    purpose?: string,
  ): Promise<IAuthTokenModel> {
    const token = await this.authIdentityFacade.findLiveToken(
      identity.id,
      type,
    );
    if (!token || token.form !== AuthTokenForm.CODE) {
      throw new AuthException(AuthExceptionCodes.AUTH_005);
    }

    const attempts = await this.authIdentityFacade.claimTokenAttempt(
      token.id,
      AUTH_CODE_MAX_ATTEMPTS,
    );
    if (attempts === null) {
      // Every attempt was taken (by parallel requests too): the code is over.
      await this.authIdentityFacade.replaceLiveTokens(identity.id, [type]);
      throw new AuthException(AuthExceptionCodes.AUTH_006);
    }

    const expected = Buffer.from(token.tokenHash, 'hex');
    const actual = Buffer.from(
      this.hashCode(
        identity.id,
        type,
        CODE_PATTERN.test(code) ? code : '',
        purpose,
      ),
      'hex',
    );
    if (
      CODE_PATTERN.test(code) &&
      expected.length === actual.length &&
      timingSafeEqual(expected, actual)
    ) {
      return token;
    }

    if (attempts >= AUTH_CODE_MAX_ATTEMPTS) {
      await this.authIdentityFacade.replaceLiveTokens(identity.id, [type]);
      throw new AuthException(AuthExceptionCodes.AUTH_006);
    }
    throw new AuthException(AuthExceptionCodes.AUTH_005);
  }

  // Marks the token used inside the caller's transaction; AUTH_005 if another request used it first.
  public async consume(
    token: Pick<IAuthTokenModel, 'id' | 'identityId' | 'type'>,
    manager?: EntityManager,
  ): Promise<void> {
    const consumed = await this.authIdentityFacade.consumeToken(
      token.id,
      manager,
    );
    if (!consumed) {
      throw new AuthException(AuthExceptionCodes.AUTH_005);
    }

    if (LOGIN_TYPES.includes(token.type)) {
      await this.authIdentityFacade.replaceLiveTokens(
        token.identityId,
        LOGIN_TYPES,
        manager,
      );
    }
  }

  // ana@example.ro -> a•••@example.ro
  public maskEmail(email: string): string {
    const [local, domain] = (email ?? '').split('@');
    if (!local || !domain) return '•••';
    return `${local[0]}•••@${domain}`;
  }

  // The link hash is bound to the type only, so a link can be looked up by its hash (decisions R21).
  private hashLink(type: AuthTokenType, secret: string): string {
    return this.hmac(`${type}:${secret}`);
  }

  // Codes are short, so their hash is also bound to the identity: the same digits never match another person.
  // A purpose binds it to one action as well (the code to add an admin does not delete the NGO).
  private hashCode(
    identityId: string,
    type: AuthTokenType,
    code: string,
    purpose?: string,
  ): string {
    return this.hmac(
      purpose
        ? `${identityId}:${type}:${purpose}:${code}`
        : `${identityId}:${type}:${code}`,
    );
  }

  private hmac(value: string): string {
    return createHmac('sha256', this.authConfig.authTokenKey)
      .update(value)
      .digest('hex');
  }

  private async findLink(
    secret: string,
    type: AuthTokenType | undefined,
    lookup: (hash: string) => Promise<IAuthTokenModel>,
  ): Promise<IAuthTokenModel> {
    if (typeof secret !== 'string' || !LINK_PATTERN.test(secret)) return null;

    // A link does not say its type, so without one every type is tried; at most three lookups.
    const types = type ? [type] : Object.values(AuthTokenType);
    for (const candidate of types) {
      const token = await lookup(this.hashLink(candidate, secret));
      if (token && token.form === AuthTokenForm.LINK) return token;
    }
    return null;
  }

  private defaultTtl(type: AuthTokenType, form: AuthTokenForm): number {
    switch (type) {
      case AuthTokenType.VERIFY_EMAIL:
        return AUTH_TOKEN_TTL_MS.VERIFY_EMAIL_LINK;
      case AuthTokenType.LOGIN:
        return form === AuthTokenForm.CODE
          ? AUTH_TOKEN_TTL_MS.LOGIN_CODE
          : AUTH_TOKEN_TTL_MS.LOGIN_LINK;
      case AuthTokenType.INVITE:
        return AUTH_TOKEN_TTL_MS.INVITE_LINK;
      case AuthTokenType.SENSITIVE_ACTION:
      case AuthTokenType.CHANGE_EMAIL:
        return AUTH_TOKEN_TTL_MS.SENSITIVE_CODE;
    }
  }
}
