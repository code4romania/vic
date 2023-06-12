import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyTemplatesOptions,
  ITemplateModel,
} from 'src/modules/documents/models/template.model';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';

@Injectable()
export class GetTemplatesUsecase
  implements IUseCaseService<Pagination<ITemplateModel>>
{
  constructor(private readonly templateFacade: TemplateFacade) {}

  public async execute(
    findOptions: FindManyTemplatesOptions,
  ): Promise<Pagination<ITemplateModel>> {
    return this.templateFacade.findMany(findOptions);
  }
}
