import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { TemplateExceptionMessages } from 'src/modules/documents/exceptions/template.exceptions';
import {
  ITemplateModel,
  UpdateTemplateOptions,
} from 'src/modules/documents/models/template.model';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';

@Injectable()
export class UpdateTemplateUsecase implements IUseCaseService<ITemplateModel> {
  constructor(
    private readonly templateFacade: TemplateFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(
    id: string,
    options: UpdateTemplateOptions,
  ): Promise<ITemplateModel> {
    const updated = await this.templateFacade.update(id, options);

    if (!updated) {
      this.exceptionsService.notFoundException(
        TemplateExceptionMessages.TEMPLATE_002,
      );
    }

    return updated;
  }
}
