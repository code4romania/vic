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
  it('treats required fields left empty as unchanged, as Swagger sends them', async () => {
    const { dto, errors } = await parse({
      name: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      description,
      website: 'https://seed-unu.ro',
    });

    expect(errors).toEqual([]);
    expect(dto).toMatchObject({
      name: undefined,
      email: undefined,
      phone: undefined,
      address: null,
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

  it('clears the optional address, description and website when sent empty (#469)', async () => {
    const { dto, errors } = await parse({
      address: '',
      description: ' ',
      website: '',
    });

    expect(errors).toEqual([]);
    expect(dto.address).toBeNull();
    expect(dto.description).toBeNull();
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
        'taxId must be a valid CUI',
      ]),
    );
  });
});
