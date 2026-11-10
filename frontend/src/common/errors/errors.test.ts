import { InternalErrors } from './internal-errors.class';
import { ORGANIZATION_ERRORS } from './entities/organization.errors';
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
