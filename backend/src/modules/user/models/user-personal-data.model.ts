import { UserPersonalDataEntity } from '../entities/user-personal-data.entity';

export interface IUserPersonalDataModel {
  id: string;
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  address: string;
  identityDocumentIssueDate: Date;
  identityDocumentExpirationDate: Date;
}

export type CreateUserPersonalDataOptions = Omit<IUserPersonalDataModel, 'id'>;

export type FindUserPersonalDataOptions = Partial<
  Pick<IUserPersonalDataModel, 'id' | 'identityDocumentNumber'>
>;

export class UserPersonalDataTransformer {
  static fromEntity(entity: UserPersonalDataEntity): IUserPersonalDataModel {
    if (!entity) return null;
    return {
      id: entity.id,
      identityDocumentSeries: entity.identityDocumentSeries,
      identityDocumentNumber: entity.identityDocumentNumber,
      identityDocumentIssueDate: entity.identityDocumentIssueDate,
      identityDocumentExpirationDate: entity.identityDocumentExpirationDate,
      address: entity.address,
    };
  }

  static toEntity(
    model: CreateUserPersonalDataOptions,
  ): UserPersonalDataEntity {
    const entity = new UserPersonalDataEntity();
    entity.address = model.address;
    entity.identityDocumentExpirationDate =
      model.identityDocumentExpirationDate;
    entity.identityDocumentIssueDate = model.identityDocumentIssueDate;
    entity.identityDocumentNumber = model.identityDocumentNumber;
    entity.identityDocumentSeries = model.identityDocumentSeries;
    return entity;
  }
}
