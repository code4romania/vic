import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PASSWORD_REGEX } from 'src/common/constants/constants';

// OWASP argon2id baseline; one verify takes about 50 to 100 ms by design.
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

@Injectable()
export class PasswordService {
  public async hash(plain: string): Promise<string> {
    return argon2.hash(plain, ARGON2_OPTIONS);
  }

  // false for a wrong password and for a malformed hash; never throws on bad input.
  public async verify(hash: string, plain: string): Promise<boolean> {
    if (!hash || typeof plain !== 'string') return false;

    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  public meetsPolicy(plain: string): boolean {
    return typeof plain === 'string' && PASSWORD_REGEX.test(plain);
  }
}
