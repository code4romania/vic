import React, { useCallback, useEffect, useRef } from 'react';
import { registerForPushNotificationsAsync } from '../../common/utils/notifications';
import * as Notifications from 'expo-notifications';
import { registerPushToken } from '../../services/settings/settings.api';
import { NotificationContext } from './NotificationContext';
import { useAuth } from '../../hooks/useAuth';

const EVENTS = {
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
};

const NotificationContextProvider = ({
  children,
  navigation,
}: {
  children: React.ReactNode;
  navigation: any;
}) => {
  // notifications
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { isAuthenticated, userProfile, setUserProfile } = useAuth();

  const initNotifications = async () => {
    const token = await registerForPushNotificationsAsync();

    if (token) {
      await registerPushToken(token);
    }

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notif: Notifications.Notification) => {
        console.log('notif', notif);
      },
    ) as any;

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
    if (isAuthenticated && state?.routeNames?.includes('home')) {
      init();
    }
  }, [isAuthenticated, navigation, init]);

  const unsubscribe = () => {};

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
