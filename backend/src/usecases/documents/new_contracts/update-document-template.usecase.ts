import { Injectable, Logger } from '@nestjs/common';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentTemplateExceptionMessages } from 'src/modules/documents/exceptions/documente-template.exceptions';
import { UpdateDocumentTemplateOptions } from 'src/modules/documents/models/document-template.model';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { DocumentTemplateFacade } from 'src/modules/documents/services/document-template.facade';

@Injectable()
export class UpdateDocumentTemplateUsecase implements IUseCaseService<string> {
  private readonly logger = new Logger(UpdateDocumentTemplateUsecase.name);
  constructor(
    private readonly documentTemplateFacade: DocumentTemplateFacade,
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    updates: UpdateDocumentTemplateOptions,
    organizationId: string,
  ): Promise<void> {
    try {
      // 1. Does the template exists in the callers' organization?
      const template = await this.documentTemplateFacade.exists({
        id: updates.id,
        organizationId,
      });

      if (!template) {
        this.exceptionService.notFoundException(
          DocumentTemplateExceptionMessages.TEMPLATE_001,
        );
      }

      // 2. Templates can be deleted if are not linked with a contract
      const isUsed = await this.documentContractFacade.exists({
        documentTemplateId: updates.id,
        organizationId: organizationId,
      });

      if (isUsed) {
        this.exceptionService.badRequestException(
          DocumentTemplateExceptionMessages.TEMPLATE_003,
        );
      }

      await this.documentTemplateFacade.update(updates);
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
