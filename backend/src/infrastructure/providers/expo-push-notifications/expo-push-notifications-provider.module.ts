import { Module } from '@nestjs/common';
import { ExpoPushNotificationsModule } from './module/expo-push-notifications.module';
import { ExpoPushNotificationsConfig } from 'src/infrastructure/config/expo-push-notifications.config';

@Module({
  imports: [
    ExpoPushNotificationsModule.registerAsync({
      useClass: ExpoPushNotificationsConfig,
    }),
  ],
})
export class ExpoPushNotificationsProviderModule {}
