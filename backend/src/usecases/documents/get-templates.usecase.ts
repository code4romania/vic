import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import {
  FindManyTemplatesOptions,
  ITemplateModel,
} from 'src/modules/documents/models/template.model';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';

@Injectable()
export class GetTemplatesUsecase
  implements IUseCaseService<Pagination<ITemplateModel>>
{
  constructor(
    private readonly templateFacade: TemplateFacade,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(
    findOptions: FindManyTemplatesOptions,
  ): Promise<Pagination<ITemplateModel>> {
    const templates = await this.templateFacade.findMany(findOptions);

    // TODO: review this
    const itemsWithPaths = await Promise.all(
      templates.items.map(async (template) => ({
        ...template,
        path: await this.s3Service.generatePresignedURL(template.path),
      })),
    );

    return {
      ...templates,
      items: itemsWithPaths,
    };
  }
}
