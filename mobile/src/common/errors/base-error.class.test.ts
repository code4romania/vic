import i18n from '../config/i18n';
import { InternalErrors } from './internal-errors.class';

describe('ErrorClass', () => {
  it('maps ORG_005 on any screen, whatever its own error group', () => {
    expect(InternalErrors.ACCESS_CODE_ERRORS.getError('ORG_005' as never)).toBe(
      i18n.t('general:error.ORG_005'),
    );
    expect(InternalErrors.EVENT_ERRORS.getError('ORG_005' as never)).toBe(
      i18n.t('general:error.ORG_005'),
    );
  });

  it('still shows the generic text with the code for anything unknown', () => {
    expect(InternalErrors.EVENT_ERRORS.getError('XYZ_999' as never)).toBe(
      i18n.t('general:error.generic_error', { code: 'XYZ_999' }),
    );
  });
});
