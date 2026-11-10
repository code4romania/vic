import { getQueueToken } from '@nestjs/bull';
import type * as Bull from 'bull';
import { Queue } from 'bull';
import { QUEUES } from 'src/common/constants/constants';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';

// Bull keeps the queue's defaultJobOptions on the instance; its typings leave it out.
const jobOptions = (queue: Queue): Bull.JobOptions =>
  (queue as Queue & { defaultJobOptions: Bull.JobOptions }).defaultJobOptions;

// The queue board shows every job's data, the emails with login links and codes among them.
describe('Queue board and job retention (e2e)', () => {
  const BOARD = '/admin/queues';
  const ENV = ['BULL_BOARD_ENABLED', 'BULL_BOARD_USER', 'BULL_BOARD_PASSWORD'];
  let saved: Record<string, string>;

  beforeAll(() => {
    saved = Object.fromEntries(ENV.map((key) => [key, process.env[key]]));
  });

  afterEach(() => {
    for (const key of ENV) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  const withApp = async (
    env: Record<string, string>,
    run: (testApp: TestApp) => Promise<void>,
  ): Promise<void> => {
    for (const key of ENV) delete process.env[key];
    Object.assign(process.env, env);
    const testApp = await createTestApp();
    try {
      await run(testApp);
    } finally {
      await testApp.close();
    }
  };

  const get = (testApp: TestApp, path = BOARD): request.Test =>
    request(testApp.app.getHttpServer()).get(path);

  it('is not mounted by default: /admin/queues is a 404', async () => {
    await withApp({}, async (testApp) => {
      await get(testApp).expect(404);
      await get(testApp, `${BOARD}/api/queues`).expect(404);
    });
  });

  it('is not mounted when enabled without credentials', async () => {
    await withApp(
      { BULL_BOARD_ENABLED: 'true', BULL_BOARD_USER: 'ops' },
      async (testApp) => {
        await get(testApp).expect(404);
        await get(testApp, `${BOARD}/api/queues`).expect(404);
      },
    );
  });

  it('when enabled with credentials, asks for them: none or wrong ones are a 401', async () => {
    await withApp(
      {
        BULL_BOARD_ENABLED: 'true',
        BULL_BOARD_USER: 'ops',
        BULL_BOARD_PASSWORD: 'a-long-board-password',
      },
      async (testApp) => {
        const anonymous = await get(testApp, `${BOARD}/api/queues`).expect(401);
        expect(anonymous.headers['www-authenticate']).toMatch(/^Basic/);
        await get(testApp, `${BOARD}/api/queues`)
          .auth('ops', 'wrong-password')
          .expect(401);
        await get(testApp, `${BOARD}/api/queues`)
          .auth('admin', 'a-long-board-password')
          .expect(401);

        const { body } = await get(testApp, `${BOARD}/api/queues`)
          .auth('ops', 'a-long-board-password')
          .expect(200);
        expect(
          body.queues.map((queue: { name: string }) => queue.name),
        ).toEqual(expect.arrayContaining([QUEUES.MAILS]));
      },
    );
  });

  it('the queues that carry emails or push tokens do not keep finished jobs: a completed one is gone from Redis', async () => {
    await withApp({}, async (testApp) => {
      for (const name of [
        QUEUES.MAILS,
        QUEUES.AUTH_TRANSITION,
        QUEUES.PUSH_NOTIFICATIONS_TICKETS,
      ]) {
        const queue = testApp.app.get<Queue>(getQueueToken(name));
        expect(jobOptions(queue)).toMatchObject({
          removeOnComplete: true,
          removeOnFail: { age: 24 * 60 * 60, count: 100 },
        });
      }
      const queue = testApp.app.get<Queue>(getQueueToken(QUEUES.MAILS));
      // A queue of its own (same options) and a processor that only completes the job: no SMTP here.
      // The Bull class itself, as the app loaded it (a default import differs between ts-jest and tsc).
      const QueueClass = queue.constructor as new (
        name: string,
        options: Bull.QueueOptions,
      ) => Queue;
      const probe = new QueueClass(`${QUEUES.MAILS}-probe`, {
        prefix: process.env.BULL_PREFIX,
        redis: {
          host: process.env.REDIS_HOST,
          port: +process.env.REDIS_PORT,
        },
        defaultJobOptions: jobOptions(queue),
      });
      try {
        const done = new Promise<void>((resolve) =>
          probe.on('completed', () => resolve()),
        );
        probe.process(async () => 'sent');
        const job = await probe.add({ context: { code: '123456' } });
        await done;
        // removal runs with the completion, in the same script
        await expect(probe.getJob(job.id)).resolves.toBeNull();
        expect(await probe.getCompletedCount()).toBe(0);
      } finally {
        await probe.obliterate({ force: true });
        await probe.close();
      }
    });
  });
});
