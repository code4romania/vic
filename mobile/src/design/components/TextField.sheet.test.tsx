import React from 'react';
import { TextInput } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { TextField } from './TextField';

// Maria, 27 Nov 2026: in the login sheet, typing fast on Android put the cursor one letter back.
// In a sheet the field is uncontrolled: it keeps what is typed and never gets an older text back.
const SheetInput = React.forwardRef<TextInput, any>((props, ref) => (
  <TextInput ref={ref} {...props} />
));

describe('TextField in a sheet', () => {
  it('keeps what is typed instead of a controlled value', async () => {
    const onChangeText = jest.fn();
    const { rerender } = await render(
      <TextField
        label="E-mail"
        InputComponent={SheetInput}
        value=""
        onChangeText={onChangeText}
        testID="email"
      />,
    );
    const input = screen.getByTestId('email');
    expect(input.props.value).toBeUndefined();
    await fireEvent.changeText(input, 'maria');
    expect(onChangeText).toHaveBeenCalledWith('maria');
    // the parent echoes the text back: the field is left alone (same input, no remount)
    await rerender(
      <TextField
        label="E-mail"
        InputComponent={SheetInput}
        value="maria"
        onChangeText={onChangeText}
        testID="email"
      />,
    );
    expect(screen.getByTestId('email')).toBe(input);
    expect(screen.getByTestId('email').props.defaultValue).toBe('');
  });

  it('ignores a late echo of an older text while typing fast (no remount, no lost focus)', async () => {
    const field = (value: string) => (
      <TextField label="E-mail" InputComponent={SheetInput} value={value} testID="email" />
    );
    const { rerender } = await render(field(''));
    const input = screen.getByTestId('email');
    await fireEvent.changeText(input, 'ma');
    await fireEvent.changeText(input, 'mar');
    await fireEvent.changeText(input, 'mari');
    // the parent renders "ma" only after "mari" was typed: an echo, not a reset
    await rerender(field('ma'));
    await rerender(field('mari'));
    expect(screen.getByTestId('email')).toBe(input);
  });

  it('starts over with a text set from outside (a reset)', async () => {
    const { rerender } = await render(
      <TextField label="Caută" InputComponent={SheetInput} value="cruce" testID="search" />,
    );
    await rerender(
      <TextField label="Caută" InputComponent={SheetInput} value="" testID="search" />,
    );
    expect(screen.getByTestId('search').props.defaultValue).toBe('');
  });

  it('stays controlled outside a sheet', async () => {
    await render(<TextField label="Nume" value="Ana" testID="name" />);
    expect(screen.getByTestId('name').props.value).toBe('Ana');
  });
});
