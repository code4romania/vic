import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './expo-push-notifications.module-definition';
import { ExpoPushNotificationsService } from './expo-push-notifications.service';

@Module({
  providers: [ExpoPushNotificationsService],
  exports: [ExpoPushNotificationsService],
})
export class ExpoPushNotificationsModule extends ConfigurableModuleClass {}
