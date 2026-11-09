import React from 'react';
import { Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import '../common/config/i18n';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import PageLayout from '../layouts/PageLayout';
import { renderPhoneNumberPrefix } from './InputPrefixes';
import { ButtonType } from '../common/enums/button-type.enum';

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));

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
