import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentTemplateExceptionMessages } from 'src/modules/documents/exceptions/documente-template.exceptions';
import {
  FindOneDocumentTemplateOptions,
  IDocumentTemplateModel,
} from 'src/modules/documents/models/document-template.model';
import { DocumentTemplateFacade } from 'src/modules/documents/services/document-template.facade';

@Injectable()
export class GetOneDocumentTemplateUseCase
  implements IUseCaseService<IDocumentTemplateModel>
{
  constructor(
    private readonly documentTemplateFacade: DocumentTemplateFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(
    findOptions: FindOneDocumentTemplateOptions,
    organizationId: string,
  ): Promise<IDocumentTemplateModel> {
    const template = await this.documentTemplateFacade.findOne(findOptions);

    // Check if the provided organizationId matches the template's organizationId
    // If they don't match, throw a forbidden exception
    if (!template || organizationId !== template.organizationId) {
      this.exceptionsService.notFoundException(
        DocumentTemplateExceptionMessages.TEMPLATE_001,
      );
    }

    return template;
  }
}
