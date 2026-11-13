import React from 'react';
import { Dimensions, Keyboard, StyleSheet, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import '../common/config/i18n';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import PageLayout from '../layouts/PageLayout';
import { renderPhoneNumberPrefix } from './InputPrefixes';
import { ButtonType } from '../common/enums/button-type.enum';

jest.mock('@gorhom/bottom-sheet', () => {
  const mock = require('@gorhom/bottom-sheet/mock');
  const React = require('react');
  const { View } = require('react-native');
  return {
    ...mock,
    BottomSheetView: View,
    BottomSheetModal: class extends mock.BottomSheetModal {
      render() {
        return React.createElement(View, { ...this.props, testID: 'mock-sheet-modal' });
      }
    },
  };
});

let mockValues: Record<string, unknown> = {};

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};
const withSafeArea = (node: React.ReactElement) => (
  <SafeAreaProvider initialMetrics={metrics}>{node}</SafeAreaProvider>
);

const Form = ({ error, disabled }: { error?: string; disabled?: boolean }) => {
  const { control, watch } = useForm({ defaultValues: { phone: '744555010', county: 2 } });
  mockValues = watch();
  return (
    <>
      <FormInput
        control={control as any}
        name="phone"
        label="Telefon"
        placeholder="Număr"
        error={error ? { message: error } : undefined}
        helper="Îl folosește organizația"
        accessoryLeft={renderPhoneNumberPrefix}
        disabled={disabled}
        required
      />
      <FormSelect
        control={control as any}
        name="county"
        label="Județ"
        placeholder="Alege"
        error={undefined}
        options={[
          { key: 1, label: 'Alba' },
          { key: 2, label: 'București' },
        ]}
      />
    </>
  );
};

describe('VIC 2.0 form fields', () => {
  it('a text field shows the label, the +40 prefix, the helper and edits the form value', async () => {
    await render(withSafeArea(<Form />));
    expect(screen.getByText('Telefon *')).toBeTruthy();
    expect(screen.getByText('+40')).toBeTruthy();
    expect(screen.getByText('Îl folosește organizația')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('field-phone'), '722000000');
    expect(mockValues.phone).toBe('722000000');
  });

  it('an error replaces the helper; a disabled field cannot be edited', async () => {
    await render(withSafeArea(<Form error="Telefonul nu este valid" disabled />));
    expect(screen.getByText('Telefonul nu este valid')).toBeTruthy();
    expect(screen.queryByText('Îl folosește organizația')).toBeNull();
    expect(screen.getByTestId('field-phone').props.editable).toBe(false);
  });

  it('blurs the form input when opening a picker', async () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss');
    await render(withSafeArea(<Form />));
    await fireEvent.press(screen.getByTestId('select-county'));
    expect(dismiss).toHaveBeenCalledTimes(1);
    dismiss.mockRestore();
  });

  it('blurs a searchable picker before selecting and dismissing its sheet', async () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss');
    const Picker = () => {
      const { control, watch } = useForm({ defaultValues: { county: 1 } });
      mockValues = watch();
      return (
        <FormSelect
          control={control as any}
          name="county"
          label="Județ"
          placeholder="Alege"
          error={undefined}
          options={Array.from({ length: 13 }, (_, index) => ({
            key: index + 1,
            label: `Județ ${index + 1}`,
          }))}
        />
      );
    };
    await render(withSafeArea(<Picker />));
    await fireEvent.press(screen.getByTestId('select-county'));
    await fireEvent.changeText(screen.getByTestId('select-county-search'), '13');
    dismiss.mockClear();
    await fireEvent.press(screen.getByTestId('select-county-option-13'));
    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(mockValues.county).toBe(13);
    dismiss.mockRestore();
  });

  it.each([
    [7, 0],
    [8, 24],
    [9, 48],
    [12, 34],
    [13, 0],
    [13, 24],
    [13, 34],
    [13, 48],
  ])(
    'pads a %s-option picker with bottom inset %s inside its scroll content',
    async (count, bottom) => {
      const present = jest.spyOn(BottomSheetModal.prototype, 'present');
      const Picker = () => {
        const { control } = useForm({ defaultValues: { event: 1 } });
        return (
          <FormSelect
            control={control as any}
            name="event"
            label="Eveniment"
            placeholder="Alege"
            error={undefined}
            options={Array.from({ length: count }, (_, index) => ({
              key: index + 1,
              label: `Eveniment ${index + 1}`,
            }))}
          />
        );
      };
      await render(
        <SafeAreaProvider
          initialMetrics={{ ...metrics, insets: { ...metrics.insets, top: 24, bottom } }}
        >
          <Picker />
        </SafeAreaProvider>,
      );
      await fireEvent.press(screen.getByTestId('select-event'));
      expect(present).toHaveBeenCalledTimes(1);
      present.mockRestore();
      const scrollables = screen.container.queryAll(
        (node) => node.type.includes('ScrollView') && !!node.props.contentContainerStyle,
      );
      expect(scrollables.length).toBeGreaterThan(0);
      for (const scroll of scrollables) {
        expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
        expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom).toBe(
          count > 12 ? 24 + bottom : Math.max(bottom, 14) + 10,
        );
      }
      const modal = screen.getByTestId('mock-sheet-modal');
      if (count <= 12) {
        expect(modal.props.enableDynamicSizing).toBe(true);
        expect(modal.props.maxDynamicContentSize).toBe(Dimensions.get('window').height - 24 - 28);
        // Inspect the modal's direct React child: a nested scrollable in BottomSheetView fails this.
        expect(modal.props.children.type).toBe(BottomSheetScrollView);
        expect(scrollables).toHaveLength(1);
        expect(StyleSheet.flatten(modal.props.children.props.style)?.maxHeight).toBeUndefined();
        const content = within(screen.getByTestId('select-event-sheet'));
        expect(content.getByRole('header', { name: 'Eveniment' })).toBeTruthy();
        for (let index = 1; index <= count; index++) {
          expect(content.getByTestId(`select-event-option-${index}`)).toBeTruthy();
        }
      } else {
        expect(modal.props.enableDynamicSizing).toBe(false);
        expect(screen.getByTestId('select-event-sheet')).toHaveStyle({ paddingBottom: 0 });
        expect(screen.getByTestId('select-event-search')).toBeTruthy();
      }
      await fireEvent.press(screen.getByTestId(`select-event-option-${count}`));
      expect(
        within(screen.getByTestId('select-event')).getByText(`Eveniment ${count}`),
      ).toBeTruthy();
    },
  );

  it('a select shows the chosen option and changes it from the sheet', async () => {
    await render(withSafeArea(<Form />));
    expect(within(screen.getByTestId('select-county')).getByText('București')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('select-county'));
    await fireEvent.press(screen.getByTestId('select-county-option-1'));
    expect(mockValues.county).toBe(1);
  });
});

describe('VIC 2.0 page layout', () => {
  it('has a back button, the title, an edit link and the actions', async () => {
    const onBack = jest.fn();
    const onEdit = jest.fn();
    const onPrimary = jest.fn();
    const onSecondary = jest.fn();
    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <NavigationContainer>
          <PageLayout
            title="Date personale"
            onBackButtonPress={onBack}
            onEditButtonPress={onEdit}
            actionsOptions={{
              primaryActionLabel: 'Șterge contul',
              primaryBtnType: ButtonType.DANGER,
              onPrimaryActionButtonClick: onPrimary,
              helperText: 'Nu se poate anula.',
              secondaryActionLabel: 'Te-ai răzgândit?',
              secondaryActionLink: 'Înapoi',
              onSecondaryActionButtonClick: onSecondary,
            }}
          >
            <Text>conținut</Text>
          </PageLayout>
        </NavigationContainer>
      </SafeAreaProvider>,
    );
    expect(screen.getByText('Date personale')).toBeTruthy();
    expect(screen.getByText('Nu se poate anula.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('page-back'));
    await fireEvent.press(screen.getByTestId('page-edit'));
    await fireEvent.press(screen.getByTestId('page-action'));
    await fireEvent.press(screen.getByTestId('page-secondary'));
    expect(onBack).toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalled();
    expect(onPrimary).toHaveBeenCalled();
    expect(onSecondary).toHaveBeenCalled();
  });
});
