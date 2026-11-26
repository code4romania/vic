import { announceCopy, cutoverDate } from './announce-copy';

describe('announce copy', () => {
  it('spells the cutover day and the night before it in both languages', () => {
    expect(cutoverDate('2026-12-01')).toEqual({
      ro: 'marți, 1 decembrie',
      en: 'Tuesday 1 December',
      dayRo: '1 decembrie',
      dayEn: '1 December',
      nightRo: 'noaptea de 30 noiembrie spre 1 decembrie',
      nightEn: 'the night of 30 November to 1 December',
    });
  });

  it('rejects a date that is not a real day', () => {
    expect(() => cutoverDate('2026-02-30')).toThrow('--date');
    expect(() => cutoverDate('1 decembrie')).toThrow('--date');
  });

  it('gives the window and does not ask people to update before the new app is in the stores', () => {
    const date = cutoverDate('2026-12-01');
    const announce = announceCopy('announce', date);
    expect(announce.email.subject).toBe(
      'Marți, 1 decembrie, VIC are un nou sistem de autentificare',
    );
    expect(announce.email.subtitle).toContain(
      'În noaptea de 30 noiembrie spre 1 decembrie, între 00:00 și 02:00',
    );
    expect(announce.push.body).toBe(
      'Din 1 decembrie intri cu adresa de email, fără parolă. Detalii pe email.',
    );

    const reminder = announceCopy('reminder', date);
    expect(reminder.email.subject).toBe(
      'Diseară: noul sistem de autentificare VIC',
    );
    expect(reminder.push.body).toContain('între 00:00 și 02:00');

    for (const copy of [announce, reminder]) {
      expect(copy.email.subtitle).not.toContain('Actualizează aplicația');
      expect(copy.email.subtitle).toContain(
        'versiunea veche mai merge 30 de zile',
      );
    }
  });
});
