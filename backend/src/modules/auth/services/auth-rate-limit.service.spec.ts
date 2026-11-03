import Redis from 'ioredis';
import { AuthTokenType } from '../enums/auth.enums';
import { AuthExceptionCodes } from '../exceptions/exceptions';
import { AuthRateLimitService } from './auth-rate-limit.service';

// Just enough of ioredis for INCR + EXPIRE in a MULTI, with expiry driven by the (fake) clock.
class FakeRedis {
  private readonly store = new Map<string, { count: number; until: number }>();

  multi(): FakeMulti {
    return new FakeMulti(this);
  }

  incr(key: string): number {
    const entry = this.store.get(key);
    const live = entry && entry.until > Date.now() ? entry : null;
    const next = {
      count: (live?.count ?? 0) + 1,
      until: live?.until ?? Infinity,
    };
    this.store.set(key, next);
    return next.count;
  }

  expire(key: string, seconds: number): number {
    const entry = this.store.get(key);
    if (entry) entry.until = Date.now() + seconds * 1000;
    return 1;
  }

  ttl(key: string): number {
    const entry = this.store.get(key);
    return entry ? Math.ceil((entry.until - Date.now()) / 1000) : -2;
  }
}

class FakeMulti {
  private readonly commands: Array<() => number> = [];

  constructor(private readonly redis: FakeRedis) {}

  incr(key: string): this {
    this.commands.push(() => this.redis.incr(key));
    return this;
  }

  expire(key: string, seconds: number): this {
    this.commands.push(() => this.redis.expire(key, seconds));
    return this;
  }

  async exec(): Promise<Array<[Error | null, number]>> {
    return this.commands.map((command) => [null, command()]);
  }
}

describe('AuthRateLimitService', () => {
  let redis: FakeRedis;
  let service: AuthRateLimitService;
  const MINUTE = 60 * 1000;

  const rejectsWith10 = (promise: Promise<unknown>): Promise<void> =>
    expect(promise).rejects.toMatchObject({
      response: { code_error: AuthExceptionCodes.AUTH_010 },
      status: 429,
    });

  beforeEach(() => {
    jest.useFakeTimers();
    // The start of an hour, so the minute and hour windows line up with the steps below.
    jest.setSystemTime(new Date('2026-10-30T10:00:00Z'));
    redis = new FakeRedis();
    service = new AuthRateLimitService(redis as unknown as Redis);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows one token a minute per identity and type', async () => {
    await service.assertCanIssue('ana', AuthTokenType.RESET_PASSWORD);

    await rejectsWith10(
      service.assertCanIssue('ana', AuthTokenType.RESET_PASSWORD),
    );
    await expect(
      service.assertCanIssue('ana', AuthTokenType.VERIFY_EMAIL),
    ).resolves.toBeUndefined();
    await expect(
      service.assertCanIssue('bogdan', AuthTokenType.RESET_PASSWORD),
    ).resolves.toBeUndefined();
  });

  it('refuses the sixth token in an hour', async () => {
    for (let minute = 0; minute < 5; minute++) {
      jest.setSystemTime(new Date(Date.UTC(2026, 9, 30, 10, minute * 2)));
      await service.assertCanIssue('ana', AuthTokenType.RESET_PASSWORD);
    }

    jest.setSystemTime(new Date(Date.UTC(2026, 9, 30, 10, 30)));
    await rejectsWith10(
      service.assertCanIssue('ana', AuthTokenType.RESET_PASSWORD),
    );

    jest.setSystemTime(new Date(Date.UTC(2026, 9, 30, 11, 0)));
    await expect(
      service.assertCanIssue('ana', AuthTokenType.RESET_PASSWORD),
    ).resolves.toBeUndefined();
  });

  it('sets an expiry on every key', async () => {
    await service.assertCanIssue('ana', AuthTokenType.RESET_PASSWORD);

    const bucket = Math.floor(Date.now() / 1000);
    expect(
      redis.ttl(
        `auth:issue:ana:reset_password:minute:${Math.floor(bucket / 60)}`,
      ),
    ).toBe(60);
    expect(
      redis.ttl(
        `auth:issue:ana:reset_password:hour:${Math.floor(bucket / 3600)}`,
      ),
    ).toBe(3600);
  });

  it('Send invite: one per 10 minutes and five a day per target', async () => {
    await service.assertCanInvite('target');
    jest.advanceTimersByTime(5 * MINUTE);
    await rejectsWith10(service.assertCanInvite('target'));
    await expect(service.assertCanInvite('other')).resolves.toBeUndefined();

    for (let step = 1; step <= 3; step++) {
      jest.setSystemTime(new Date(Date.UTC(2026, 9, 30, 10 + step, 0)));
      await service.assertCanInvite('target');
    }
    jest.setSystemTime(new Date(Date.UTC(2026, 9, 30, 15, 0)));
    // The rejected press at 10:05 counted too, so this is the sixth today.
    await rejectsWith10(service.assertCanInvite('target'));
  });
});
