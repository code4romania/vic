import { IBaseModel } from 'src/common/interfaces/base.model';
import { DocumentContractStatus } from '../enums/contract-status.enum';
import { DocumentContractEntity } from '../entities/document-contract.entity';
import {
  DocumentTemplateTransformer,
  IDocumentTemplateModel,
} from './document-template.model';
import {
  AdminUserTransformer,
  IAdminUserModel,
} from 'src/modules/user/models/admin-user.model';
import {
  IVolunteerModel,
  VolunteerModelTransformer,
} from 'src/modules/volunteer/model/volunteer.model';

// TODO: Change this with the existent IUserPersonalDataModel after is updated
export interface PersonalData {
  CNP: string;
  name: string;
  address: string;
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  identityDocumentIssuedBy: string;
  identityDocumentIssuedDate: Date;
}

export interface IDocumentContractModel extends IBaseModel {
  id: string;
  status: DocumentContractStatus;

  documentNumber: string;
  documentDate: Date;
  documentStartDate: Date;
  documentEndDate: Date;

  organizationId: string;

  // Template
  documentTemplateId: string;
  documentTemplate: IDocumentTemplateModel; // TODO: we don't always need all the data here... but id and name, hmm...

  // Created By
  createdByAdminId: string;
  createdByAdmin: IAdminUserModel;

  // Volunteer
  volunteerId: string;
  volunteer: IVolunteerModel;

  volunteerData: PersonalData; // TODO: le tragem din user in usecase-ul de creare contract si raman ca snapshoot
  volunteerTutorData?: PersonalData; // TODO: le tragem din user in usecase-ul de creare contract si raman ca snapshoot

  filePath?: string;

  ngoLegalRepresentativeSignatureId?: string;
  volunteerSignatureId?: string;
  tutorSignatureId?: string;
}

export type CreateDocumentContractOptions = {
  status: DocumentContractStatus;

  documentNumber: string;
  documentDate: Date;
  documentStartDate: Date;
  documentEndDate: Date;

  volunteerData: PersonalData;
  volunteerTutorData?: PersonalData;

  volunteerId: string;
  organizationId: string;
  documentTemplateId: string;
  createdByAdminId: string;
};

export type UpdateDocumentContractOptions = {
  status?: DocumentContractStatus;
  filePath?: string;
  ngoLegalRepresentativeSignatureId?: string;
  volunteerSignatureId?: string;
  tutorSignatureId?: string;
};

export type FindOneDocumentContractOptions = Pick<IDocumentContractModel, 'id'>;

export class DocumentContractTransformer {
  static fromEntity(entity: DocumentContractEntity): IDocumentContractModel {
    if (!entity) {
      return null;
    }

    return {
      id: entity.id,
      status: entity.status,
      documentNumber: entity.documentNumber,
      documentDate: entity.documentDate,
      documentStartDate: entity.documentStartDate,
      documentEndDate: entity.documentEndDate,

      organizationId: entity.organizationId,

      // Volunteer
      volunteerId: entity.volunteerId,
      volunteer: VolunteerModelTransformer.fromEntity(entity.volunteer),
      volunteerData: entity.volunteerData,
      volunteerTutorData: entity.volunteerTutorData,
      // Template
      documentTemplateId: entity.documentTemplateId,
      documentTemplate: DocumentTemplateTransformer.fromEntity(
        entity.documentTemplate,
      ),
      // CreatedBy
      createdByAdminId: entity.createdByAdminId,
      createdByAdmin: AdminUserTransformer.fromEntity(entity.createdByAdmin),

      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }

  static createDocumentContractToEntity(
    model: CreateDocumentContractOptions,
  ): DocumentContractEntity {
    const entity = new DocumentContractEntity();
    entity.status = model.status;
    entity.documentNumber = model.documentNumber;
    entity.documentDate = model.documentDate;
    entity.documentStartDate = model.documentStartDate;
    entity.documentEndDate = model.documentEndDate;
    entity.volunteerId = model.volunteerId;
    entity.volunteerData = model.volunteerData;
    entity.volunteerTutorData = model.volunteerTutorData;
    entity.organizationId = model.organizationId;
    entity.documentTemplateId = model.documentTemplateId;
    entity.createdByAdminId = model.createdByAdminId;

    return entity;
  }
}
