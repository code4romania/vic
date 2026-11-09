import { AuthIdentityEntity } from '../entities/auth-identity.entity';
import { AuthIdentityStatus, AuthRealm } from '../enums/auth.enums';
import { AuthIdentityTransformer } from './auth-identity.model';

describe('AuthIdentityTransformer', () => {
  describe('toEntity', () => {
    it.each([
      ['upper case', 'Ana@Example.RO'],
      ['surrounding spaces', '  ana@example.ro '],
      ['both', ' ANA@EXAMPLE.RO\t'],
    ])('lowercases and trims the email (%s)', (_, email) => {
      const entity = AuthIdentityTransformer.toEntity({
        realm: AuthRealm.WEB,
        email,
      });

      expect(entity.email).toBe('ana@example.ro');
    });

    it('copies the creation fields', () => {
      const emailVerifiedAt = new Date('2026-01-01T00:00:00Z');

      const entity = AuthIdentityTransformer.toEntity({
        realm: AuthRealm.MOBILE,
        email: 'volunteer@example.ro',
        status: AuthIdentityStatus.ACTIVE,
        superAdmin: false,
        emailVerifiedAt,
        legacyCognitoUsername: 'google_123',
        userId: 'user-id',
      });

      expect(entity).toMatchObject({
        realm: AuthRealm.MOBILE,
        email: 'volunteer@example.ro',
        status: AuthIdentityStatus.ACTIVE,
        superAdmin: false,
        emailVerifiedAt,
        legacyCognitoUsername: 'google_123',
        userId: 'user-id',
      });
    });
  });

  describe('fromEntity', () => {
    it('returns null for a missing entity', () => {
      expect(AuthIdentityTransformer.fromEntity(null)).toBeNull();
    });

    it('maps every column', () => {
      const columns = {
        id: 'identity-id',
        realm: AuthRealm.WEB,
        email: 'admin@example.ro',
        status: AuthIdentityStatus.DISABLED,
        superAdmin: true,
        emailVerifiedAt: new Date('2026-01-01T00:00:00Z'),
        lastLoginAt: new Date('2026-01-03T00:00:00Z'),
        legacyCognitoUsername: 'cognito-username',
        userId: 'user-id',
        createdOn: new Date('2025-12-01T00:00:00Z'),
        updatedOn: new Date('2025-12-02T00:00:00Z'),
      };
      const entity = Object.assign(new AuthIdentityEntity(), columns, {
        deletedOn: null,
      });

      expect(AuthIdentityTransformer.fromEntity(entity)).toEqual(columns);
    });
  });
});
