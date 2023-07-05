import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { NotificationsExceptionMessages } from 'src/modules/notifications/exceptions/notifications.exceptions';
import {
  INotificationsSettingsModel,
  IUpdateNotificationsSettingsOptions,
} from 'src/modules/notifications/models/notifications-settings.model';
import { NotificationsSettingsFacade } from 'src/modules/notifications/notifications-settings.facade';

@Injectable()
export class UpdateSettingsUsecase
  implements IUseCaseService<INotificationsSettingsModel>
{
  constructor(
    private readonly notificationsSettingsFacade: NotificationsSettingsFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  async execute(
    id: string,
    options: IUpdateNotificationsSettingsOptions,
  ): Promise<INotificationsSettingsModel> {
    const settings = await this.notificationsSettingsFacade.find(id);

    if (!settings) {
      this.exceptionsService.badRequestException(
        NotificationsExceptionMessages.NOTIFICATIONS_002,
      );
    }

    const newSettings = await this.notificationsSettingsFacade.update(
      id,
      options,
    );

    return newSettings;
  }
}
