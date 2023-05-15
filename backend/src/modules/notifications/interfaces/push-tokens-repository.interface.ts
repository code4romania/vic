import {
  CreatePushTokenOptions,
  DeletePushTokenOptions,
  IPushTokenModel,
} from './../models/push-token.model';

export interface IPushTokensRepository {
  create(
    CreatePushTokenOptions: CreatePushTokenOptions,
  ): Promise<IPushTokenModel>;
  find(findOptions: Partial<IPushTokenModel>): Promise<IPushTokenModel>;
  findMany(findOptions: Partial<IPushTokenModel>): Promise<IPushTokenModel[]>;
  delete(options: DeletePushTokenOptions): Promise<string>;
}
