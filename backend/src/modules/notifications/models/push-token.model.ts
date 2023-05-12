import { IBaseModel } from 'src/common/interfaces/base.model';
import { PushTokensEntity } from '../entities/push-tokens.entity';

export interface IPushTokenModel extends IBaseModel {
  id: string;

  deviceId: string;
  token: string;
  userId: string;
}

export type CreatePushTokenOptions = Pick<
  IPushTokenModel,
  'deviceId' | 'token' | 'userId'
>;

export class PushTokenModelTransformer {
  static fromEntity(entity: PushTokensEntity): IPushTokenModel {
    return {
      id: entity.id,
      deviceId: entity.deviceId,
      token: entity.token,
      userId: entity.userId,
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }

  static toEntity(model: CreatePushTokenOptions): PushTokensEntity {
    const entity = new PushTokensEntity();
    entity.deviceId = model.deviceId;
    entity.token = model.token;
    entity.userId = model.userId;
    return entity;
  }
}
