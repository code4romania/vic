import { Injectable, Logger } from '@nestjs/common';
import { S3_FILE_PATHS } from 'src/common/constants/constants';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ContractExceptionMessages } from 'src/modules/documents/exceptions/contract.exceptions';
import { TemplateExceptionMessages } from 'src/modules/documents/exceptions/template.exceptions';
import { ITemplateModel } from 'src/modules/documents/models/template.model';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';

const isPdf = (file?: Express.Multer.File): boolean =>
  file?.mimetype === 'application/pdf' &&
  file.buffer?.subarray(0, 5).toString('latin1') === '%PDF-';

// "Template-uri" on Contracte și documente: blank contract models (name + PDF) the NGO keeps for
// download. No generation and no signing in VIC (#486): the signed contract is uploaded separately.
@Injectable()
export class ContractModelsUsecase {
  private readonly logger = new Logger(ContractModelsUsecase.name);

  constructor(
    private readonly templateFacade: TemplateFacade,
    private readonly s3Service: S3Service,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async list(organizationId: string): Promise<ITemplateModel[]> {
    const templates = await this.templateFacade.findAll({
      organizationId,
      search: '',
    });
    return Promise.all(
      templates
        .sort((a, b) => a.name.localeCompare(b.name, 'ro'))
        .map(async (template) => ({
          ...template,
          path: await this.s3Service.generatePresignedURL(template.path),
        })),
    );
  }

  public async create(
    organizationId: string,
    name: string,
    file?: Express.Multer.File,
  ): Promise<ITemplateModel> {
    if (!isPdf(file)) {
      this.exceptionsService.badRequestException(
        ContractExceptionMessages.CONTRACT_008,
      );
    }

    try {
      const path = await this.s3Service.uploadFile(
        `${S3_FILE_PATHS.TEMPLATES}/${organizationId}`,
        file,
      );
      const template = await this.templateFacade.create({
        name: name.trim(),
        organizationId,
        path,
      });
      return {
        ...template,
        path: await this.s3Service.generatePresignedURL(template.path),
      };
    } catch (error) {
      this.logger.error({
        ...TemplateExceptionMessages.TEMPLATE_001,
        error: JSONStringifyError(error),
      });
      this.exceptionsService.badRequestException(
        TemplateExceptionMessages.TEMPLATE_001,
      );
    }
  }

  public async delete(organizationId: string, id: string): Promise<string> {
    const template = await this.templateFacade.findOne({ id, organizationId });
    if (!template) {
      this.exceptionsService.notFoundException(
        TemplateExceptionMessages.TEMPLATE_002,
      );
    }

    try {
      // contracts generated from it before VIC 2.0 keep their own PDF; only the model goes away
      const deleted = await this.templateFacade.delete(template.id);
      await this.s3Service.deleteFile(template.path);
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
