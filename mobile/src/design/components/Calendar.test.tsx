import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Calendar, dayLabel, monthWeeks, yearPageStart } from './Calendar';

describe('Calendar', () => {
  it('names days in Romanian, Monday first, always six weeks', () => {
    // 1 Nov 2026 is a Sunday: six empty cells, then the 1st in the last column
    const weeks = monthWeeks(2026, 10);
    expect(weeks).toHaveLength(6);
    expect(weeks[0].slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(weeks[0][6]?.getDate()).toBe(1);
    expect(dayLabel(new Date(2026, 10, 12))).toBe('Joi, 12 noiembrie 2026');
  });

  it('marks the selected day, disables days out of range, selects in range', async () => {
    const onSelect = jest.fn();
    await render(
      <Calendar
        value={new Date(2026, 10, 12)}
        min={new Date(2026, 10, 3)}
        max={new Date(2026, 10, 20)}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText('Noiembrie 2026')).toBeTruthy();
    expect(screen.getByLabelText(/^Joi, 12 noiembrie 2026/)).toBeSelected();
    expect(screen.getByLabelText('Luni, 2 noiembrie 2026')).toBeDisabled();
    expect(screen.getByLabelText('Sâmbătă, 21 noiembrie 2026')).toBeDisabled();
    // the bounds hold the month: no way to the previous or next month
    expect(screen.getByLabelText('Luna anterioară')).toBeDisabled();
    expect(screen.getByLabelText('Luna următoare')).toBeDisabled();

    await fireEvent.press(screen.getByLabelText('Luni, 2 noiembrie 2026'));
    expect(onSelect).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Vineri, 20 noiembrie 2026'));
    expect(onSelect).toHaveBeenCalledWith(new Date(2026, 10, 20));
  });

  it('moves between months with the 44pt buttons', async () => {
    await render(<Calendar initialVisibleDate={new Date(2026, 0, 15)} onSelect={jest.fn()} />);

    await fireEvent.press(screen.getByLabelText('Luna anterioară'));
    expect(screen.getByText('Decembrie 2025')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Luna următoare'));
    await fireEvent.press(screen.getByLabelText('Luna următoare'));
    expect(screen.getByText('Februarie 2026')).toBeTruthy();
  });
});

describe('calendar year bounds (#584)', () => {
  it.each([2026, 1999])(
    'greys out years beyond the max year %s',
    async (maxYear) => {
      await render(
        <Calendar
          min={new Date(1920, 0, 1)}
          max={new Date(maxYear, 10, 11)}
          initialVisibleDate={new Date(maxYear - 2, 0, 1)}
          startView="year"
          onSelect={jest.fn()}
        />,
      );

      const page = yearPageStart(maxYear - 2);
      const pageTitle = `${page} – ${page + 11}`;
      expect(screen.getByText(pageTitle)).toBeTruthy();
      expect(screen.getByLabelText(`${maxYear}`)).not.toBeDisabled();
      for (let year = maxYear + 1; year <= page + 11; year++) {
        expect(screen.getByLabelText(`${year}`)).toBeDisabled();
      }

      if (maxYear + 1 <= page + 11) {
        await fireEvent.press(screen.getByLabelText(`${maxYear + 1}`));
        expect(screen.getByText(pageTitle)).toBeTruthy();
      }
      await fireEvent.press(screen.getByLabelText(`${maxYear}`));
      expect(screen.queryByText(pageTitle)).toBeNull();
      // the month grid of the max year: up to November, December greyed out
      expect(screen.getByText('Ian')).toBeTruthy();
      expect(screen.getByLabelText(`Decembrie ${maxYear}`)).toBeDisabled();

      await fireEvent.press(screen.getByLabelText(`Noiembrie ${maxYear}`));
      expect(screen.getByText(`Noiembrie ${maxYear}`)).toBeTruthy();
      expect(screen.getByLabelText('Luna următoare')).toBeDisabled();
    },
    15000,
  );
});
