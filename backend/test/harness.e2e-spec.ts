import { JwtService } from '@nestjs/jwt';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// Proves the harness the later layers build on: the app boots on the test database, a token can be
// minted for a seeded identity, and emails land in the fake mailbox instead of the queue.
describe('e2e harness', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    testApp.mailbox.clear();
    await truncate(testApp.dataSource, [
      'auth_identity',
      'user',
      'organization',
    ]);
  });

  it('boots the app on the local test database', async () => {
    const [{ current_database }] = await testApp.dataSource.query(
      'SELECT current_database()',
    );
    expect(current_database).toMatch(/^vic_test_\d+$/);

    await request(testApp.app.getHttpServer())
      .get('/public/health')
      .expect(200);
  });

  it('mints an access token for a seeded identity', async () => {
    const identity = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'admin@example.ro',
      status: AuthIdentityStatus.ACTIVE,
    });

    const token = await testApp.mintAccessToken(identity, AuthRealm.WEB);

    const payload = testApp.app
      .get(JwtService)
      .verify(token, { audience: 'vic-web' });
    expect(payload).toMatchObject({ sub: identity.id, iss: 'vic-api' });
    expect(payload.sid).toEqual(expect.any(String));
  });

  it('collects emails in the fake mailbox', async () => {
    const mailer = testApp.app.get(AuthMailerService);
    const url = mailer.setPasswordUrl('secret');

    await mailer.send('admin@example.ro', AUTH_EMAILS.resetLink(url));

    expect(url).toBe('https://vic.test/set-password?token=secret');
    expect(testApp.mailbox.last('admin@example.ro')).toMatchObject({
      subject: expect.stringContaining('Resetare parolă'),
      context: expect.objectContaining({
        cta: expect.objectContaining({ link: url }),
      }),
    });
  });
});
