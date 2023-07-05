import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { NotificationsFrom } from 'src/modules/notifications/enums/NotificationsFrom.enum';

export class UpdateSettingsDto {
  @IsOptional()
  @IsEnum(NotificationsFrom)
  notificationsFrom: NotificationsFrom;

  @IsOptional()
  @IsBoolean()
  notificationsViaEmail: boolean;

  @IsOptional()
  @IsBoolean()
  notificationsViaPush: boolean;
}
