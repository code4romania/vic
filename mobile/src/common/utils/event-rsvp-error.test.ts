import i18n from '../config/i18n';
import {
  findEventOrganization,
  isProfileIncompleteError,
  rsvpErrorMessage,
} from './event-rsvp-error';

const apiError = (code_error: string) => ({ response: { status: 400, data: { code_error } } });

describe('"Particip" errors (audit #10)', () => {
  it('only EVENT_RSVP_005 means "complete the volunteer profile"', () => {
    expect(isProfileIncompleteError(apiError('EVENT_RSVP_005'))).toBe(true);
    for (const code of ['EVENT_RSVP_002', 'EVENT_RSVP_003', 'EVENT_RSVP_007', 'EVENT_RSVP_008']) {
      expect(isProfileIncompleteError(apiError(code))).toBe(false);
    }
    expect(isProfileIncompleteError(new Error('Network Error'))).toBe(false);
  });

  it('tells the real reason', () => {
    expect(rsvpErrorMessage(apiError('EVENT_RSVP_007'))).toBe(
      i18n.t('event:errors.EVENT_RSVP_007'),
    );
    expect(rsvpErrorMessage(apiError('EVENT_RSVP_008'))).toBe(
      i18n.t('event:errors.EVENT_RSVP_008'),
    );
    expect(rsvpErrorMessage(new Error('Network Error'))).toBe(i18n.t('general:error.network'));
  });

  it('finds the event organization by id, by name only without an id', () => {
    const organizations = [
      { id: 'o1', name: 'Asociația A' },
      { id: 'o2', name: 'Asociația A' },
    ];
    expect(
      findEventOrganization(organizations, { organizationId: 'o2', organizationName: 'X' }),
    ).toEqual(organizations[1]);
    expect(findEventOrganization(organizations, { organizationName: 'Asociația A' })).toEqual(
      organizations[0],
    );
    expect(findEventOrganization(organizations, { organizationId: 'o9' })).toBeUndefined();
  });
});
