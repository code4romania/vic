import { AuthIdentityEntity } from '../entities/auth-identity.entity';
import { AuthIdentityStatus, AuthRealm } from '../enums/auth.enums';

export interface IAuthIdentityModel {
  id: string;
  realm: AuthRealm;
  email: string;
  passwordHash: string;
  status: AuthIdentityStatus;
  superAdmin: boolean;
  emailVerifiedAt: Date;
  passwordSetAt: Date;
  lastLoginAt: Date;
  failedAttempts: number;
  lockedUntil: Date;
  legacyCognitoUsername: string;
  userId: string;
  createdOn: Date;
  updatedOn: Date;
}

export type CreateAuthIdentityOptions = Pick<
  IAuthIdentityModel,
  'realm' | 'email'
> &
  Partial<
    Pick<
      IAuthIdentityModel,
      | 'passwordHash'
      | 'status'
      | 'superAdmin'
      | 'emailVerifiedAt'
      | 'passwordSetAt'
      | 'legacyCognitoUsername'
      | 'userId'
    >
  >;

export type UpdateAuthIdentityOptions = Partial<
  Pick<
    IAuthIdentityModel,
    | 'email'
    | 'passwordHash'
    | 'status'
    | 'superAdmin'
    | 'emailVerifiedAt'
    | 'passwordSetAt'
    | 'lastLoginAt'
    | 'failedAttempts'
    | 'lockedUntil'
    | 'userId'
  >
>;

// created is false when an identity with the same realm and email already existed; it is returned unchanged.
export type UpsertAuthIdentityResult = {
  identity: IAuthIdentityModel;
  created: boolean;
};

export type FindAuthIdentityOptions =
  | Pick<IAuthIdentityModel, 'id'>
  | Pick<IAuthIdentityModel, 'realm' | 'email'>
  | Pick<IAuthIdentityModel, 'userId'>;

export class AuthIdentityTransformer {
  static normalizeEmail(email: string): string {
    return email?.trim().toLowerCase();
  }

  static fromEntity(entity: AuthIdentityEntity): IAuthIdentityModel {
    if (!entity) return null;
    return {
      id: entity.id,
      realm: entity.realm,
      email: entity.email,
      passwordHash: entity.passwordHash,
      status: entity.status,
      superAdmin: entity.superAdmin,
      emailVerifiedAt: entity.emailVerifiedAt,
      passwordSetAt: entity.passwordSetAt,
      lastLoginAt: entity.lastLoginAt,
      failedAttempts: entity.failedAttempts,
      lockedUntil: entity.lockedUntil,
      legacyCognitoUsername: entity.legacyCognitoUsername,
      userId: entity.userId,
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }

  static toEntity(model: CreateAuthIdentityOptions): AuthIdentityEntity {
    const entity = new AuthIdentityEntity();
    entity.realm = model.realm;
    entity.email = AuthIdentityTransformer.normalizeEmail(model.email);
    entity.passwordHash = model.passwordHash;
    entity.status = model.status;
    entity.superAdmin = model.superAdmin;
    entity.emailVerifiedAt = model.emailVerifiedAt;
    entity.passwordSetAt = model.passwordSetAt;
    entity.legacyCognitoUsername = model.legacyCognitoUsername;
    entity.userId = model.userId;
    return entity;
  }
}
