import { PASSWORD_REGEX } from './constants';

describe('PASSWORD_REGEX', () => {
  it.each(['Volunteer#2026', 'Aa1!aaaa', 'Str0ng pass word!', 'Parola-Mea-2026'])(
    'accepts %p',
    (password) => {
      expect(PASSWORD_REGEX.test(password)).toBe(true);
    },
  );

  it.each([
    ['all lower case', 'password'],
    ['all upper case', 'PASSWORD'],
    ['too short', 'Pass1!'],
    ['no digit', 'Password!'],
    ['no symbol', 'Password1'],
    ['leading space', ' Volunteer#2026'],
    ['trailing space', 'Volunteer#2026 '],
    ['257 characters', 'Aa1!' + 'a'.repeat(253)],
    ['empty', ''],
  ])('rejects %s', (_label, password) => {
    expect(PASSWORD_REGEX.test(password)).toBe(false);
  });
});
