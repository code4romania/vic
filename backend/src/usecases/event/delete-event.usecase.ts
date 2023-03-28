import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOneEventUseCase } from './get-one-event.usecase';

@Injectable()
export class DeleteEventUseCase implements IUseCaseService<string> {
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(id: string, admin: IAdminUserModel): Promise<string> {
    const toBeDeleted = await this.getOneEventUseCase.execute({ id });

    const deleted = await this.eventFacade.delete(id);

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.DELETE_EVENT,
      {
        eventId: toBeDeleted.id,
        eventName: toBeDeleted.name,
      },
      admin,
    );

    return deleted;
  }
}
