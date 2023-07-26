import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { EventExceptionMessages } from 'src/modules/event/exceptions/event.exceptions';
import {
  FindOneEventOptions,
  IEventModel,
} from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';

@Injectable()
export class GetOneEventUseCase implements IUseCaseService<IEventModel> {
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(findOptions: FindOneEventOptions): Promise<IEventModel> {
    const event = await this.eventFacade.find(findOptions);

    if (!event) {
      this.exceptionService.badRequestException(
        EventExceptionMessages.EVENT_001,
      );
    }

    return {
      ...event,
      ...(event.poster
        ? {
            poster: await this.s3Service.generatePresignedURL(event.poster),
          }
        : {}),
    };
  }
}
