import { createTestAuthConfig } from '../../../test/utils/auth-test-config';
import { NgoHubLogoFetcher } from './ngohub-logo.fetcher';

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(32),
]);
const BUCKET = 'ngohub-public.s3.eu-central-1.amazonaws.com';

describe('NgoHubLogoFetcher', () => {
  let fetcher: NgoHubLogoFetcher;
  let calls: { url: string; init: RequestInit }[];

  const answer = (body: Buffer, type = 'image/png', status = 200): void => {
    fetcher.fetchImpl = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(body, {
        status,
        headers: { 'content-type': type },
      });
    }) as typeof fetch;
  };

  beforeEach(() => {
    calls = [];
    fetcher = new NgoHubLogoFetcher(
      createTestAuthConfig({ NGOHUB_LOGO_HOSTS: `${BUCKET}, cdn.ngohub.ro` }),
    );
    answer(PNG);
  });

  it('copies an image from an allowed https host, without following redirects', async () => {
    const file = await fetcher.fetch(
      `https://${BUCKET}/logos/1.png?X-Amz-Signature=x`,
    );
    expect(file).toMatchObject({ mimetype: 'image/png', size: PNG.length });
    expect(calls).toHaveLength(1);
    expect(calls[0].init.redirect).toBe('error');
  });

  it.each([
    ['another host', 'https://evil.example/logo.png'],
    ['a look-alike host', `https://${BUCKET}.evil.example/logo.png`],
    ['http', `http://${BUCKET}/logo.png`],
    ['not a URL', 'logo.png'],
  ])('refuses %s without a request', async (_, url) => {
    expect(await fetcher.fetch(url)).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('refuses no host at all when none is configured', async () => {
    fetcher = new NgoHubLogoFetcher(createTestAuthConfig());
    expect(await fetcher.fetch(`https://${BUCKET}/logo.png`)).toBeNull();
  });

  it('refuses what is not an image, or is larger than 5 MB', async () => {
    answer(Buffer.from('<svg onload="alert(1)"/>'), 'image/svg+xml');
    expect(await fetcher.fetch(`https://${BUCKET}/logo.svg`)).toBeNull();

    answer(Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]));
    expect(await fetcher.fetch(`https://${BUCKET}/big.png`)).toBeNull();

    answer(PNG, 'image/png', 404);
    expect(await fetcher.fetch(`https://${BUCKET}/missing.png`)).toBeNull();
  });
});
