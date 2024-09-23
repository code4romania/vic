import { Injectable, Logger } from '@nestjs/common';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DocumentTemplateExceptionMessages } from 'src/modules/documents/exceptions/documente-template.exceptions';
import { DocumentContractFacade } from 'src/modules/documents/services/document-contract.facade';
import { DocumentTemplateFacade } from 'src/modules/documents/services/document-template.facade';

@Injectable()
export class DeleteDocumentTemplateUsecase implements IUseCaseService<string> {
  private readonly logger = new Logger(DeleteDocumentTemplateUsecase.name);
  constructor(
    private readonly documentTemplateFacade: DocumentTemplateFacade,
    private readonly documentContractFacade: DocumentContractFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(id: string, organizationId: string): Promise<string> {
    try {
      // 1. Templates can be deleted if are not linked with a contract
      const isUsed = await this.documentContractFacade.exists({
        documentTemplateId: id,
        organizationId: organizationId,
      });

      if (isUsed) {
        this.exceptionService.badRequestException(
          DocumentTemplateExceptionMessages.TEMPLATE_003,
        );
      }

      // 2. Try to delete it
      const deleted = await this.documentTemplateFacade.delete({
        id,
        organizationId,
      });

      if (!deleted) {
        this.exceptionService.badRequestException(
          DocumentTemplateExceptionMessages.TEMPLATE_001,
        );
      }

      return deleted;
    } catch (error) {
      if (error?.status === 400) {
        // Rethrow errors that we've thrown above, and catch the others
        throw error;
      }

      this.logger.error({
        ...DocumentTemplateExceptionMessages.TEMPLATE_002,
        error: JSONStringifyError(error),
      });
      this.exceptionService.internalServerErrorException({
        ...DocumentTemplateExceptionMessages.TEMPLATE_005,
        details: JSONStringifyError(error),
      });
    }
  }
}
