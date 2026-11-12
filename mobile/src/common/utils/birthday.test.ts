import { birthdayToApi } from './birthday';

describe('birthday (#584)', () => {
  it('sends the picked calendar day as noon UTC, whatever the local time of the pick', () => {
    // 12 May 2004, local midnight (what the picker returns)
    expect(birthdayToApi(new Date(2004, 4, 12)).toISOString()).toBe('2004-05-12T12:00:00.000Z');
    expect(birthdayToApi(new Date(2004, 4, 12, 23, 59)).toISOString()).toBe(
      '2004-05-12T12:00:00.000Z',
    );
  });
});
