import React, { useCallback, useEffect, useRef, useState } from 'react';
import { registerForPushNotificationsAsync } from '../../common/utils/notifications';
import * as Notifications from 'expo-notifications';
import { registerPushToken, unregisterPushToken } from '../../services/settings/settings.api';
import { NotificationContext } from './NotificationContext';
import { useUserProfile } from '../../store/profile/profile.selector';
import useStore from '../../store/store';
import { useAuth } from '../../hooks/useAuth';
import { useUpdateSettingsMutation } from '../../services/settings/settings.service';
import { INotificationsSettings } from '../../common/interfaces/user-profile.interface';

export const EVENTS = {
  JOIN_NGO: {
    APPROVE_REQUEST: 'join.ngo.approve.request',
    REJECT_REQUEST: 'join.ngo.reject.request',
    ARCHIVE_VOLUNTEER: 'join.ngo.archive.volunteer',
  },
  NGO_EVENT: {
    ADD: 'ngo.event.add',
    // VIC 2.0 (#496): the NGO registered the volunteer to an event
    VOLUNTEER_ADDED: 'ngo.event.volunteer.added',
    // #501: the NGO approved or rejected the volunteer's registration
    REGISTRATION_APPROVED: 'ngo.event.registration.approved',
    REGISTRATION_REJECTED: 'ngo.event.registration.rejected',
  },
  VOLUNTEER_HOURS: {
    APPROVE: 'volunteer.hours.approve',
    REJECT: 'volunteer.hours.reject',
  },
  OTHER: {
    SEND_ANNOUNCEMENT: 'other.send.announcement',
  },
  DOCUMENTS: {
    GENERATE_CONTRACT: 'contract.generate',
    APPROVE_CONTRACT: 'contract.approve',
    REJECT_CONATRCT: 'contract.reject',
  },
};

const NotificationContextProvider = ({
  children,
  navigation,
}: {
  children: React.ReactNode;
  navigation: any;
}) => {
  const [pushToken, setPushToken] = useState<string>();
  // covers both taps while the app is running and the tap that launched the app from a killed state
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const handledResponseId = useRef<string>(undefined);
  const [isNavigationReady, setIsNavigationReady] = useState<boolean>(false);
  const { userProfile } = useUserProfile();
  const { setUserProfile, updateSettings } = useStore();
  const { isAuthenticated } = useAuth();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const { mutate: updateNotificationsSettings } = useUpdateSettingsMutation();

  const initNotifications = async () => {
    const { token, userWasAsked } = await registerForPushNotificationsAsync();

    setPushToken(token);

    if (token) {
      await registerPushToken(token);
    }

    if (userWasAsked && userProfile) {
      updateNotificationsSettings(
        {
          id: userProfile.notificationsSettings.id,
          settings: {
            notificationsViaPush: !!token,
          },
        },
        {
          onSuccess: (data: INotificationsSettings) => {
            updateSettings(data);
          },
          onError: () => {
            console.log('Could not update notifications settings data.');
          },
        },
      );
    }

    setIsRegistered(true);
  };

  const init = useCallback(initNotifications, [initNotifications]);

  useEffect(() => {
    const state = navigation.getRootState();
    if (isAuthenticated && !isRegistered && state?.routeNames?.includes('home')) {
      init();
    }
  }, [navigation, init, isAuthenticated, isRegistered]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsRegistered(false);
    }
  }, [isAuthenticated]);

  // the private routes are mounted only after the user is authenticated
  useEffect(() => {
    const updateNavigationReady = () =>
      setIsNavigationReady(
        navigation.isReady() && !!navigation.getRootState()?.routeNames?.includes('home'),
      );

    updateNavigationReady();
    return navigation.addListener('state', updateNavigationReady);
  }, [navigation, isAuthenticated]);

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const payload: any = response.notification.request.content.data;

    switch (payload?.key) {
      case EVENTS.JOIN_NGO.APPROVE_REQUEST: {
        if (userProfile) {
          const isAlreadyMember = userProfile.myOrganizations.some(
            (organization) => organization.id === payload.payload.id,
          );
          setUserProfile({
            ...userProfile,
            activeOrganization: payload.payload,
            myOrganizations: isAlreadyMember
              ? userProfile.myOrganizations
              : [...userProfile.myOrganizations, payload.payload],
          });
        }
        navigation.navigate('volunteer');
        break;
      }
      case EVENTS.JOIN_NGO.REJECT_REQUEST:
        navigation.navigate('organization-profile', {
          organizationId: payload.payload.organizationId,
        });
        break;
      case EVENTS.JOIN_NGO.ARCHIVE_VOLUNTEER:
        navigation.navigate('organization-profile', {
          organizationId: payload.payload.id,
        });
        break;
      case EVENTS.NGO_EVENT.ADD:
      case EVENTS.NGO_EVENT.VOLUNTEER_ADDED:
      case EVENTS.NGO_EVENT.REGISTRATION_APPROVED:
      case EVENTS.NGO_EVENT.REGISTRATION_REJECTED:
        navigation.navigate('event', {
          eventId: payload.payload.eventId,
        });
        break;
      case EVENTS.OTHER.SEND_ANNOUNCEMENT:
        navigation.navigate('announcements');
        break;
      case EVENTS.DOCUMENTS.GENERATE_CONTRACT:
      case EVENTS.DOCUMENTS.APPROVE_CONTRACT:
      case EVENTS.DOCUMENTS.REJECT_CONATRCT:
        // #486: contracts are no longer signed in the app; they are listed on Documente
        navigation.navigate('documents');
        break;
      case EVENTS.VOLUNTEER_HOURS.APPROVE:
      case EVENTS.VOLUNTEER_HOURS.REJECT:
        navigation.navigate('activity-log', { activityLogId: payload.payload.activityLogId });
        break;
    }
  };

  useEffect(() => {
    if (!lastNotificationResponse || !isAuthenticated || !isNavigationReady || !userProfile) {
      return;
    }

    const responseId = lastNotificationResponse.notification.request.identifier;
    if (handledResponseId.current === responseId) {
      return;
    }

    handledResponseId.current = responseId;
    // so the same response is not replayed after a new login
    Notifications.clearLastNotificationResponse();
    handleNotificationResponse(lastNotificationResponse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastNotificationResponse, isAuthenticated, isNavigationReady, userProfile]);

  const unsubscribe = () => {
    try {
      if (pushToken) {
        unregisterPushToken(pushToken);
      }
    } catch (error) {
      console.error('Error while unregistering push token');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unsubscribe,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContextProvider;
