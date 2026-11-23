import { NOTIFICATIONS } from './notifications';

// #712: the hours pushes and emails agree with the number, as Romanian does.
describe('hours notifications', () => {
  const approved = NOTIFICATIONS.APPROVED_HOURS;
  const rejected = NOTIFICATIONS.REJECTED_HOURS;

  it('one hour is singular', () => {
    expect(rejected.PUSH.body(1, '17/11/2026')).toBe(
      '1 oră de voluntariat din 17/11/2026 a fost respinsă',
    );
    expect(approved.PUSH.body(1, '17/11/2026')).toBe(
      '1 oră de voluntariat din 17/11/2026 a fost aprobată',
    );
    expect(approved.EMAIL.body(1, '17/11/2026')).toBe(
      '1 oră de voluntariat din 17/11/2026 a fost aprobată. O găsești în aplicația VIC.',
    );
    expect(rejected.EMAIL.body(1, '17/11/2026', 'nu a avut loc')).toBe(
      '1 oră de voluntariat din 17/11/2026 a fost respinsă. Motiv: nu a avut loc',
    );
  });

  it('2 to 19 hours are plural without "de"', () => {
    expect(approved.PUSH.body(2, '18/11/2026')).toBe(
      '2 ore de voluntariat din 18/11/2026 au fost aprobate',
    );
    expect(approved.EMAIL.body(19, '18/11/2026')).toBe(
      '19 ore de voluntariat din 18/11/2026 au fost aprobate. Le găsești în aplicația VIC.',
    );
  });

  it('from 20 on "de ore", except when the last two digits are 01-19', () => {
    expect(rejected.PUSH.body(20, '18/11/2026')).toBe(
      '20 de ore de voluntariat din 18/11/2026 au fost respinse',
    );
    expect(approved.PUSH.body(100, '18/11/2026')).toContain('100 de ore');
    expect(approved.PUSH.body(101, '18/11/2026')).toContain('101 ore');
    expect(approved.PUSH.body(119, '18/11/2026')).toContain('119 ore');
    expect(approved.PUSH.body(120, '18/11/2026')).toContain('120 de ore');
  });

  it('a fraction of an hour is plural, with a decimal comma', () => {
    expect(approved.PUSH.body(1.5, '18/11/2026')).toBe(
      '1,5 ore de voluntariat din 18/11/2026 au fost aprobate',
    );
  });
});

// #486: VIC no longer generates contracts; the NGO uploads them (or a certificate).
describe('uploaded document notifications', () => {
  const uploaded = NOTIFICATIONS.NEW_CONTRACT;

  it('a contract is uploaded, not generated', () => {
    expect(uploaded.PUSH.body('QA ONG')).toBe(
      'QA ONG ți-a încărcat contractul de voluntariat. Îl găsești în aplicație, la Documente.',
    );
    expect(uploaded.EMAIL.subject('QA ONG')).toBe(uploaded.PUSH.body('QA ONG'));
  });

  it('a certificate has its own text', () => {
    expect(uploaded.PUSH.body('QA ONG', true)).toBe(
      'QA ONG ți-a încărcat o adeverință de voluntariat. O găsești în aplicație, la Documente.',
    );
  });
});
