import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyDocumentTemplateListViewOptions,
  IDocumentTemplateListViewModel,
} from 'src/modules/documents/models/document-template-list-view.model';
import { DocumentTemplateFacade } from 'src/modules/documents/services/document-template.facade';

@Injectable()
export class GetManyDocumentTemplatesUsecase
  implements IUseCaseService<Pagination<IDocumentTemplateListViewModel>>
{
  constructor(
    private readonly documentTemplateFacade: DocumentTemplateFacade,
  ) {}

  public async execute(
    findOptions: FindManyDocumentTemplateListViewOptions,
  ): Promise<Pagination<IDocumentTemplateListViewModel>> {
    return this.documentTemplateFacade.findMany(findOptions);
  }
}
