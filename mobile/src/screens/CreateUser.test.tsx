import React from 'react';
import { Keyboard } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';
import i18n from '../common/config/i18n';
import CreateUser from './CreateUser';

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('../services/user/user.service', () => ({
  useCreateUserProfileMutation: () => ({ mutate: jest.fn(), isLoading: false }),
}));
jest.mock('../services/location/location.api', () => ({
  getCounties: jest.fn(async () => [{ id: 1, name: 'Alba' }]),
  getCities: jest.fn(async () => [{ id: 1, name: 'Alba Iulia' }]),
}));

it('keeps untouched birthday and consent errors hidden until Continue, then revalidates changes', async () => {
  await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 20, right: 0, bottom: 24, left: 0 },
      }}
    >
      <NavigationContainer>
        <CreateUser navigation={{ goBack: jest.fn() }} />
      </NavigationContainer>
    </SafeAreaProvider>,
  );
  const birthdayError = i18n.t('register:create_user.form.birthday.required');
  const termsError = i18n.t('register:create_account.form.terms.required');
  const expectUntouched = () => {
    expect(screen.queryByText(birthdayError)).toBeNull();
    expect(screen.queryByText(termsError)).toBeNull();
  };
  expectUntouched();
  // Android can hide the IME while the input is still focused.
  await fireEvent(screen.getByTestId('field-phone'), 'focus');
  await fireEvent.changeText(screen.getByTestId('field-phone'), '0799111333');
  Keyboard.dismiss();
  await fireEvent(screen.getByTestId('field-phone'), 'blur');
  const scroll = screen.container.queryAll((node) => node.type.includes('ScrollView'));
  expect(scroll.some((node) => node.props.keyboardShouldPersistTaps === 'handled')).toBe(true);
  await fireEvent.press(screen.getByTestId('select-countyId'));
  expect(screen.getByTestId('select-countyId').props.accessibilityState.expanded).toBe(true);
  await fireEvent.press(screen.getByTestId('select-countyId-option-1'));
  expectUntouched();
  await fireEvent.press(screen.getByTestId('select-cityId'));
  await fireEvent.press(screen.getByTestId('select-cityId-option-1'));
  await fireEvent.press(screen.getByTestId('select-sex'));
  expectUntouched();

  await fireEvent.press(screen.getByTestId('page-action'));
  expect(await screen.findByText(birthdayError)).toBeTruthy();
  expect(await screen.findByText(termsError)).toBeTruthy();
  await fireEvent.press(screen.getByTestId('create-user-terms'));
  expect(screen.queryByText(termsError)).toBeNull();
  expect(screen.getByText(birthdayError)).toBeTruthy();
});
