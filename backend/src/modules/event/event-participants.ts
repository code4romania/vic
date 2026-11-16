import { EventRegistrationStatus } from './enums/event-registration-status.enum';

// How many faces the event screen shows before the „+N” bubble.
export const PARTICIPANTS_PREVIEW_SIZE = 5;

export interface IEventParticipantPreview {
  initials: string;
  // Only set if volunteers' pictures are ever shared with other volunteers; today they are not
  // (the NGO and the person themselves are the only ones who see a profile picture).
  avatarUrl?: string;
}

export interface IEventParticipants {
  total: number;
  preview: IEventParticipantPreview[];
}

export interface ParticipantRsvp {
  id?: string;
  going: boolean;
  status?: EventRegistrationStatus | null;
  createdOn?: Date | string;
  user?: { firstName?: string; lastName?: string; name?: string } | null;
}

// The first letter of a word, as one character even when typed decomposed (S + comma below →
// „Ș”), upper-cased the Romanian way.
const firstLetter = (word?: string | null): string => {
  const letter = Array.from((word ?? '').normalize('NFC').trim())[0] ?? '';
  return letter.toLocaleUpperCase('ro-RO');
};

// „Ștefan Țurcanu” → „ȘȚ”. First and last name when the profile has them, otherwise the first and
// last word of the full name; never more than two letters, „?” when there is nothing to show.
export function participantInitials(user?: {
  firstName?: string;
  lastName?: string;
  name?: string;
}): string {
  const first = firstLetter(user?.firstName);
  const last = firstLetter(user?.lastName);
  if (first || last) return `${first}${last}` || '?';

  const words = (user?.name ?? '').normalize('NFC').trim().split(/\s+/);
  const initials =
    words.length > 1
      ? `${firstLetter(words[0])}${firstLetter(words[words.length - 1])}`
      : firstLetter(words[0]);
  return initials || '?';
}

const time = (date?: Date | string): number =>
  date ? new Date(date).getTime() : 0;

// Who is coming, without saying who: the number of approved registrations and the initials of the
// first ones to register (oldest first, then by id, so the row does not reshuffle between visits).
export function buildEventParticipants(
  rsvps: ParticipantRsvp[] = [],
  size = PARTICIPANTS_PREVIEW_SIZE,
): IEventParticipants {
  const going = rsvps
    .filter(
      (rsvp) => rsvp.going && rsvp.status === EventRegistrationStatus.APPROVED,
    )
    .sort(
      (a, b) =>
        time(a.createdOn) - time(b.createdOn) ||
        (a.id ?? '').localeCompare(b.id ?? ''),
    );

  return {
    total: going.length,
    preview: going
      .slice(0, Math.max(0, size))
      .map((rsvp) => ({ initials: participantInitials(rsvp.user ?? {}) })),
  };
}
