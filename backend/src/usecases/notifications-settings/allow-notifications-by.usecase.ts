import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { NotificationsFrom } from 'src/modules/notifications/enums/NotificationsFrom.enum';
import { INotificationsSettingsModel } from 'src/modules/notifications/models/notifications-settings.model';
import { NotificationsSettingsFacade } from 'src/modules/notifications/notifications-settings.facade';
import { RegisterDevicePushTokenUseCase } from '../push-notifications/register-device-push-token.usecase';
import { UnregisterDevicePushTokenUseCase } from '../push-notifications/unregister-device-push-token.usecase';

@Injectable()
export class AllowNotificationsByUsecase
  implements IUseCaseService<INotificationsSettingsModel>
{
  constructor(
    private readonly notificationsSettingsFacade: NotificationsSettingsFacade,
    private readonly registerPushNotificationsUsecase: RegisterDevicePushTokenUseCase,
    private readonly unregisterPushNotificationsUsecase: UnregisterDevicePushTokenUseCase,
  ) {}

  async execute(
    userId: string,
    notificationsFrom: NotificationsFrom,
  ): Promise<INotificationsSettingsModel> {
    const settings = await this.notificationsSettingsFacade.update(userId, {
      notificationsFrom,
    });

    return settings;
  }
}
