import { Injectable, Logger } from '@nestjs/common';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { TemplateExceptionMessages } from 'src/modules/documents/exceptions/template.exceptions';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';

@Injectable()
export class DeleteTemplateUseCase implements IUseCaseService<string> {
  private readonly logger = new Logger(DeleteTemplateUseCase.name);
  constructor(
    private readonly templateFacade: TemplateFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(id: string): Promise<string> {
    // 1. Find the template
    const template = await this.templateFacade.findOne({ id });

    // 2. Check if template exists, if not throw exception
    if (!template) {
      this.exceptionsService.notFoundException(
        TemplateExceptionMessages.TEMPLATE_002,
      );
    }

    try {
      // 3. delete template file
      await this.s3Service.deleteFile(template.path);

      // 4. Delete the template
      const deleted = await this.templateFacade.delete(template.id);

      return deleted;
    } catch (error) {
      this.logger.error({
        ...TemplateExceptionMessages.TEMPLATE_003,
        error: JSONStringifyError(error),
      });
      this.exceptionsService.badRequestException(
        TemplateExceptionMessages.TEMPLATE_003,
      );
    }
  }
}
