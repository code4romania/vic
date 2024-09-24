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
import { IUserPersonalDataModel } from 'src/modules/user/models/user-personal-data.model';
import { IUserModel } from 'src/modules/user/models/base-user.model';
import {
  IOrganizationModel,
  OrganizationTransformer,
} from 'src/modules/organization/models/organization.model';
import {
  IDocumentSignatureModel,
  SignatureModelTransformer,
} from './document-signature.model';

export type VolunteerContractIdentityData = IUserPersonalDataModel & {
  name: string;
};

export interface IDocumentContractModel extends IBaseModel {
  id: string;
  status: DocumentContractStatus;

  documentNumber: string;
  documentDate: Date;
  documentStartDate: Date;
  documentEndDate: Date;

  organizationId: string;
  organization?: IOrganizationModel;

  // Template
  documentTemplateId: string;
  documentTemplate: IDocumentTemplateModel; // TODO: we don't always need all the data here... but id and name, hmm...

  // Created By
  createdByAdminId: string;
  createdByAdmin: IAdminUserModel;

  // Rejected By
  rejectedById?: string;
  rejectedBy?: IUserModel;
  rejectionReason?: string;
  rejectionDate?: Date;

  // Volunteer
  volunteerId: string;
  volunteer: IVolunteerModel;

  volunteerData: VolunteerContractIdentityData;

  filePath?: string;

  volunteerSignatureId?: string;
  volunteerSignature?: IDocumentSignatureModel;

  legalGuardianSignatureId?: string;
  legalGuardianSignature?: IDocumentSignatureModel;

  ngoLegalRepresentativeSignatureId?: string;
  ngoLegalRepresentativeSignature?: IDocumentSignatureModel;
}

export type CreateDocumentContractOptions = {
  status: DocumentContractStatus;

  documentNumber: string;
  documentDate: Date;
  documentStartDate: Date;
  documentEndDate: Date;

  volunteerData: VolunteerContractIdentityData;

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
  legalGuardianSignatureId?: string;

  // Rejection
  rejectionReason?: string;
  rejectedById?: string;
  rejectionDate?: Date;
};

export type DocumentContractStatistics = {
  pendingNgoRepresentativeSignature: number;
  pendingVolunteerSignature: number;
  activeContracts: number;
  soonToExpire: number;
};

export type FindOneDocumentContractOptions = Partial<
  Pick<
    IDocumentContractModel,
    | 'id'
    | 'volunteerId'
    | 'organizationId'
    | 'status'
    | 'documentTemplateId'
    | 'documentNumber'
  >
>;

export type FindExistingContractForVolunteerInInterval = {
  volunteerId: string;
  documentStartDate: Date;
  documentEndDate: Date;
};

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
      organization: OrganizationTransformer.fromEntity(entity.organization),

      // Volunteer
      volunteerId: entity.volunteerId,
      volunteer: VolunteerModelTransformer.fromEntity(entity.volunteer),
      volunteerData: entity.volunteerData,
      // Template
      documentTemplateId: entity.documentTemplateId,
      documentTemplate: DocumentTemplateTransformer.fromEntity(
        entity.documentTemplate,
      ),
      // CreatedBy
      createdByAdminId: entity.createdByAdminId,
      createdByAdmin: AdminUserTransformer.fromEntity(entity.createdByAdmin),

      // Rejected By
      rejectedById: entity.rejectedById,
      rejectedBy: entity.rejectedBy // TODO: we don't need all the data
        ? {
            id: entity.rejectedBy.id,
            name: entity.rejectedBy.name,
            email: entity.rejectedBy.email,
            phone: entity.rejectedBy.phone,
            cognitoId: entity.rejectedBy.cognitoId,
          }
        : null,
      rejectionReason: entity.rejectionReason,
      rejectionDate: entity.rejectionDate,

      filePath: entity.filePath,

      // Volunteer Signature
      volunteerSignature: SignatureModelTransformer.fromEntity(
        entity.volunteerSignature,
      ),

      // Legal Guardian Signature
      legalGuardianSignature: SignatureModelTransformer.fromEntity(
        entity.legalGuardianSignature,
      ),

      // Ngo Legal Representative Signature
      ngoLegalRepresentativeSignature: SignatureModelTransformer.fromEntity(
        entity.ngoLegalRepresentativeSignature,
      ),

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
    entity.organizationId = model.organizationId;
    entity.documentTemplateId = model.documentTemplateId;
    entity.createdByAdminId = model.createdByAdminId;

    return entity;
  }
}
