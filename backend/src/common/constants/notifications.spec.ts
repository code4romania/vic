import { NOTIFICATIONS } from './notifications';

const RO = NOTIFICATIONS.ro;
const EN = NOTIFICATIONS.en;

// #712: the hours pushes and emails agree with the number, as Romanian does.
describe('hours notifications', () => {
  const approved = RO.APPROVED_HOURS;
  const rejected = RO.REJECTED_HOURS;

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
  const uploaded = RO.NEW_CONTRACT;

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

// The same notifications in English, for people who chose it.
describe('English notifications', () => {
  it('hours agree with the number', () => {
    expect(EN.APPROVED_HOURS.PUSH.body(1, '17/11/2026')).toBe(
      '1 hour of volunteering on 17/11/2026 was approved',
    );
    expect(EN.REJECTED_HOURS.PUSH.body(20, '18/11/2026')).toBe(
      '20 hours of volunteering on 18/11/2026 were rejected',
    );
    expect(EN.APPROVED_HOURS.PUSH.body(1.5, '18/11/2026')).toBe(
      '1.5 hours of volunteering on 18/11/2026 were approved',
    );
    expect(EN.APPROVED_HOURS.EMAIL.body(1, '17/11/2026')).toBe(
      '1 hour of volunteering on 17/11/2026 was approved. You can find it in the VIC app.',
    );
    expect(EN.APPROVED_HOURS.EMAIL.body(3, '17/11/2026')).toBe(
      '3 hours of volunteering on 17/11/2026 were approved. You can find them in the VIC app.',
    );
    expect(
      EN.REJECTED_HOURS.EMAIL.body(2, '17/11/2026', 'did not happen'),
    ).toBe(
      '2 hours of volunteering on 17/11/2026 were rejected. Reason: did not happen',
    );
  });

  it('an uploaded contract and a certificate have their own text', () => {
    expect(EN.NEW_CONTRACT.PUSH.body('QA NGO')).toBe(
      'QA NGO uploaded your volunteering contract. You can find it in the app, under Documents.',
    );
    expect(EN.NEW_CONTRACT.PUSH.body('QA NGO', true)).toBe(
      'QA NGO uploaded a volunteering certificate for you. You can find it in the app, under Documents.',
    );
  });

  // Every text of both languages, called with sample arguments: the English ones have no Romanian
  // letters, and no text comes out empty in one language only.
  it('every notification exists in both languages, and the English ones have no Romanian letters', () => {
    const sample = (texts: typeof RO): string[] =>
      Object.values(texts).flatMap((notification) =>
        Object.values(notification).flatMap((channel) =>
          Object.values(channel as Record<string, unknown>).map((text) =>
            typeof text === 'function'
              ? (text as (...args: unknown[]) => string)(2, 'x', 'y')
              : (text as string),
          ),
        ),
      );
    const ro = sample(RO);
    const en = sample(EN);

    expect(en).toHaveLength(ro.length);
    en.forEach((text, index) => {
      expect(text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
      expect(text === '').toBe(ro[index] === '');
    });
  });
});
