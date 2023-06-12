import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  CreateTemplateOptions,
  ITemplateModel,
} from 'src/modules/documents/models/template.model';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';

@Injectable()
export class CreateTemplateUsecase implements IUseCaseService<ITemplateModel> {
  constructor(private readonly templateFacade: TemplateFacade) {}

  public async execute(
    options: CreateTemplateOptions,
    files: Express.Multer.File[],
  ): Promise<ITemplateModel> {
    const newTemplate = await this.templateFacade.create(options);
    return newTemplate;
  }
}
