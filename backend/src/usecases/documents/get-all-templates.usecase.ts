import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  FindTemplateOptions,
  ITemplateModel,
} from 'src/modules/documents/models/template.model';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';

@Injectable()
export class GetAllTemplatesUsecase
  implements IUseCaseService<ITemplateModel[]>
{
  constructor(private readonly templateFacade: TemplateFacade) {}

  public async execute(
    findOptions: FindTemplateOptions,
  ): Promise<ITemplateModel[]> {
    return this.templateFacade.findAll(findOptions);
  }
}
