import { InternalErrors } from './internal-errors.class';
import { ORGANIZATION_ERRORS } from './entities/organization.errors';
import { ACTIVITY_LOG_ERRORS } from './entities/activity-log.errors';
import { EVENT_ERRORS } from './entities/event.errors';
import { t } from '../../test/render';

describe('error messages in Romanian (audit minor)', () => {
  it('ORG_003 (invalid logo) has its own message', () => {
    expect(t('organization:errors.ORG_003')).not.toBe('organization:errors.ORG_003');
    expect(InternalErrors.ORGANIZATION_ERRORS.getError(ORGANIZATION_ERRORS.ORG_003)).toBe(
      t('organization:errors.ORG_003'),
    );
  });

  it('USER_001 on the team page has a message', () => {
    expect(t('team:errors.USER_001')).not.toBe('team:errors.USER_001');
  });
});

describe('error codes from the backend fixes have Romanian messages', () => {
  it.each([
    ['events', 'EVENT_010'],
    ['events', 'EVENT_011'],
    ['events', 'EVENT_RSVP_008'],
    ['organization', 'ORG_012'],
    ['organization', 'ORG_013'],
    ['activity_log', 'ACTIVITY_LOG_007'],
    ['activity_log', 'ACTIVITY_LOG_008'],
    ['activity_log', 'ACTIVITY_LOG_009'],
    ['activity_log', 'ACTIVITY_LOG_010'],
  ])('%s %s', (namespace, code) => {
    expect(t(`${namespace}:errors.${code}`)).not.toBe(`${namespace}:errors.${code}`);
  });

  it('maps the hours and event codes, and the generic codes on any page', () => {
    expect(InternalErrors.ACTIVITY_LOG_ERRORS.getError(ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_008)).toBe(
      t('activity_log:errors.ACTIVITY_LOG_008'),
    );
    expect(InternalErrors.EVENT_ERRORS.getError(EVENT_ERRORS.EVENT_011)).toBe(
      t('events:errors.EVENT_011'),
    );
    for (const code of [
      'INVALID_ORDER_BY',
      'FILE_TOO_LARGE',
      'DUPLICATE_ENTRY',
      'INTERNAL_ERROR',
    ]) {
      const message = InternalErrors.VOLUNTEER_ERRORS.getError(code as never);
      expect(message).toBe(t(`general:error.codes.${code}`));
      expect(message).not.toContain(code);
    }
    expect(InternalErrors.EVENT_ERRORS.getError('ORG_012' as never)).toBe(
      t('organization:errors.ORG_012'),
    );
  });
});
