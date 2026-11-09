import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { OrganizationGateService } from './organization-gate.service';
import { isLogoImage, LOGO_MAX_BYTES } from './register-organization.usecase';

const file = (
  content: Buffer,
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
  ({
    buffer: content,
    size: content.length,
    mimetype: 'application/pdf',
    ...overrides,
  }) as Express.Multer.File;

describe('isLogoImage (the logo)', () => {
  const png = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
  ]);
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
  const gif = Buffer.from('GIF89a\x01\x00', 'latin1');
  const webp = Buffer.from('RIFF\x00\x00\x00\x00WEBPVP8 ', 'latin1');
  const image = (
    content: Buffer,
    mimetype: string,
    size?: number,
  ): Express.Multer.File =>
    file(content, { mimetype, ...(size ? { size } : {}) });

  it.each([
    ['a PNG', image(png, 'image/png')],
    ['a JPEG', image(jpeg, 'image/jpeg')],
    ['a GIF', image(gif, 'image/gif')],
    ['a WebP', image(webp, 'image/webp')],
  ])('accepts %s', (_, candidate) => {
    expect(isLogoImage(candidate)).toBe(true);
  });

  it.each([
    ['no file', undefined],
    [
      'text sent as a PNG',
      image(Buffer.from('this is not a pdf\n'), 'image/png'),
    ],
    ['a PDF sent as an image', image(Buffer.from('%PDF-1.7'), 'image/png')],
    [
      'an SVG',
      image(
        Buffer.from('<svg><script>alert(1)</script></svg>'),
        'image/svg+xml',
      ),
    ],
    ['a PNG sent as a JPEG', image(png, 'image/jpeg')],
    ['a PNG of more than 5 MB', image(png, 'image/png', LOGO_MAX_BYTES + 1)],
  ])('refuses %s', (_, candidate) => {
    expect(isLogoImage(candidate)).toBe(false);
  });
});

describe('OrganizationGateService (decision 1)', () => {
  const organizations = { findOrganization: jest.fn() };
  const gate = new OrganizationGateService(
    organizations as unknown as OrganizationFacadeService,
  );
  const refused = { response: { code_error: 'ORG_005' }, status: 403 };

  it.each([
    ['unknown', null],
    [
      'pending (email not confirmed)',
      { status: OrganizationStatus.PENDING, validatedAt: null },
    ],
    [
      'confirmed but not validated',
      { status: OrganizationStatus.ACTIVE, validatedAt: null },
    ],
    [
      'validated but suspended',
      { status: OrganizationStatus.SUSPENDED, validatedAt: new Date() },
    ],
  ])('refuses an organization that is %s', async (_, organization) => {
    organizations.findOrganization.mockResolvedValue(organization);

    await expect(gate.assertValidated('org-id')).rejects.toMatchObject(refused);
  });

  it('lets a validated active organization through', async () => {
    organizations.findOrganization.mockResolvedValue({
      status: OrganizationStatus.ACTIVE,
      validatedAt: new Date(),
    });

    await expect(gate.assertValidated('org-id')).resolves.toBeUndefined();
  });

  it('refuses a missing id without looking anything up', async () => {
    organizations.findOrganization.mockClear();

    await expect(gate.assertValidated(undefined)).rejects.toMatchObject(
      refused,
    );
    expect(organizations.findOrganization).not.toHaveBeenCalled();
  });
});
