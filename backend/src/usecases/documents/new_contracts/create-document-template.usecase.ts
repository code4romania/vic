import { Injectable, Logger } from '@nestjs/common';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { DocumentTemplateExceptionMessages } from 'src/modules/documents/exceptions/documente-template.exceptions';
import {
  CreateDocumentTemplateOptions,
  IDocumentTemplateModel,
} from 'src/modules/documents/models/document-template.model';
import { DocumentTemplateFacade } from 'src/modules/documents/services/document-template.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class CreateDocumentTemplateUsecase
  implements IUseCaseService<IDocumentTemplateModel>
{
  private readonly logger = new Logger(CreateDocumentTemplateUsecase.name);
  constructor(
    private readonly documentTemplateFacade: DocumentTemplateFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    options: CreateDocumentTemplateOptions,
    admin: IAdminUserModel,
  ): Promise<IDocumentTemplateModel> {
    try {
      const newTemplate = await this.documentTemplateFacade.create(options);

      this.actionsArchiveFacade.trackEvent(
        TrackedEventName.CREATE_DOCUMENT_TEMPLATE,
        {
          organizationId: newTemplate.organizationId,
          documentTemplateId: newTemplate.id,
          documentTemplateName: newTemplate.name,
        },
        admin,
        admin.organizationId,
      );

      return newTemplate;
    } catch (error) {
      this.logger.error({
        ...DocumentTemplateExceptionMessages.TEMPLATE_002,
        error: JSONStringifyError(error),
      });
      this.exceptionService.badRequestException(
        DocumentTemplateExceptionMessages.TEMPLATE_002,
      );
    }
  }
}
