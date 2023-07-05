import { ConfigService } from '@nestjs/config';
import { ExpoPushNotificationsModuleOptions } from '../providers/expo-push-notifications/module/expo-push-notifications.interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExpoPushNotificationsConfig {
  constructor(private configService: ConfigService) {}

  createExpoPushNotificationsConfigOptions(): ExpoPushNotificationsModuleOptions {
    return {
      accessToken: this.configService.get(
        'EXPO_PUSH_NOTIFICATIONS_ACCESS_TOKEN',
      ),
    };
  }
}
