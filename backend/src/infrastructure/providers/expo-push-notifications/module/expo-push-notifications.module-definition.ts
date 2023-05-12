import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ExpoPushNotificationsModuleOptions } from './expo-push-notifications.interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ExpoPushNotificationsModuleOptions>()
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      }),
    )
    .setFactoryMethodName('createExpoPushNotificationsConfigOptions')
    .build();
