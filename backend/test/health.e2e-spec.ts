import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/infrastructure/providers/redis/redis-provider.module';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';

// GET /public/health is the load balancer's health check: 200 only while Postgres and Redis answer.
describe('Health check (e2e)', () => {
  let testApp: TestApp;

  const health = (): request.Test =>
    request(testApp.app.getHttpServer()).get('/public/health');

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  it('answers 200 when the database and Redis are up', async () => {
    const { body } = await health().expect(200);
    expect(body).toEqual({ status: 'ok', database: 'up', redis: 'up' });
  });

  it('answers 503 when the database does not answer', async () => {
    jest
      .spyOn(testApp.dataSource, 'query')
      .mockRejectedValueOnce(new Error('connection terminated'));

    const { body } = await health().expect(503);
    expect(body).toMatchObject({
      status: 'error',
      database: 'down',
      redis: 'up',
    });
  });

  it('answers 503 when Redis does not answer', async () => {
    const redis = testApp.app.get<Redis>(REDIS_CLIENT);
    jest
      .spyOn(redis, 'ping')
      .mockRejectedValueOnce(new Error('Connection is closed.'));

    const { body } = await health().expect(503);
    expect(body).toMatchObject({
      status: 'error',
      database: 'up',
      redis: 'down',
    });
  });
});
