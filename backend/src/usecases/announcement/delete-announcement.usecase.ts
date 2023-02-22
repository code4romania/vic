import { Injectable, Logger } from '@nestjs/common';
import { IError } from 'src/common/exceptions/exceptions.interface';
import { JSONStringifyError } from 'src/common/helpers/stringify-error';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AnnouncementExceptionMessages } from 'src/modules/announcement/exceptions/announcement.exceptions';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';

@Injectable()
export class DeleteAnnouncementUseCase implements IUseCaseService<string> {
  private readonly logger = new Logger(DeleteAnnouncementUseCase.name);

  constructor(
    private readonly announcementFacade: AnnouncementFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(id: string): Promise<string> {
    try {
      // 1. Delete the announcement
      return this.announcementFacade.delete(id);
    } catch (error) {
      // create new error object to log
      const loggedError: IError<string> = {
        error: JSONStringifyError(error),
        businessError: AnnouncementExceptionMessages.ANNOUNCEMENT_004,
        data: id,
      };

      // log the created error
      this.logger.error(loggedError);

      // throw excepition for failing to delete the announcement
      this.exceptionsService.internalServerErrorException(
        AnnouncementExceptionMessages.ANNOUNCEMENT_004,
      );
    }
  }
}
