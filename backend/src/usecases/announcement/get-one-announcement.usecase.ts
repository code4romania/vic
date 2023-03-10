import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import {
  FindAnnouncementOptions,
  IAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';

@Injectable()
export class GetOneAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel>
{
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(
    findOptions: FindAnnouncementOptions,
  ): Promise<IAnnouncementModel> {
    const announcement = await this.announcementFacade.find(findOptions);

    if (!announcement)
      this.exceptionsService.notFoundException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_001,
      );

    return announcement;
  }
}
