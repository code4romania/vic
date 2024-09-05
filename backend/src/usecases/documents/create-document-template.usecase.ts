import { Injectable, Logger } from '@nestjs/common';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentTemplateExceptionMessages } from 'src/modules/documents/exceptions/documente-template.exceptions';
import {
  CreateDocumentTemplateOptions,
  IDocumentTemplateModel,
} from 'src/modules/documents/models/document-template.model';
import { DocumentTemplateFacade } from 'src/modules/documents/services/document-template.facade';

@Injectable()
export class CreateDocumentTemplateUsecase
  implements IUseCaseService<IDocumentTemplateModel>
{
  private readonly logger = new Logger(CreateDocumentTemplateUsecase.name);
  constructor(
    private readonly documentTemplateFacade: DocumentTemplateFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    options: CreateDocumentTemplateOptions,
  ): Promise<IDocumentTemplateModel> {
    try {
      const newTemplate = await this.documentTemplateFacade.create(options);

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
