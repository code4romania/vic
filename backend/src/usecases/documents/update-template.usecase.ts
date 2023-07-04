import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import {
  ITemplateModel,
  UpdateTemplateOptions,
} from 'src/modules/documents/models/template.model';
import { TemplateFacade } from 'src/modules/documents/services/template.facade';
import { GetOneTemplateUseCase } from './get-one-template.usecase';

@Injectable()
export class UpdateTemplateUsecase implements IUseCaseService<ITemplateModel> {
  constructor(
    private readonly getOneTemplateUsecase: GetOneTemplateUseCase,
    private readonly templateFacade: TemplateFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(
    id: string,
    organizationId: string,
    options: UpdateTemplateOptions,
  ): Promise<ITemplateModel> {
    // validate if template exists
    await this.getOneTemplateUsecase.execute({ id, organizationId });

    // update template name
    const updated = await this.templateFacade.update(id, options);

    return updated;
  }
}
