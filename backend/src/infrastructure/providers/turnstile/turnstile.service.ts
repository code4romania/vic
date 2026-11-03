import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Cloudflare Turnstile, NGO registration only. Locally TURNSTILE_SECRET is Cloudflare's test secret that
// always passes.
@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);

  constructor(private readonly authConfig: AuthConfigService) {}

  async verify(token: string, ip?: string): Promise<boolean> {
    if (typeof token !== 'string' || !token) return false;

    try {
      const body = new URLSearchParams({
        secret: this.authConfig.turnstileSecret,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      });
      const { data } = await axios.post(SITEVERIFY, body, { timeout: 5000 });
      return data?.success === true;
    } catch (error) {
      // Cloudflare unreachable: refuse rather than let registrations through unchecked.
      this.logger.warn(`Turnstile check failed: ${error?.message}`);
      return false;
    }
  }
}
