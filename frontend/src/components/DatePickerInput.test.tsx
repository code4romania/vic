import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatePickerInput from './DatePickerInput';
import DateRangePicker from './DateRangePicker';
import { typedDateFormats } from '../common/utils/date-input-formats';
import { DATE_FORMAT } from '../common/constants/patterns';

// #673: a typed date follows the placeholder, day first (zz.ll.aa), never US month-first.
const ymdhm = (date: Date | null | undefined): string | null =>
  date
    ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(
        date.getMinutes(),
      ).padStart(2, '0')}`
    : null;

const Picker = ({ onPick }: { onPick: (date: Date | null) => void }): JSX.Element => {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePickerInput
      id="picker"
      label="Dată de început"
      selected={value}
      onChange={(date: Date | null) => {
        setValue(date);
        onPick(date);
      }}
      dateFormat={DATE_FORMAT.DD_MM_YY_HH_MM}
      showTimeSelect
    />
  );
};

describe('typed dates are read day first (#673)', () => {
  it.each([
    ['01.12.26 10:00', '2026-12-1 10:00'],
    ['01.12.26, 10:00', '2026-12-1 10:00'],
    ['01.12.2026 10:00', '2026-12-1 10:00'],
    ['01.12.2026, 10:00', '2026-12-1 10:00'],
    ['13.01.26 09:30', '2026-1-13 9:30'],
  ])('"%s" is %s', async (typed, expected) => {
    const onPick = vi.fn();
    render(<Picker onPick={onPick} />);

    await userEvent.type(screen.getByLabelText('Dată de început'), typed);

    expect(ymdhm(onPick.mock.calls.at(-1)?.[0])).toBe(expected);
  });

  it('shows the chosen date in the display format', async () => {
    render(<Picker onPick={vi.fn()} />);
    const input = screen.getByLabelText('Dată de început');

    await userEvent.type(input, '01.12.26 10:00');
    await userEvent.tab();

    expect(input).toHaveValue('01.12.2026, 10:00');
  });

  it('the filter range shows dates day first', () => {
    render(
      <DateRangePicker
        id="range"
        label="Perioadă"
        value={[new Date(2026, 11, 1), new Date(2026, 11, 13)]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Perioadă')).toHaveValue('01.12.2026 - 13.12.2026');
  });
});

describe('typedDateFormats', () => {
  it('lists the display format first and the 2-digit-year forms last', () => {
    expect(typedDateFormats('dd.MM.yyyy, HH:mm')).toEqual([
      'dd.MM.yyyy, HH:mm',
      'dd.MM.yyyy HH:mm',
      'dd.MM.yy, HH:mm',
      'dd.MM.yy HH:mm',
    ]);
    expect(typedDateFormats('dd.MM.yyyy')).toEqual(['dd.MM.yyyy', 'dd.MM.yy']);
  });
});
