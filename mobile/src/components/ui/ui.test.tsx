import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Avatar, Badge, initials, SegmentedControl, UnderlineTabs, VButton } from '.';
import { colors } from '../../common/theme/tokens';

describe('VButton', () => {
  it('uses yellow with navy text for the primary action', async () => {
    const onPress = jest.fn();
    await render(<VButton label="Trimite" onPress={onPress} testID="send" />);
    fireEvent.press(screen.getByTestId('send'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Trimite')).toHaveStyle({ color: colors.navy });
  });

  it('does not fire while loading or disabled', async () => {
    const onPress = jest.fn();
    await render(
      <>
        <VButton label="A" onPress={onPress} loading testID="loading" />
        <VButton label="B" onPress={onPress} disabled testID="disabled" />
      </>,
    );
    fireEvent.press(screen.getByTestId('loading'));
    fireEvent.press(screen.getByTestId('disabled'));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.queryByText('A')).toBeNull();
  });
});

describe('SegmentedControl', () => {
  it('reports the pressed segment and marks the selected one', async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControl
        testID="seg"
        value="pending"
        onChange={onChange}
        options={[
          { key: 'pending', label: 'În așteptare' },
          { key: 'approved', label: 'Aprobate' },
          { key: 'rejected', label: 'Refuzate' },
        ]}
      />,
    );
    expect(screen.getByTestId('seg-pending').props.accessibilityState).toEqual({ selected: true });
    fireEvent.press(screen.getByText('Aprobate'));
    expect(onChange).toHaveBeenCalledWith('approved');
  });
});

describe('UnderlineTabs', () => {
  it('switches category', async () => {
    const onChange = jest.fn();
    await render(
      <UnderlineTabs
        value="open"
        onChange={onChange}
        tabs={[
          { key: 'open', label: 'Deschise' },
          { key: 'going', label: 'Particip' },
        ]}
      />,
    );
    fireEvent.press(screen.getByText('Particip'));
    expect(onChange).toHaveBeenCalledWith('going');
  });
});

describe('Badge and Avatar', () => {
  it('colors the badge by status', async () => {
    await render(<Badge label="Aprobat" tone="ok" />);
    expect(screen.getByText('Aprobat')).toHaveStyle({ color: colors.status.ok.fg });
  });

  it('falls back to initials', async () => {
    expect(initials('Asociația  Exemplu')).toBe('AE');
    expect(initials('Ana')).toBe('A');
    await render(<Avatar name="Verde Mare" />);
    expect(screen.getByText('VM')).toBeTruthy();
  });
});
