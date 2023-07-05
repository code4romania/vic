import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { INotificationsSettingsModel } from 'src/modules/notifications/models/notifications-settings.model';
import { NotificationsFrom } from 'src/modules/notifications/enums/NotificationsFrom.enum';

export class NotificationsSettinsPresenter {
  constructor(notifications: INotificationsSettingsModel) {
    this.id = notifications.id;
    this.notificationsFrom = notifications.notificationsFrom;
    this.notificationsViaEmail = notifications.notificationsViaEmail;
    this.notificationsViaPush = notifications.notificationsViaPush;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the User',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Notifications from all organizations/my organizations',
    enum: NotificationsFrom,
    examples: Object.values(NotificationsFrom),
  })
  notificationsFrom: NotificationsFrom;

  @Expose()
  @ApiProperty({
    description: 'The user should receive notifications via email',
  })
  notificationsViaEmail: boolean;

  @Expose()
  @ApiProperty({
    description: 'The user should receive notifications via push',
  })
  notificationsViaPush: boolean;
}
