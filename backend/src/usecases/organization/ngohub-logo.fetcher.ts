import { Injectable, Logger } from '@nestjs/common';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { isLogoImage, LOGO_MAX_BYTES } from './register-organization.usecase';

const TIMEOUT_MS = 10_000;

// Copies the organization's logo from NGO Hub when an NGO registers from there. The URL comes from the
// registration ticket only, never from the request, and is still checked: https, a host on
// NGOHUB_LOGO_HOSTS (the NGO Hub bucket), no redirects, 10 s, at most 5 MB, an image like an uploaded logo.
// Anything else gives no logo (logged): the registration goes on without one.
@Injectable()
export class NgoHubLogoFetcher {
  private readonly logger = new Logger(NgoHubLogoFetcher.name);
  // Replaced in specs; the real one otherwise.
  fetchImpl: typeof fetch = (input, init) => fetch(input, init);

  constructor(private readonly authConfig: AuthConfigService) {}

  async fetch(url: string): Promise<Express.Multer.File | null> {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return this.skip('not a URL');
    }
    if (parsed.protocol !== 'https:') return this.skip('not https');
    if (
      !this.authConfig.ngohubLogoHosts.includes(parsed.hostname.toLowerCase())
    ) {
      return this.skip(`host ${parsed.hostname} is not allowed`);
    }

    try {
      const response = await this.fetchImpl(parsed.toString(), {
        redirect: 'error',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) return this.skip(`HTTP ${response.status}`);
      if (+(response.headers.get('content-length') ?? 0) > LOGO_MAX_BYTES) {
        return this.skip('too large');
      }
      const buffer = await readAtMost(response, LOGO_MAX_BYTES);
      if (!buffer) return this.skip('too large');

      const mimetype = (response.headers.get('content-type') ?? '')
        .split(';')[0]
        .trim()
        .toLowerCase();
      // isLogoImage takes a Multer file; this is the same shape for a downloaded buffer.
      const file = {
        fieldname: 'logo',
        originalname: `logo.${mimetype.split('/')[1] ?? 'img'}`,
        encoding: '7bit',
        mimetype,
        size: buffer.length,
        buffer,
      } as Express.Multer.File;
      return isLogoImage(file) ? file : this.skip(`not an image (${mimetype})`);
    } catch (error) {
      return this.skip(`download failed: ${error}`);
    }
  }

  private skip(reason: string): null {
    this.logger.warn(`NGO Hub logo not copied: ${reason}`);
    return null;
  }
}

async function readAtMost(
  response: Response,
  max: number,
): Promise<Buffer | null> {
  const reader = response.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
