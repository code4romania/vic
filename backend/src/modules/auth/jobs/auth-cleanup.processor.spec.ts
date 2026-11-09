import { Queue } from 'bull';
import { DataSource } from 'typeorm';
import {
  createTestDataSource,
  truncate,
} from '../../../../test/utils/test-data-source';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { AuthIdentityProviderEntity } from '../entities/auth-identity-provider.entity';
import { AuthIdentityEntity } from '../entities/auth-identity.entity';
import { AuthTokenEntity } from '../entities/auth-token.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { AuthRealm, AuthTokenForm, AuthTokenType } from '../enums/auth.enums';
import { AuthIdentityProviderRepository } from '../repositories/auth-identity-provider.repository';
import { AuthIdentityRepository } from '../repositories/auth-identity.repository';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { AuthIdentityFacade } from '../services/auth-identity.facade';
import { AuthCleanupProcessor } from './auth-cleanup.processor';

// Runs against the local vic_test database (see test/utils/test-data-source.ts).
// One row of each kind that should go and one that should stay.
describe('AuthCleanupProcessor (database)', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const ago = (days: number): Date => new Date(Date.now() - days * DAY);

  let dataSource: DataSource;
  let processor: AuthCleanupProcessor;
  let s3: { deleteFile: jest.Mock; deletePublicFile: jest.Mock };

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const facade = new AuthIdentityFacade(
      new AuthIdentityRepository(dataSource.getRepository(AuthIdentityEntity)),
      new AuthTokenRepository(dataSource.getRepository(AuthTokenEntity)),
      new RefreshTokenRepository(dataSource.getRepository(RefreshTokenEntity)),
      new AuthIdentityProviderRepository(
        dataSource.getRepository(AuthIdentityProviderEntity),
      ),
    );
    s3 = { deleteFile: jest.fn(), deletePublicFile: jest.fn() };
    processor = new AuthCleanupProcessor(
      { add: jest.fn() } as unknown as Queue,
      facade,
      s3 as unknown as S3Service,
      dataSource,
    );
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await truncate(dataSource, ['auth_identity', 'user', 'organization']);
  });

  const identity = async (
    email: string,
    realm: AuthRealm,
    extra: Partial<AuthIdentityEntity> = {},
  ): Promise<AuthIdentityEntity> =>
    dataSource
      .getRepository(AuthIdentityEntity)
      .save({ realm, email, ...extra });

  const organization = async (
    name: string,
    status: string,
    createdOn: Date,
  ): Promise<string> => {
    const [row] = await dataSource.query(
      `INSERT INTO organization (name, email, phone, status, created_on, logo)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        name,
        `${name}@org.test`,
        `+40${Math.floor(Math.random() * 1e9)}`,
        status,
        createdOn,
        `http://localhost:9090/vic-local-public/organizations/${name}/logo.png`,
      ],
    );
    const [admin] = await dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Admin', $1, '+40700000000', $2) RETURNING id`,
      [`admin@${name}.test`, row.id],
    );
    await identity(`admin@${name}.test`, AuthRealm.WEB, { userId: admin.id });
    return row.id;
  };

  it('deletes what is old enough and keeps the rest', async () => {
    // Sessions: expired 8 days ago goes; revoked 8 days ago goes; revoked yesterday stays; live stays.
    const owner = await identity('owner@x.ro', AuthRealm.WEB);
    const sessions = dataSource.getRepository(RefreshTokenEntity);
    const session = (
      hash: string,
      extra: Partial<RefreshTokenEntity>,
    ): Promise<RefreshTokenEntity> =>
      sessions.save({
        identityId: owner.id,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + DAY),
        ...extra,
      });
    await session('expired-old', { expiresAt: ago(8) });
    await session('revoked-old', { revokedAt: ago(8) });
    const revokedRecently = await session('revoked-new', { revokedAt: ago(1) });
    const live = await session('live', {});

    // One-time tokens: used 91 days ago goes; used 10 days ago stays.
    const tokens = dataSource.getRepository(AuthTokenEntity);
    const token = (hash: string, usedAt: Date): Promise<AuthTokenEntity> =>
      tokens.save({
        identityId: owner.id,
        tokenHash: hash,
        type: AuthTokenType.LOGIN,
        form: AuthTokenForm.LINK,
        expiresAt: usedAt,
        usedAt,
      });
    await token('used-old', ago(91));
    const usedRecently = await token('used-new', ago(10));

    // Organizations: pending for 8 days goes with its admin and files; pending for 2 days and active stay.
    const oldPending = await organization('oldpending', 'pending', ago(8));
    const newPending = await organization('newpending', 'pending', ago(2));
    const active = await organization('active', 'active', ago(30));

    // Mobile sign-ups never confirmed: 8 days goes; 2 days stays; verified stays.
    await identity('unverified-old@x.ro', AuthRealm.MOBILE, {
      createdOn: ago(8),
    });
    await identity('unverified-new@x.ro', AuthRealm.MOBILE, {
      createdOn: ago(2),
    });
    await identity('verified@x.ro', AuthRealm.MOBILE, {
      createdOn: ago(30),
      emailVerifiedAt: ago(30),
    });

    const counts = await processor.run();

    expect(counts).toEqual({
      sessions: 2,
      tokens: 1,
      pendingOrganizations: 1,
      unverifiedMobileIdentities: 1,
    });

    expect((await sessions.find()).map((s) => s.id).sort()).toEqual(
      [revokedRecently.id, live.id].sort(),
    );
    expect((await tokens.find()).map((t) => t.id)).toEqual([usedRecently.id]);

    const organizations: { id: string }[] = await dataSource.query(
      `SELECT id FROM organization`,
    );
    expect(organizations.map((o) => o.id).sort()).toEqual(
      [newPending, active].sort(),
    );
    const admins = await dataSource.query(
      `SELECT email FROM "user" WHERE organization_id = $1`,
      [oldPending],
    );
    expect(admins).toHaveLength(0);
    expect(
      await dataSource
        .getRepository(AuthIdentityEntity)
        .findOneBy({ email: 'admin@oldpending.test' }),
    ).toBeNull();
    expect(s3.deletePublicFile).toHaveBeenCalledWith(
      'http://localhost:9090/vic-local-public/organizations/oldpending/logo.png',
    );
    expect(s3.deleteFile).not.toHaveBeenCalled();

    const mobile = await dataSource
      .getRepository(AuthIdentityEntity)
      .find({ where: { realm: AuthRealm.MOBILE } });
    expect(mobile.map((i) => i.email).sort()).toEqual([
      'unverified-new@x.ro',
      'verified@x.ro',
    ]);
  });
});
