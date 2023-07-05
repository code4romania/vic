import { IBaseModel } from 'src/common/interfaces/base.model';
import { NotificationsFrom } from '../enums/NotificationsFrom.enum';
import { NotificationsSettingsEntity } from '../entities/notifications-settings.entity';

export interface INotificationsSettingsModel extends IBaseModel {
  id: string;
  notificationsFrom: NotificationsFrom;
  notificationsViaEmail: boolean;
  notificationsViaPush: boolean;
}

export type IUpdateNotificationsSettingsOptions = Partial<
  Pick<
    INotificationsSettingsModel,
    'notificationsFrom' | 'notificationsViaEmail' | 'notificationsViaPush'
  >
>;

export class NotificationsSettingsTransformer {
  static fromEntity(
    entity: NotificationsSettingsEntity,
  ): INotificationsSettingsModel {
    if (!entity) return null;

    return {
      id: entity.id,
      notificationsFrom: entity.notificationsFrom,
      notificationsViaEmail: entity.notificationsViaEmail,
      notificationsViaPush: entity.notificationsViaPush,
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }

  static toEntity(): NotificationsSettingsEntity {
    const entity = new NotificationsSettingsEntity();
    return entity;
  }
}
