import { UserPersonalDataEntity } from '../entities/user-personal-data.entity';

export interface IUserPersonalDataModel {
  id: string;
  cnp: string;
  address: string;
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  identityDocumentIssueDate: Date;
  identityDocumentExpirationDate: Date;
  identityDocumentIssuedBy: string;
  legalGuardian?: ILegalGuardian;
}

export interface ILegalGuardian {
  name: string;
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  email: string;
  phone: string;
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
      cnp: entity.cnp,
      identityDocumentSeries: entity.identityDocumentSeries,
      identityDocumentNumber: entity.identityDocumentNumber,
      identityDocumentIssueDate: entity.identityDocumentIssueDate,
      identityDocumentExpirationDate: entity.identityDocumentExpirationDate,
      identityDocumentIssuedBy: entity.identityDocumentIssuedBy,
      legalGuardian: entity.legalGuardian,
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
    entity.identityDocumentIssuedBy = model.identityDocumentIssuedBy;
    entity.legalGuardian = model.legalGuardian;
    entity.cnp = model.cnp;
    return entity;
  }
}
