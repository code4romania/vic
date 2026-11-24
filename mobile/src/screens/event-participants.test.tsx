import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import '../common/config/i18n';
import Event from './Event';
import useStore from '../store/store';
import { EventVolunteerStatus } from '../common/enums/event-volunteer-status.enum';
import { EventRegistrationStatus } from '../common/enums/event-registration-status.enum';
import { containing, t } from '../test/i18n';

// The event page shows who is coming as overlapping initials in the places row (handbook `.avs`).

let mockFontScale = 1;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 3, fontScale: mockFontScale }),
}));
jest.mock('../services/organization/organization.service', () => ({
  useActivateOrganization: () => ({ activate: jest.fn() }),
}));
jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('expo-linking', () => ({ createURL: (p: string) => p, openURL: jest.fn() }));
const mockRefetch = jest.fn();
jest.mock('../services/event/event.service', () => ({
  useEventQuery: () => ({ isFetching: false, error: null, refetch: mockRefetch }),
  useSetRsvpEventMutation: () => ({ mutate: jest.fn(), isLoading: false }),
  // „Retrage răspuns” succeeds right away
  useCancelRsvpMutation: () => ({
    mutate: (_: unknown, options: { onSuccess: () => void }) => options.onSuccess(),
    isLoading: false,
  }),
}));

const { Navigator, Screen } = createNativeStackNavigator();

const participants = (n: number) => t('event:participants_label', { n });

const renderEvent = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator screenOptions={{ headerShown: false }}>
          <Screen name="event" component={Event} initialParams={{ eventId: '9' }} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

const setEvent = (extra: Record<string, unknown> = {}) =>
  useStore.setState({
    userProfile: { firstName: 'Ana', myOrganizations: [] } as any,
    event: {
      id: '9',
      name: 'Eveniment 9',
      location: 'Pădurea Băneasa',
      isPublic: true,
      startDate: '2026-11-22T07:00:00.000Z',
      endDate: '2026-11-22T12:00:00.000Z',
      eventInterval: '',
      capacity: 50,
      displayStatus: 'published',
      organizationName: 'Asociația Exemplu',
      description: 'd',
      volunteerStatus: EventVolunteerStatus.NO_RESPONSE,
      numberOfPersonsGoingToEvent: 18,
      participants: {
        total: 18,
        preview: ['ȘT', 'AM', 'ID', 'RL', 'EM'].map((initials) => ({ initials })),
      },
      ...extra,
    } as any,
  });

beforeEach(() => {
  mockFontScale = 1;
  mockRefetch.mockClear();
});

describe('Eveniment: cine participă', () => {
  it('„Retrage răspuns” takes the volunteer off the faces too, then reloads the event', async () => {
    setEvent({
      volunteerStatus: EventVolunteerStatus.JOINED,
      registrationStatus: EventRegistrationStatus.APPROVED,
    });
    await renderEvent();
    expect(await screen.findByLabelText(participants(18))).toBeTruthy();

    await fireEvent.press(await screen.findByTestId('event-cancel'));

    // caption, faces and their label agree straight away
    expect(await screen.findByLabelText(participants(17))).toBeTruthy();
    expect(screen.getByText('+14')).toBeTruthy();
    expect(
      screen.getByText(containing(t('event:attending', { numberOfVolunteer: 17 }))),
    ).toBeTruthy();
    // and the initials come fresh from the API
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows three faces and „+15” beside the places, read as „18 persoane participă”', async () => {
    setEvent();
    await renderEvent();
    const row = await screen.findByTestId('event-capacity');
    const faces = within(row).getByLabelText(participants(18));
    expect(within(faces).getAllByTestId('event-participants-face')).toHaveLength(3);
    expect(within(faces).getByText('ȘT')).toBeTruthy();
    expect(within(faces).getByText('+15')).toBeTruthy();
    // the caption and the places are still there
    expect(within(row).getByText(t('event:capacity_places_de', { places: 50 }))).toBeTruthy();
    expect(
      within(row).getByText(containing(t('event:attending', { numberOfVolunteer: 18 }))),
    ).toBeTruthy();
  });

  it('uses „de” from 20', async () => {
    setEvent({
      numberOfPersonsGoingToEvent: 20,
      participants: { total: 20, preview: [{ initials: 'AP' }] },
    });
    await renderEvent();
    expect(await screen.findByLabelText(t('event:participants_label_of', { n: 20 }))).toBeTruthy();
    expect(screen.getByText('+19')).toBeTruthy();
  });

  it('one person: no bubble, singular label', async () => {
    setEvent({
      numberOfPersonsGoingToEvent: 1,
      participants: { total: 1, preview: [{ initials: 'AP' }] },
    });
    await renderEvent();
    expect(await screen.findByLabelText(t('event:participants_label_one'))).toBeTruthy();
    expect(screen.queryByTestId('event-participants-more')).toBeNull();
  });

  it('no faces when nobody is going', async () => {
    setEvent({ numberOfPersonsGoingToEvent: 0, participants: { total: 0, preview: [] } });
    await renderEvent();
    await screen.findByTestId('event-capacity');
    expect(screen.queryByTestId('event-participants')).toBeNull();
  });

  it('no faces with an older API that sends no participants', async () => {
    setEvent({ participants: undefined });
    await renderEvent();
    await screen.findByTestId('event-capacity');
    expect(screen.queryByTestId('event-participants')).toBeNull();
    expect(
      screen.getByText(containing(t('event:attending', { numberOfVolunteer: 18 }))),
    ).toBeTruthy();
  });

  it('at large text sizes the faces move under the caption and show all five', async () => {
    mockFontScale = 1.6;
    setEvent();
    await renderEvent();
    const faces = await screen.findByLabelText(participants(18));
    expect(within(faces).getAllByTestId('event-participants-face')).toHaveLength(5);
    expect(within(faces).getByText('+13')).toBeTruthy();
  });
});
