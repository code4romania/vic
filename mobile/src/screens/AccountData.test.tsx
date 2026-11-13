import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import '../common/config/i18n';
import { Sex } from '../common/enums/sex.enum';
import useStore from '../store/store';
import { updateUserProfile } from '../services/user/user.api';
import AccountData from './AccountData';

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('../services/user/user.api', () => ({ updateUserProfile: jest.fn() }));
jest.mock('../services/location/location.api', () => ({
  getCounties: jest.fn(async () => [{ id: 1, name: 'București' }]),
  getCities: jest.fn(async () => [{ id: 1, name: 'București' }]),
}));

const profile = {
  firstName: 'Ana',
  lastName: 'Popescu',
  email: 'ana@example.com',
  birthday: new Date('1995-05-10T00:00:00.000Z'),
  sex: Sex.FEMALE,
  location: { id: 1, name: 'București', county: { id: 1, name: 'București' } },
  myOrganizations: [],
  activeOrganization: null,
};

const setup = async (phone?: string) => {
  useStore.setState({ userProfile: { ...profile, phone } as any });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const listeners = new Set<(event: any) => void>();
  const navigation = {
    addListener: jest.fn((_name, listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  };
  await render(
    <QueryClientProvider client={client}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <NavigationContainer>
          <AccountData navigation={navigation} />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>,
  );
  const leave = async () => {
    const event = { preventDefault: jest.fn(), data: { action: { type: 'GO_BACK' } } };
    await act(() => listeners.forEach((listener) => listener(event)));
    return event.preventDefault;
  };
  return { leave, client };
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  (updateUserProfile as jest.Mock).mockImplementation(async (updates) => ({
    ...profile,
    ...updates,
  }));
});

afterEach(() => jest.restoreAllMocks());

describe('Date personale discard guard', () => {
  it.each([
    { phone: undefined, clearPhone: false },
    { phone: '+40722000000', clearPhone: false },
    { phone: '+40722000000', clearPhone: true },
  ])(
    'is clean after saving with $phone (clear phone: $clearPhone)',
    async ({ phone, clearPhone }) => {
      const { leave, client } = await setup(phone);
      expect(await leave()).not.toHaveBeenCalled();

      await fireEvent.changeText(screen.getByTestId('field-firstName'), 'Maria');
      if (clearPhone) {
        await fireEvent.changeText(screen.getByTestId('field-phone'), '');
      }
      expect(await leave()).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledTimes(1);
      jest.mocked(Alert.alert).mockClear();

      await fireEvent.press(screen.getByTestId('page-action'));
      await waitFor(() =>
        expect(Toast.show).toHaveBeenCalledWith({
          text1: 'Datele au fost modificate!',
          type: 'success',
        }),
      );
      expect(useStore.getState().userProfile?.firstName).toBe('Maria');
      expect(await leave()).not.toHaveBeenCalled();
      expect(Alert.alert).not.toHaveBeenCalled();

      await fireEvent.changeText(screen.getByTestId('field-lastName'), 'Ionescu');
      expect(await leave()).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledTimes(1);
      client.clear();
    },
  );
});

it('normalizes a local phone number before validating and sending the existing API format', async () => {
  const { client } = await setup();
  await fireEvent.changeText(screen.getByTestId('field-phone'), '0799111333');
  expect(screen.getByTestId('field-phone').props.value).toBe('799111333');
  await fireEvent.press(screen.getByTestId('page-action'));
  await waitFor(() =>
    expect(updateUserProfile).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '+40799111333' }),
      undefined,
    ),
  );
  client.clear();
});

it('keeps an untouched missing birthday error hidden while editing other fields', async () => {
  const { client } = await setup();
  await act(() => useStore.setState({ userProfile: { ...profile, birthday: undefined } as any }));
  await fireEvent.changeText(screen.getByTestId('field-phone'), '0799111333');
  await fireEvent(screen.getByTestId('field-phone'), 'blur');
  await fireEvent.press(screen.getByTestId('select-countyId'));
  await fireEvent.press(screen.getByTestId('select-countyId-option-1'));
  expect(screen.queryByRole('alert')).toBeNull();
  await fireEvent.press(screen.getByTestId('page-action'));
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(updateUserProfile).not.toHaveBeenCalled();
  client.clear();
});
