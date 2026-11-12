import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Avatar, Badge, initials, SegmentedControl, UnderlineTabs, VButton } from '.';
import { colors, fonts } from '../../common/theme/tokens';

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
  it('marks the active tab with a bold navy label', async () => {
    const tabs = [
      { key: 'open', label: 'Deschise' },
      { key: 'going', label: 'Particip' },
    ];
    await render(<UnderlineTabs testID="tabs" value="open" onChange={jest.fn()} tabs={tabs} />);
    expect(screen.getByTestId('tabs-open').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByText('Deschise')).toHaveStyle({
      color: colors.navy,
      fontFamily: fonts.bold,
    });
    expect(screen.getByText('Particip')).toHaveStyle({
      color: colors.muted,
      fontFamily: fonts.medium,
    });
  });

  it('sizes and positions the underline from the active tab layout', async () => {
    const onChange = jest.fn();
    const tabs = [
      { key: 'open', label: 'Deschise' },
      { key: 'going', label: 'Particip' },
    ];
    await render(<UnderlineTabs testID="tabs" value="open" onChange={onChange} tabs={tabs} />);
    expect(screen.queryByTestId('tabs-indicator')).toBeNull();

    await fireEvent(screen.getByTestId('tabs-open'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 120, height: 48 } },
    });
    await fireEvent(screen.getByTestId('tabs-going'), 'layout', {
      nativeEvent: { layout: { x: 120, y: 0, width: 120, height: 48 } },
    });
    expect(StyleSheet.flatten(screen.getByTestId('tabs-indicator').props.style)).toMatchObject({
      width: 120,
      transform: [{ translateX: 0 }],
    });

    await screen.rerender(
      <UnderlineTabs testID="tabs" value="going" onChange={onChange} tabs={tabs} />,
    );
    expect(StyleSheet.flatten(screen.getByTestId('tabs-indicator').props.style)).toMatchObject({
      width: 120,
      transform: [{ translateX: 120 }],
    });
  });

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
