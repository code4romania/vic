import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';

@Injectable()
export class DeleteAnnouncementUseCase implements IUseCaseService<string> {
  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(id: string): Promise<string> {
    // 1. Find the announcement
    const announcement = await this.announcementFacade.find({ id });

    // 2. Check if announcement exists, if not throw exception
    if (!announcement) {
      this.exceptionsService.notFoundException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_001,
      );
    }

    // 2. Delete the announcement
    return this.announcementFacade.delete(announcement.id);
  }
}
