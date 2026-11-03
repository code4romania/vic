import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/infrastructure/providers/redis/redis-provider.module';
import { AuthTokenType } from '../enums/auth.enums';
import { AuthException, AuthExceptionCodes } from '../exceptions/exceptions';

interface Window {
  name: string;
  seconds: number;
  limit: number;
}

// One emailed token a minute and five an hour, per identity and type.
const ISSUE_WINDOWS: Window[] = [
  { name: 'minute', seconds: 60, limit: 1 },
  { name: 'hour', seconds: 60 * 60, limit: 5 },
];

// Send invite on the Team page: one per 10 minutes and five a day, per target.
const INVITE_WINDOWS: Window[] = [
  { name: '10min', seconds: 10 * 60, limit: 1 },
  { name: 'day', seconds: 24 * 60 * 60, limit: 5 },
];

// Fixed-window counters in Redis (INCR + EXPIRE). Every call counts, allowed or not.
@Injectable()
export class AuthRateLimitService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  // AUTH_010 when the identity already got a token of this type too recently.
  public async assertCanIssue(
    identityId: string,
    type: AuthTokenType,
  ): Promise<void> {
    await this.hit(`auth:issue:${identityId}:${type}`, ISSUE_WINDOWS);
  }

  // AUTH_010 when the target was invited too recently.
  public async assertCanInvite(targetIdentityId: string): Promise<void> {
    await this.hit(`auth:invite:${targetIdentityId}`, INVITE_WINDOWS);
  }

  private async hit(prefix: string, windows: Window[]): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const pipeline = this.redis.multi();
    const keys = windows.map((window) => {
      const key = `${prefix}:${window.name}:${Math.floor(now / window.seconds)}`;
      pipeline.incr(key).expire(key, window.seconds);
      return key;
    });

    const results = await pipeline.exec();
    // Each window adds two replies (INCR, EXPIRE); the INCR reply is the count.
    const exceeded = keys.some((_, index) => {
      const [error, count] = results[index * 2];
      if (error) throw error;
      return Number(count) > windows[index].limit;
    });

    if (exceeded) {
      throw new AuthException(AuthExceptionCodes.AUTH_010);
    }
  }
}
