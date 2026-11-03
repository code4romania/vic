import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateOrganizationDto } from './update-organization.dto';

// What the ValidationPipe does with a multipart body (every value a string).
const parse = async (
  body: Record<string, string>,
): Promise<{ dto: UpdateOrganizationDto; errors: string[] }> => {
  const dto = plainToInstance(UpdateOrganizationDto, body);
  const errors = (await validate(dto)).flatMap((error) =>
    Object.values(error.constraints ?? {}),
  );
  return { dto, errors };
};

const description = 'O descriere suficient de lunga pentru a trece de minim.';

describe('UpdateOrganizationDto (multipart edit form)', () => {
  it('treats fields left empty as unchanged, as Swagger sends them', async () => {
    const { dto, errors } = await parse({
      name: '',
      email: '',
      phone: '',
      address: '',
      activityArea: '',
      taxId: '',
      description,
      website: 'https://seed-unu.ro',
    });

    expect(errors).toEqual([]);
    expect(dto).toMatchObject({
      name: undefined,
      email: undefined,
      phone: undefined,
      address: undefined,
      activityArea: undefined,
      taxId: undefined,
      description,
      website: 'https://seed-unu.ro',
    });
  });

  it('treats whitespace-only fields as empty too (trimmed first)', async () => {
    const { dto, errors } = await parse({ name: '   ', email: '  ' });

    expect(errors).toEqual([]);
    expect(dto.name).toBeUndefined();
    expect(dto.email).toBeUndefined();
  });

  it('clears the website when it is sent empty', async () => {
    const { dto, errors } = await parse({ website: '' });

    expect(errors).toEqual([]);
    expect(dto.website).toBeNull();
  });

  it('still validates the fields that are filled in', async () => {
    const { errors } = await parse({
      description: 'Prea scurta',
      website: 'seed-unu.ro',
      taxId: 'ABC',
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        'description must be longer than or equal to 50 characters',
        'website must be a URL address',
        'taxId must be a CUI',
      ]),
    );
  });
});
