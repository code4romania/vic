import { accessCodeStatus, IAccessCode } from './AccesCodes';

const code = (startDate: string, endDate?: string) =>
  ({ startDate: new Date(startDate), endDate: endDate && new Date(endDate) }) as IAccessCode;

describe('accessCodeStatus', () => {
  const now = new Date('2026-11-10T12:00:00');

  it('is active from the start date through the end date, both included', () => {
    expect(accessCodeStatus(code('2026-11-10'), now)).toBe('active');
    expect(accessCodeStatus(code('2026-01-01', '2026-11-10'), now)).toBe('active');
  });

  it('is scheduled before the start date and expired after the end date', () => {
    expect(accessCodeStatus(code('2026-11-11'), now)).toBe('scheduled');
    expect(accessCodeStatus(code('2026-01-01', '2026-11-09'), now)).toBe('expired');
  });
});
