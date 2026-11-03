import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';

// The per-IP throttle counts real clients. Behind the ALB, X-Forwarded-For ends with the address the ALB
// saw; with `trust proxy` 1 that is the client the throttle counts. Before Layer 4 there was no trust
// proxy, so every user behind the ALB shared the ALB's address and one bucket.
describe('Throttle per client (e2e)', () => {
  let testApp: TestApp;
  // 10 per minute on the auth routes (@Throttle). An unknown email: no login, no email, always 200.
  const ROUTE = '/auth/web/forgot-password';
  const BODY = { email: 'nobody@example.ro' };

  // `forwardedFor` is the whole header as the API receives it: what the client sent, then the ALB's hop.
  const send = (forwardedFor: string): request.Test =>
    request(testApp.app.getHttpServer())
      .post(ROUTE)
      .set('X-Forwarded-For', forwardedFor)
      .send(BODY);

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  it('the 11th request in a minute from one client is 429; another client is not affected', async () => {
    for (let n = 1; n <= 10; n++) {
      await send('203.0.113.10').expect(200);
    }
    await send('203.0.113.10').expect(429);

    await send('203.0.113.11').expect(200);
  });

  it('a client cannot dodge its limit by writing other addresses into X-Forwarded-For', async () => {
    for (let n = 1; n <= 10; n++) {
      await send('203.0.113.20').expect(200);
    }

    // The client puts a fresh address first each time; the ALB still appends the real one last.
    for (let n = 1; n <= 3; n++) {
      await send(`198.51.100.${n}, 203.0.113.20`).expect(429);
    }
  });
});
