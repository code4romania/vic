import React, { useCallback, useEffect, useRef, useState } from 'react';
import { registerForPushNotificationsAsync } from '../../common/utils/notifications';
import * as Notifications from 'expo-notifications';
import { registerPushToken, unregisterPushToken } from '../../services/settings/settings.api';
import { NotificationContext } from './NotificationContext';
import { useUserProfile } from '../../store/profile/profile.selector';
import useStore from '../../store/store';

export const EVENTS = {
  JOIN_NGO: {
    APPROVE_REQUEST: 'join.ngo.approve.request',
    REJECT_REQUEST: 'join.ngo.reject.request',
    ARCHIVE_VOLUNTEER: 'join.ngo.archive.volunteer',
  },
  NGO_EVENT: {
    ADD: 'ngo.event.add',
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
  // notifications
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { userProfile } = useUserProfile();
  const { setUserProfile } = useStore();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const initNotifications = async () => {
    const token = await registerForPushNotificationsAsync();
    setPushToken(token);

    if (token) {
      await registerPushToken(token);
    }

    setIsRegistered(true);

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        const {
          notification: {
            request: {
              content: { data: payload },
            },
          },
        } = response;

        if (payload.key === EVENTS.JOIN_NGO.APPROVE_REQUEST) {
          if (userProfile) {
            setUserProfile({
              ...userProfile,
              activeOrganization: payload.payload,
              myOrganizations: [...userProfile?.myOrganizations, payload.payload],
            });
            navigation.navigate('volunteer');
          }
        }

        if (payload.key === EVENTS.JOIN_NGO.REJECT_REQUEST) {
          navigation.navigate('organization-profile', {
            organizationId: payload.payload.organizationId,
          });
        }

        if (payload.key === EVENTS.NGO_EVENT.ADD) {
          navigation.navigate('event', {
            eventId: payload.payload.eventId,
          });
        }

        if (payload.key === EVENTS.OTHER.SEND_ANNOUNCEMENT) {
          navigation.navigate('announcements');
        }

        if (
          payload.key ===
          (EVENTS.DOCUMENTS.GENERATE_CONTRACT ||
            EVENTS.DOCUMENTS.APPROVE_CONTRACT ||
            EVENTS.DOCUMENTS.REJECT_CONATRCT)
        ) {
          navigation.navigate('contract', {
            id: payload.payload.contractId,
          });
        }

        if (payload.key === (EVENTS.VOLUNTEER_HOURS.APPROVE || EVENTS.VOLUNTEER_HOURS.APPROVE)) {
          navigation.navigate('activity-log', { activityLogId: payload.payload.activityLogId });
        }
      },
    ) as any;

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current as Notifications.Subscription,
      );
      Notifications.removeNotificationSubscription(
        responseListener.current as Notifications.Subscription,
      );
    };
  };

  const init = useCallback(initNotifications, [initNotifications]);

  useEffect(() => {
    const state = navigation.getRootState();
    if (userProfile !== null && !isRegistered && state?.routeNames?.includes('home')) {
      init();
    }
  }, [navigation, init, userProfile, isRegistered]);

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
