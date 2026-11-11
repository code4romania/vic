import API from '../api';
import { Sex } from '../../common/enums/sex.enum';
import { updateUserProfile } from './user.api';

jest.mock('../api', () => ({ __esModule: true, default: { patch: jest.fn() } }));

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
