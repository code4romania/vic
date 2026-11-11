import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Calendar, CalendarViewModes } from '@ui-kitten/components';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { datePickerService } from '../utils/birthday';
import theme from './theme.json';
import mapping from './mappings.json';

describe('calendar year bounds (#584)', () => {
  it.each([2026, 1999])(
    'greys out years beyond the max year %s',
    async (maxYear) => {
      await render(
        <ApplicationProvider {...eva} theme={{ ...eva.dark, ...theme }} customMapping={mapping}>
          <Calendar
            dateService={datePickerService('ro')}
            min={new Date(1920, 0, 1)}
            max={new Date(maxYear, 10, 11)}
            initialVisibleDate={new Date(maxYear - 2, 0, 1)}
            startView={CalendarViewModes.YEAR}
          />
        </ApplicationProvider>,
      );

      const pageTitle = `${maxYear - 2} - ${maxYear + 9}`;
      expect(screen.getByText(`${maxYear}`)).toHaveStyle({ color: theme['text-basic-color'] });
      for (let year = maxYear + 1; year <= maxYear + 9; year++) {
        expect(screen.getByText(`${year}`)).toHaveStyle({ color: theme['cool-gray-400'] });
        expect(screen.getByText(`${year}`)).toBeDisabled();
      }

      await fireEvent.press(screen.getByText(`${maxYear + 1}`));
      expect(screen.getByText(pageTitle)).toBeTruthy();
      await fireEvent.press(screen.getByText(`${maxYear}`));
      expect(screen.queryByText(pageTitle)).toBeNull();
      expect(screen.getByText('Ian')).toBeTruthy();
    },
    15000,
  );
});
