import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { ALL_NEWS_EVENTS } from 'src/modules/actions-archive/enums/news-type.enum';

// The red badge on the Home bell: the volunteer's "Noutăți" (every tab) newer than the last time
// they opened the screen.
@Injectable()
export class GetUnreadNewsCountUsecase implements IUseCaseService<number> {
  constructor(private readonly actionsArchiveFacade: ActionsArchiveFacade) {}

  public async execute(userId: string): Promise<number> {
    return this.actionsArchiveFacade.countUnreadNews({
      userId,
      events: ALL_NEWS_EVENTS,
    });
  }
}
