import { DataSource } from 'typeorm';
import { createTestDataSource, truncate } from './utils/test-data-source';

// Login with NGO Hub, issue 01: the `ngohub` provider and organization.ngohub_organization_id.
describe('NGO Hub link data model (e2e)', () => {
  let dataSource: DataSource;

  const organization = async (
    suffix: string,
    ngohubId: number | null,
    deleted = false,
  ): Promise<string> =>
    (
      await dataSource.query(
        `INSERT INTO organization (name, email, phone, status, ngohub_organization_id, deleted_on)
         VALUES ($1, $2, $3, 'active', $4, $5) RETURNING id`,
        [
          `Org ${suffix}`,
          `org-${suffix}@ngo.ro`,
          `+4070000${suffix.padStart(4, '0')}`,
          ngohubId,
          deleted ? new Date() : null,
        ],
      )
    )[0].id;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
  });

  beforeEach(async () => {
    await truncate(dataSource, ['organization', 'auth_identity', 'user']);
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('allows one live organization per NGO Hub id, any number without one', async () => {
    await organization('1', 42);
    await organization('2', null);
    await organization('3', null);

    await expect(organization('4', 42)).rejects.toMatchObject({
      constraint: 'organization_ngohub_organization_id_unique',
    });
  });

  it('frees the NGO Hub id when the organization is deleted', async () => {
    await organization('1', 42, true);
    await expect(organization('2', 42)).resolves.toBeDefined();
  });

  it('stores an ngohub provider link', async () => {
    const [user] = await dataSource.query(
      `INSERT INTO "user" (type, name, email, phone) VALUES ('admin', 'A', 'a@ngo.ro', '+40711111111') RETURNING id`,
    );
    const [identity] = await dataSource.query(
      `INSERT INTO auth_identity (user_id, realm, email, status) VALUES ($1, 'web', 'a@ngo.ro', 'active') RETURNING id`,
      [user.id],
    );
    await dataSource.query(
      `INSERT INTO auth_identity_provider (identity_id, provider, subject) VALUES ($1, 'ngohub', '17')`,
      [identity.id],
    );
    await expect(
      dataSource.query(
        `INSERT INTO auth_identity_provider (identity_id, provider, subject) VALUES ($1, 'ngohub', '17')`,
        [identity.id],
      ),
    ).rejects.toMatchObject({
      constraint: 'auth_identity_provider_provider_subject_unique',
    });
  });

  it('matches the entities: no schema change left to generate', async () => {
    const sql = await dataSource.driver.createSchemaBuilder().log();
    const touching = sql.upQueries
      .map((query) => query.query)
      .filter((query) => /ngohub/i.test(query));
    expect(touching).toEqual([]);
  });

  it('reverts cleanly and applies again', async () => {
    const [user] = await dataSource.query(
      `INSERT INTO "user" (type, name, email, phone) VALUES ('admin', 'A', 'a@ngo.ro', '+40711111111') RETURNING id`,
    );
    const [identity] = await dataSource.query(
      `INSERT INTO auth_identity (user_id, realm, email, status) VALUES ($1, 'web', 'a@ngo.ro', 'active') RETURNING id`,
      [user.id],
    );
    await dataSource.query(
      `INSERT INTO auth_identity_provider (identity_id, provider, subject) VALUES ($1, 'google', 'g'), ($1, 'ngohub', '17')`,
      [identity.id],
    );

    const [last] = await dataSource.query(
      `SELECT name FROM migrations ORDER BY timestamp DESC LIMIT 1`,
    );
    expect(last.name).toBe('NgoHubLink1794470000000');
    await dataSource.undoLastMigration();

    const [{ column }] = await dataSource.query(
      `SELECT count(*)::int AS column FROM information_schema.columns
       WHERE table_name = 'organization' AND column_name = 'ngohub_organization_id'`,
    );
    expect(column).toBe(0);
    const providers = await dataSource.query(
      `SELECT provider FROM auth_identity_provider`,
    );
    expect(providers).toEqual([{ provider: 'google' }]);

    await dataSource.runMigrations();
    await expect(organization('1', 7)).resolves.toBeDefined();
  });
});
