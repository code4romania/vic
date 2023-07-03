import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { TemplateExceptionMessages } from 'src/modules/documents/exceptions/template.exceptions';
import {
  FindTemplateOptions,
  ITemplateModel,
} from 'src/modules/documents/models/template.model';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';

@Injectable()
export class GetOneTemplateUseCase implements IUseCaseService<ITemplateModel> {
  constructor(
    private readonly templateFacade: TemplateFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(
    findOptions: FindTemplateOptions,
  ): Promise<ITemplateModel> {
    const template = await this.templateFacade.findOne(findOptions);

    if (!template)
      this.exceptionsService.notFoundException(
        TemplateExceptionMessages.TEMPLATE_002,
      );

    return template;
  }
}
