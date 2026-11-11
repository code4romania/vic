import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRegularUserDto } from './create-regular-user.dto';
import { UpdateRegularUserDto } from './update-regular-user.dto';

describe('UpdateRegularUserDto phone', () => {
  it.each(['', '   ', '\t\n'])(
    'turns blank phone %p into null',
    async (phone) => {
      const dto = plainToInstance(UpdateRegularUserDto, { phone });

      expect(dto.phone).toBeNull();
      await expect(validate(dto)).resolves.toEqual([]);
    },
  );

  it('keeps a non-empty phone unchanged', async () => {
    const dto = plainToInstance(UpdateRegularUserDto, {
      phone: '+40720000001',
    });

    expect(dto.phone).toBe('+40720000001');
    await expect(validate(dto)).resolves.toEqual([]);
  });

  it('leaves an omitted phone undefined', async () => {
    const dto = plainToInstance(UpdateRegularUserDto, {});

    expect(dto.phone).toBeUndefined();
    await expect(validate(dto)).resolves.toEqual([]);
  });

  it('rejects a non-string phone', async () => {
    const dto = plainToInstance(UpdateRegularUserDto, { phone: ['123'] });

    expect(await validate(dto)).toEqual([
      expect.objectContaining({
        property: 'phone',
        constraints: expect.objectContaining({ isString: expect.any(String) }),
      }),
    ]);
  });

  it('still rejects an empty phone when creating a user', async () => {
    const dto = plainToInstance(CreateRegularUserDto, { phone: '' });

    expect(await validate(dto)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'phone',
          constraints: expect.objectContaining({
            isNotEmpty: expect.any(String),
          }),
        }),
      ]),
    );
  });
});
