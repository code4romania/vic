import { Injectable, Logger } from '@nestjs/common';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { TemplateExceptionMessages } from 'src/modules/documents/exceptions/template.exceptions';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';
import { GetOneTemplateUseCase } from './get-one-template.usecase';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { ContractStatus } from 'src/modules/documents/enums/contract-status.enum';

@Injectable()
export class DeleteTemplateUseCase implements IUseCaseService<string> {
  private readonly logger = new Logger(DeleteTemplateUseCase.name);
  constructor(
    private readonly getOneTemplateUsecase: GetOneTemplateUseCase,
    private readonly templateFacade: TemplateFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly s3Service: S3Service,
    private readonly contractsFacade: ContractFacade,
  ) {}

  public async execute(id: string, organizationId: string): Promise<string> {
    // 1. Find the template
    const template = await this.getOneTemplateUsecase.execute({
      id,
      organizationId,
    });

    try {
      // 2. check if there are any contracts with ContractStatus.PENDING_VOLUNTEER
      const contract = await this.contractsFacade.findOne({
        templateId: id,
        status: ContractStatus.PENDING_VOLUNTEER,
      });

      // if no contract file we can delete the file from s3 otherwise we just delete the entry
      if (!contract) {
        // 3. delete template file
        await this.s3Service.deleteFile(template.path);
      }

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
