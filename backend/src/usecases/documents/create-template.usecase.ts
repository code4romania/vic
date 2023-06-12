import { Injectable, Logger } from '@nestjs/common';
import { S3_FILE_PATHS } from 'src/common/constants/constants';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { TemplateExceptionMessages } from 'src/modules/documents/exceptions/template.exceptions';
import {
  CreateTemplateOptions,
  ITemplateModel,
} from 'src/modules/documents/models/template.model';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';

@Injectable()
export class CreateTemplateUsecase implements IUseCaseService<ITemplateModel> {
  private readonly logger = new Logger(CreateTemplateUsecase.name);
  constructor(
    private readonly templateFacade: TemplateFacade,
    private readonly s3Service: S3Service,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    options: Omit<CreateTemplateOptions, 'path'>,
    files: Express.Multer.File[],
  ): Promise<ITemplateModel> {
    try {
      // 1. upload file to s3 and get the path
      const path = await this.s3Service.uploadFile(
        `${S3_FILE_PATHS.TEMPLATES}/${options.organizationId}`,
        files[0],
      );

      // 2, generate the new template
      const newTemplate = await this.templateFacade.create({
        ...options,
        path,
      });

      // return the template with presigned path
      return {
        ...newTemplate,
        path: await this.s3Service.generatePresignedURL(newTemplate.path),
      };
    } catch (error) {
      // log error
      this.logger.error({
        ...TemplateExceptionMessages.TEMPLATE_001,
        error: JSONStringifyError(error),
      });
      // error while uploading file to s3
      this.exceptionService.badRequestException(
        TemplateExceptionMessages.TEMPLATE_001,
      );
    }
  }
}
