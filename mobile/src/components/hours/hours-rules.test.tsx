import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import '../../common/config/i18n';
import i18n from '../../common/config/i18n';
import { activityLogSchema, HOURS_MAX } from '../ActivityLogForm';
import HoursStepper from './HoursStepper';
import { InternalErrors } from '../../common/errors/internal-errors.class';

// M12: the backend takes whole hours, 1 to 24 a day; the form says so before sending.
describe('hours rules', () => {
  const valid = (hours: string) =>
    activityLogSchema.isValidSync({ activityTypeId: 't', date: new Date(), hours });

  it('accepts whole hours from 1 to 24 only', () => {
    expect(valid('1')).toBe(true);
    expect(valid('24')).toBe(true);
    expect(valid('0')).toBe(false);
    expect(valid('25')).toBe(false);
    expect(valid('2.5')).toBe(false);
    expect(HOURS_MAX).toBe(24);
  });

  it('the stepper stops at 24', async () => {
    const onChange = jest.fn();
    await render(<HoursStepper label="Ore" value={23} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('hours-stepper-plus'));
    expect(onChange).toHaveBeenLastCalledWith(24);
    onChange.mockClear();
    await render(<HoursStepper label="Ore" value={24} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('hours-stepper-plus'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each(['ACTIVITY_LOG_007', 'ACTIVITY_LOG_008', 'ACTIVITY_LOG_009', 'ACTIVITY_LOG_010'])(
    '%s has a Romanian message',
    (code) => {
      const text = InternalErrors.ACTIVITY_LOG_ERRORS.getError(code as never);
      expect(text).toBe(i18n.t(`activity_log:errors.${code}`));
      expect(text).not.toContain(code);
    },
  );
});
