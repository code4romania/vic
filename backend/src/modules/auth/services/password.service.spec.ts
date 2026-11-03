import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes with argon2id and verifies the same password', async () => {
    const hash = await service.hash('Volunteer#2026');

    expect(hash).toMatch(/^\$argon2id\$v=19\$/);
    const params = hash.split('$')[3].split(',').sort();
    expect(params).toEqual(['m=19456', 'p=1', 't=2']);
    await expect(service.verify(hash, 'Volunteer#2026')).resolves.toBe(true);
  });

  it('rejects a wrong password, an empty hash and a malformed hash', async () => {
    const hash = await service.hash('Volunteer#2026');

    await expect(service.verify(hash, 'Volunteer#2027')).resolves.toBe(false);
    await expect(service.verify(null, 'Volunteer#2026')).resolves.toBe(false);
    await expect(service.verify('not-a-hash', 'Volunteer#2026')).resolves.toBe(
      false,
    );
  });

  it('salts every hash', async () => {
    const [first, second] = await Promise.all([
      service.hash('Volunteer#2026'),
      service.hash('Volunteer#2026'),
    ]);

    expect(first).not.toBe(second);
  });

  it.each(['Volunteer#2026', 'Aa1!aaaa'])('policy accepts %p', (password) => {
    expect(service.meetsPolicy(password)).toBe(true);
  });

  it.each([
    ['all lower case', 'password'],
    ['all upper case', 'PASSWORD'],
    ['too short', 'Pass1'],
    ['257 characters', `Aa1!${'a'.repeat(253)}`],
    ['not a string', undefined],
  ])('policy rejects %s', (_, password) => {
    expect(service.meetsPolicy(password)).toBe(false);
  });
});
