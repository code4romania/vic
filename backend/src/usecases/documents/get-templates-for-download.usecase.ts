import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  FindManyTemplatesOptions,
  ITemplateDownloadModel,
} from 'src/modules/documents/models/template.model';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';

@Injectable()
export class GetTemplatesForDownloadUsecase
  implements IUseCaseService<ITemplateDownloadModel[]>
{
  constructor(private readonly templateFacade: TemplateFacade) {}

  public async execute(
    findOptions: FindManyTemplatesOptions,
  ): Promise<ITemplateDownloadModel[]> {
    const templates = await this.templateFacade.findMany({
      ...findOptions,
      limit: 0,
      page: 0,
    });

    return templates.items.map((template): ITemplateDownloadModel => {
      return {
        Denumire: template.name,
        Utilizari: template.numberOfContracts,
      };
    });
  }
}
