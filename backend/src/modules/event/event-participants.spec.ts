import { EventRegistrationStatus } from './enums/event-registration-status.enum';
import {
  buildEventParticipants,
  participantInitials,
  ParticipantRsvp,
  PARTICIPANTS_PREVIEW_SIZE,
} from './event-participants';

const rsvp = (
  id: string,
  createdOn: string,
  user: { firstName?: string; lastName?: string; name?: string },
  going = true,
  status: EventRegistrationStatus | null = EventRegistrationStatus.APPROVED,
): ParticipantRsvp => ({
  id,
  createdOn: new Date(createdOn),
  going,
  status,
  user,
});

describe('participantInitials', () => {
  it('takes the first letter of the first and last name', () => {
    expect(participantInitials({ firstName: 'Ana', lastName: 'Popescu' })).toBe(
      'AP',
    );
  });

  it('keeps Romanian diacritics and upper-cases them', () => {
    expect(
      participantInitials({ firstName: 'ștefan', lastName: 'țurcanu' }),
    ).toBe('ȘȚ');
    expect(
      participantInitials({ firstName: 'Ălina', lastName: 'Îonescu' }),
    ).toBe('ĂÎ');
    expect(participantInitials({ firstName: 'âna', lastName: 'Bălan' })).toBe(
      'ÂB',
    );
  });

  it('joins decomposed letters (S + comma below) into one', () => {
    expect(
      participantInitials({ firstName: 'Ștefan', lastName: 'Țepes' }),
    ).toBe('ȘȚ');
  });

  it('falls back to the full name when first/last are missing', () => {
    expect(participantInitials({ name: 'maria ioana   Șerban' })).toBe('MȘ');
    expect(participantInitials({ name: 'Cristi' })).toBe('C');
    expect(participantInitials({ firstName: '', lastName: '', name: '' })).toBe(
      '?',
    );
    expect(participantInitials(undefined)).toBe('?');
  });

  it('never returns more than two letters', () => {
    expect(
      participantInitials({ firstName: 'Ana Maria', lastName: 'Pop Ionescu' }),
    ).toBe('AP');
  });
});

describe('buildEventParticipants', () => {
  it('counts only approved, going registrations', () => {
    const result = buildEventParticipants([
      rsvp('1', '2026-01-01', { firstName: 'Ana', lastName: 'Pop' }),
      rsvp(
        '2',
        '2026-01-02',
        { firstName: 'Bia', lastName: 'Ene' },
        true,
        EventRegistrationStatus.PENDING,
      ),
      rsvp(
        '3',
        '2026-01-03',
        { firstName: 'Cor', lastName: 'Dan' },
        true,
        EventRegistrationStatus.REJECTED,
      ),
      rsvp('4', '2026-01-04', { firstName: 'Dan', lastName: 'Lup' }, false),
    ]);
    expect(result).toEqual({ total: 1, preview: [{ initials: 'AP' }] });
  });

  it('orders by registration time, then id, whatever the input order', () => {
    const rows = [
      rsvp('b', '2026-01-02', { firstName: 'Bia', lastName: 'B' }),
      rsvp('c', '2026-01-01', { firstName: 'Cor', lastName: 'C' }),
      rsvp('a', '2026-01-02', { firstName: 'Ana', lastName: 'A' }),
    ];
    const expected = ['CC', 'AA', 'BB'];
    expect(buildEventParticipants(rows).preview.map((p) => p.initials)).toEqual(
      expected,
    );
    expect(
      buildEventParticipants([...rows].reverse()).preview.map(
        (p) => p.initials,
      ),
    ).toEqual(expected);
  });

  it('shows at most the preview size, and the full total', () => {
    const rows = Array.from({ length: 18 }, (_, i) =>
      rsvp(`id-${String(i).padStart(2, '0')}`, `2026-01-${i + 1}`, {
        firstName: 'Ana',
        lastName: String.fromCharCode(65 + i),
      }),
    );
    const result = buildEventParticipants(rows);
    expect(result.total).toBe(18);
    expect(result.preview).toHaveLength(PARTICIPANTS_PREVIEW_SIZE);
    expect(result.preview[0]).toEqual({ initials: 'AA' });
    expect(buildEventParticipants(rows, 3).preview).toHaveLength(3);
  });

  it('exposes initials only, never names, ids or emails', () => {
    const result = buildEventParticipants([
      {
        ...rsvp('secret-id', '2026-01-01', {
          firstName: 'Ana',
          lastName: 'Pop',
        }),
        user: {
          firstName: 'Ana',
          lastName: 'Pop',
          name: 'Ana Pop',
          email: 'ana@example.ro',
        } as never,
      },
    ]);
    expect(Object.keys(result.preview[0])).toEqual(['initials']);
    expect(JSON.stringify(result)).not.toMatch(/Ana|Pop|secret|example/);
  });

  it('is empty without registrations', () => {
    expect(buildEventParticipants()).toEqual({ total: 0, preview: [] });
  });
});
