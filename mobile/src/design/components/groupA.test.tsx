import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { Button, StatusChip, statusKind, Stepper, TextField } from './groupA';
import { palette, status } from '../tokens';

describe('Button', () => {
  it('keeps the label for screen readers while loading, hides it visually and does not fire', async () => {
    const onPress = jest.fn();
    await render(<Button label="Trimite" onPress={onPress} loading testID="send" />);
    const button = screen.getByRole('button', { name: 'Trimite' });
    expect(button.props.accessibilityState).toEqual({ disabled: true, busy: true });
    expect(screen.getByTestId('button-spinner')).toBeTruthy();
    // the label stays laid out (same width) but only the spinner is shown
    expect(screen.queryByText('Trimite')).toBeNull();
    expect(screen.getByText('Trimite', { includeHiddenElements: true })).toBeTruthy();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not fire when disabled and is marked disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Salvează" onPress={onPress} disabled testID="save" />);
    await fireEvent.press(screen.getByTestId('save'));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByTestId('save').props.accessibilityState).toEqual({
      disabled: true,
      busy: false,
    });
    expect(screen.getByTestId('save')).toHaveStyle({ opacity: 0.45 });
  });

  it('fires and colors the label by variant', async () => {
    const onPress = jest.fn();
    await render(
      <>
        <Button label="Adaugă ore" onPress={onPress} testID="primary" />
        <Button label="Șterge" variant="destructive" onPress={onPress} />
        <Button label="Secundar" variant="secondary" onPress={onPress} />
      </>,
    );
    await fireEvent.press(screen.getByTestId('primary'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Adaugă ore')).toHaveStyle({ color: palette.navy });
    expect(screen.getByText('Șterge')).toHaveStyle({ color: palette.red });
    expect(screen.getByText('Secundar')).toHaveStyle({ color: palette.white });
  });
});

describe('StatusChip', () => {
  it.each([
    ['approved', 'ok'],
    ['pending', 'wait'],
    ['rejected', 'no'],
    ['expired', 'exp'],
    ['expiresSoon', 'soon'],
    ['something-else', 'plain'],
    [undefined, 'plain'],
  ])('maps %s to %s', (api, kind) => {
    expect(statusKind(api)).toBe(kind);
  });

  it('draws the pending texture and uses the status colors', async () => {
    await render(
      <>
        <StatusChip label="În așteptare" kind="wait" testID="wait" />
        <StatusChip label="Aprobat" kind="ok" testID="ok" />
      </>,
    );
    expect(screen.getByTestId('status-chip-stripes')).toBeTruthy();
    expect(screen.getByTestId('wait')).toHaveStyle({
      backgroundColor: status.wait.bg,
      borderColor: palette.navy,
    });
    expect(screen.getByText('Aprobat')).toHaveStyle({ color: status.ok.fg });
    expect(screen.getByTestId('ok')).toHaveStyle({ backgroundColor: status.ok.bg });
  });
});

describe('Stepper', () => {
  const Harness = ({ start, min, max }: { start: number; min?: number; max?: number }) => {
    const [value, setValue] = React.useState(start);
    return (
      <Stepper
        label="Număr de ore"
        value={value}
        onChange={setValue}
        min={min}
        max={max}
        formatValue={(v) => `${v}h`}
        testID="hours"
      />
    );
  };

  it('increments and decrements with a selection haptic', async () => {
    (Haptics.selectionAsync as jest.Mock).mockClear();
    await render(<Harness start={4} min={1} max={24} />);
    expect(screen.getByTestId('hours-value').props.children).toBe('4h');
    await fireEvent.press(screen.getByTestId('hours-plus'));
    expect(screen.getByTestId('hours-value').props.children).toBe('5h');
    await fireEvent.press(screen.getByTestId('hours-minus'));
    await fireEvent.press(screen.getByTestId('hours-minus'));
    expect(screen.getByTestId('hours-value').props.children).toBe('3h');
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(3);
  });

  it('stops at the bounds and disables the button there', async () => {
    const onChange = jest.fn();
    await render(
      <Stepper label="Ore" value={24} onChange={onChange} min={1} max={24} testID="top" />,
    );
    await fireEvent.press(screen.getByTestId('top-plus'));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('top-plus').props.accessibilityState).toEqual({ disabled: true });

    await render(
      <Stepper label="Ore" value={1} onChange={onChange} min={1} max={24} testID="low" />,
    );
    await fireEvent.press(screen.getByTestId('low-minus'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('is one adjustable element with a value and increment / decrement actions', async () => {
    const onChange = jest.fn();
    await render(
      <Stepper
        label="Număr de ore"
        value={4}
        onChange={onChange}
        min={1}
        max={24}
        step={1}
        accessibilityValueText={(v) => `${v} ore`}
        testID="a11y"
      />,
    );
    const bar = screen.getByTestId('a11y');
    expect(bar.props.accessibilityRole).toBe('adjustable');
    expect(bar.props.accessibilityValue).toEqual({ min: 1, max: 24, now: 4, text: '4 ore' });
    await fireEvent(bar, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onChange).toHaveBeenLastCalledWith(5);
    await fireEvent(bar, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onChange).toHaveBeenLastCalledWith(3);
  });
});

describe('TextField', () => {
  it('shows the label above with a red asterisk and the error message with an error haptic', async () => {
    (Haptics.notificationAsync as jest.Mock).mockClear();
    await render(<TextField label="Email" required value="" testID="email" />);
    expect(screen.getByText('Email *')).toBeTruthy();
    expect(screen.getByText(' *')).toHaveStyle({ color: palette.red });
    expect(screen.queryByRole('alert')).toBeNull();

    await screen.rerender(
      <TextField label="Email" required value="" error="Emailul nu este valid" testID="email" />,
    );
    expect(screen.getByText('Emailul nu este valid')).toHaveStyle({ color: palette.red });
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
  });

  it('forwards TextInput props and shows the helper only without an error', async () => {
    const onChangeText = jest.fn();
    await render(
      <TextField
        label="Telefon"
        optional
        helper="Îl folosește organizația"
        onChangeText={onChangeText}
        testID="phone"
      />,
    );
    expect(screen.getByText('Telefon opțional')).toBeTruthy();
    expect(screen.getByText('Îl folosește organizația')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('phone'), '0722');
    expect(onChangeText).toHaveBeenCalledWith('0722');
    expect(screen.getByLabelText('Telefon')).toBeTruthy();
  });
});
