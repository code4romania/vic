import { IBaseModel } from 'src/common/interfaces/base.model';
import { NotificationsFrom } from '../enums/NotificationsFrom.enum';
import { NotificationsSettingsEntity } from '../entities/notifications-settings.entity';

export interface INotificationsSettingsModel extends IBaseModel {
  id: string;
  notificationsFrom: NotificationsFrom;
  notificationsViaEmail: boolean;
  notificationsViaPush: boolean;
  userId: string;
}

export type ICreateNotificationsSettingsOptions = Pick<
  INotificationsSettingsModel,
  'userId'
>;

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
      userId: entity.userId,
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }

  static toEntity(
    model: ICreateNotificationsSettingsOptions,
  ): NotificationsSettingsEntity {
    const entity = new NotificationsSettingsEntity();
    entity.userId = model.userId;
    return entity;
  }
}
