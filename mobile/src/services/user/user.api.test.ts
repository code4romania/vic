import API from '../api';
import { Sex } from '../../common/enums/sex.enum';
import { setUserLanguage, updateUserProfile } from './user.api';

jest.mock('../api', () => ({ __esModule: true, default: { patch: jest.fn() } }));

describe('setUserLanguage', () => {
  it.each([true, false])('sends the language and whether it is a choice (%p)', async (explicit) => {
    (API.patch as jest.Mock).mockResolvedValue({ data: { language: 'ro' } });

    // the answer is the language the account keeps, which may differ from the one sent
    expect(await setUserLanguage('en', explicit)).toEqual({ language: 'ro' });

    expect(API.patch).toHaveBeenLastCalledWith('/mobile/user/language', {
      language: 'en',
      explicit,
    });
  });
});

describe('updateUserProfile', () => {
  it.each([
    ['', ''],
    [undefined, ''],
    ['+40720000001', '+40720000001'],
  ])('sends phone %p as %p in multipart data', async (phone, expectedPhone) => {
    (API.patch as jest.Mock).mockResolvedValue({ data: {} });
    const append = jest.spyOn(FormData.prototype, 'append');

    try {
      await updateUserProfile({
        firstName: 'Ana',
        lastName: 'Popescu',
        email: 'ana@example.ro',
        phone,
        countyId: 1,
        cityId: 1,
        birthday: new Date('2000-01-01'),
        sex: Object.values(Sex)[0],
      });

      expect(API.patch).toHaveBeenLastCalledWith('/mobile/user/profile', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const formData = (API.patch as jest.Mock).mock.calls.slice(-1)[0][1];
      const phoneCall = append.mock.calls.findIndex(([name]) => name === 'phone');
      expect(append.mock.calls[phoneCall]).toEqual(['phone', expectedPhone]);
      expect(append.mock.contexts[phoneCall]).toBe(formData);
    } finally {
      append.mockRestore();
    }
  });
});
