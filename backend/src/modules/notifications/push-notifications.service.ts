import { Injectable } from '@nestjs/common';
import { Expo } from 'expo-server-sdk';
import { ExpoPushNotificationsService } from '../../infrastructure/providers/expo-push-notifications/module/expo-push-notifications.service';

@Injectable()
export class PushNotificationsService {
  expo = new Expo();

  constructor(
    private readonly expoPushNotificationsService: ExpoPushNotificationsService,
  ) {
    // setTimeout(() => {
    //   this.expoPushNotificationsService.send(
    //     ['ExponentPushToken[vTZsfGFGLMcSSLIWa2ARXD]'],
    //     'Florian Birloi',
    //     'Test',
    //   );
    // }, 2000);
  }

  // send = async (
  //   tokens: string[],
  //   title: string,
  //   body: string,
  // ): Promise<ExpoPushTicket[]> => {};
}
