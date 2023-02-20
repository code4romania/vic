import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  IAnnouncementModel,
  IFindAllAnnouncementModel,
} from 'src/modules/announcement/models/announcement.model';
import { AnnouncementFacade } from 'src/modules/announcement/services/announcement.facade';

@Injectable()
export class GetAllAnnouncementUseCase
  implements IUseCaseService<IAnnouncementModel[]>
{
  constructor(private readonly announcementFacade: AnnouncementFacade) {}

  public async execute(
    findOptions: IFindAllAnnouncementModel,
  ): Promise<IAnnouncementModel[]> {
    return this.announcementFacade.findAll(findOptions);
  }
}
