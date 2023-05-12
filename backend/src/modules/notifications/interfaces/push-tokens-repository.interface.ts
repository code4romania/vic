import {
  CreatePushTokenOptions,
  IPushTokenModel,
} from './../models/push-token.model';

export interface IPushTokensRepository {
  create(
    CreatePushTokenOptions: CreatePushTokenOptions,
  ): Promise<IPushTokenModel>;
  find(findOptions: Partial<IPushTokenModel>): Promise<IPushTokenModel>;
  findMany(findOptions: Partial<IPushTokenModel>): Promise<IPushTokenModel[]>;
  delete(id: string): Promise<string>;
}
