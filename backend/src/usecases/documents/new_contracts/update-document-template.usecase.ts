import { Injectable, Logger } from '@nestjs/common';
import { ObjectDiff } from 'src/common/helpers/object-diff';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { DocumentTemplateExceptionMessages } from 'src/modules/documents/exceptions/documente-template.exceptions';
import { UpdateDocumentTemplateOptions } from 'src/modules/documents/models/document-template.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { DocumentTemplateFacade } from 'src/modules/documents/services/document-template.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class UpdateDocumentTemplateUsecase implements IUseCaseService<string> {
  private readonly logger = new Logger(UpdateDocumentTemplateUsecase.name);
  constructor(
    private readonly documentTemplateFacade: DocumentTemplateFacade,
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    updates: UpdateDocumentTemplateOptions,
    admin: IAdminUserModel,
  ): Promise<void> {
    try {
      // 1. Does the template exists in the callers' organization?
      const template = await this.documentTemplateFacade.findOne({
        id: updates.id,
        organizationId: admin.organizationId,
      });

      if (!template) {
        this.exceptionService.notFoundException(
          DocumentTemplateExceptionMessages.TEMPLATE_001,
        );
      }

      // 2. Templates can be deleted if are not linked with a contract
      const isUsed = await this.documentContractFacade.exists({
        documentTemplateId: updates.id,
        organizationId: admin.organizationId,
      });

      if (isUsed) {
        this.exceptionService.badRequestException(
          DocumentTemplateExceptionMessages.TEMPLATE_003,
        );
      }

      const updated = await this.documentTemplateFacade.update(updates);

      this.actionsArchiveFacade.trackEvent(
        TrackedEventName.UPDATE_DOCUMENT_TEMPLATE,
        {
          organizationId: admin.organizationId,
          documentTemplateId: updates.id,
          documentTemplateName: template.name,
        },
        admin,
        ObjectDiff.diff(template, updated),
      );
    } catch (error) {
      if (error?.status === 400) {
        // Rethrow errors that we've thrown above, and catch the others
        throw error;
      }

      this.logger.error({
        ...DocumentTemplateExceptionMessages.TEMPLATE_004,
        error: JSONStringifyError(error),
      });
      this.exceptionService.internalServerErrorException({
        ...DocumentTemplateExceptionMessages.TEMPLATE_004,
        details: JSONStringifyError(error),
      });
    }
  }
}
