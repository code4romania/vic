import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { S3_FILE_PATHS } from 'src/common/constants/constants';
import { ObjectDiff } from 'src/common/helpers/object-diff';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import {
  IOrganizationModel,
  UpdateOrganizationOptions,
} from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOrganizationUseCaseService } from './get-organization.usecase';
import { isValidCui, normalizeCui } from 'src/modules/organization/cui';
import {
  isLogoImage,
  RegisterOrganizationFiles,
} from './register-organization.usecase';

// The fields an NGO's admin may edit; status and validation stay with the super admins.
export type EditableOrganizationFields = Pick<
  UpdateOrganizationOptions,
  'name' | 'email' | 'phone' | 'address' | 'description' | 'website' | 'taxId'
>;

// Replaces the description-only update: every field, and optionally a new logo.
@Injectable()
export class UpdateOrganizationUseCase
  implements IUseCaseService<IOrganizationModel>
{
  constructor(
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly getOrganizationUseCase: GetOrganizationUseCaseService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly s3Service: S3Service,
  ) {}

  async execute(
    changes: EditableOrganizationFields,
    admin: IAdminUserModel,
    files: RegisterOrganizationFiles = {},
  ): Promise<IOrganizationModel> {
    const current = await this.getOrganizationUseCase.execute(
      admin.organizationId,
    );

    const taxIdChanged =
      changes.taxId !== undefined &&
      normalizeCui(changes.taxId ?? '') !== normalizeCui(current.taxId ?? '');

    // The CUI checked by the super admin stays locked after validation.
    if (current.validatedAt && taxIdChanged) {
      throw new BadRequestException(OrganizationExceptionMessages.ORG_012);
    }
    if (taxIdChanged && !isValidCui(changes.taxId)) {
      throw new BadRequestException(['taxId must be a valid CUI']);
    }
    // Preserve legacy stored values when the submitted CUI is equivalent.
    if (!taxIdChanged) {
      changes = { ...changes, taxId: undefined };
    }

    if (files.logo && !isLogoImage(files.logo)) {
      throw new BadRequestException(OrganizationExceptionMessages.ORG_003);
    }

    const conflicts = await this.organizationFacade.findConflicts(
      {
        name: changes.name,
        email: changes.email,
        phone: changes.phone,
        taxId: changes.taxId,
      },
      current.id,
    );
    if (conflicts.length) {
      throw new ConflictException(OrganizationExceptionMessages.ORG_004);
    }

    const folder = `${S3_FILE_PATHS.ORGANIZATIONS}/${current.id}`;
    const update: UpdateOrganizationOptions = {
      ...dropUndefined(changes),
      ...(files.logo
        ? { logo: await this.s3Service.uploadPublicFile(folder, files.logo) }
        : {}),
    };
    const updated = await this.organizationFacade.updateOrganization(
      current.id,
      update,
    );

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.UPDATE_ORGANIZATION_PROFILE,
      { organizationId: current.id, organizationName: updated.name },
      admin,
      ObjectDiff.diff(current, updated),
    );

    return updated;
  }
}

function dropUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, field]) => field !== undefined),
  ) as Partial<T>;
}
