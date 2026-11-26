import { Inject, Injectable } from '@nestjs/common';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/infrastructure/providers/redis/redis-provider.module';
import { AuthException, AuthExceptionCodes } from '../../exceptions/exceptions';
import { NgoHubProfile } from './ngohub.types';

export const NGOHUB_TICKET_TTL_SECONDS = 30 * 60;

interface StoredTicket {
  profile: NgoHubProfile;
  cookieHash: string;
}

const sha256 = (value: string): string =>
  createHash('sha256')
    .update(value ?? '')
    .digest('base64url');

// Login with NGO Hub, an admin of an NGO VIC does not know yet: a registration ticket. It holds who logged
// in and the organization as NGO Hub described it, lives 30 minutes in Redis, works once (GETDEL) and only
// with the flow cookie of the browser that logged in. The registration takes the CUI, the organization's
// name and the admin's email from here, never from the request.
@Injectable()
export class NgoHubTicketService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async issue(profile: NgoHubProfile, flowCookie: string): Promise<string> {
    const ticket = randomBytes(32).toString('base64url');
    const stored: StoredTicket = { profile, cookieHash: sha256(flowCookie) };
    await this.redis.set(
      this.key(ticket),
      JSON.stringify(stored),
      'EX',
      NGOHUB_TICKET_TTL_SECONDS,
    );
    return ticket;
  }

  // The profile, without using the ticket up: the registration checks the form first, so a refused form
  // (an email another NGO has) can be corrected. AUTH_019 when the ticket is unknown, used, expired or
  // from another browser; another browser never burns it.
  async peek(ticket: string, flowCookie: string): Promise<NgoHubProfile> {
    if (typeof ticket !== 'string' || !ticket || !flowCookie) {
      throw new AuthException(AuthExceptionCodes.AUTH_019);
    }
    const raw = await this.redis.get(this.key(ticket));
    if (!raw) throw new AuthException(AuthExceptionCodes.AUTH_019);
    const stored: StoredTicket = JSON.parse(raw);
    const expected = Buffer.from(stored.cookieHash);
    const actual = Buffer.from(sha256(flowCookie));
    if (
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      throw new AuthException(AuthExceptionCodes.AUTH_019);
    }
    return stored.profile;
  }

  // The profile, once (GETDEL after the browser check): of two requests racing, only one gets it.
  async take(ticket: string, flowCookie: string): Promise<NgoHubProfile> {
    const profile = await this.peek(ticket, flowCookie);
    if (!(await this.redis.getdel(this.key(ticket)))) {
      throw new AuthException(AuthExceptionCodes.AUTH_019);
    }
    return profile;
  }

  private key(ticket: string): string {
    return `auth:ngohub:ticket:${sha256(ticket)}`;
  }
}
