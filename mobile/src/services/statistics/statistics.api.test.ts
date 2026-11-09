import API from '../api';
import { getPersonalStatistics } from './statistics.api';

jest.mock('../api', () => ({ __esModule: true, default: { get: jest.fn() } }));

describe('getPersonalStatistics', () => {
  it('reads the volunteer totals for Profil', async () => {
    const stats = {
      approvedHours: 8,
      events: 2,
      memberSince: '2024-08-01T10:00:00Z',
      yearsInVic: 2,
    };
    (API.get as jest.Mock).mockResolvedValue({ data: stats });

    await expect(getPersonalStatistics()).resolves.toEqual(stats);
    expect(API.get).toHaveBeenCalledWith('/mobile/statistics/me');
  });
});
