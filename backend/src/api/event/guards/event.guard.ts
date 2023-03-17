import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import { GetOneEventUseCase } from 'src/usecases/event/get-one-event.usecase';
import { IEventModel } from 'src/modules/event/models/event.model';

@Injectable()
export class EventGuard implements CanActivate {
  constructor(private getOneEventUseCase: GetOneEventUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const eventId: string = request?.params?.id;
    const user: AdminUserEntity = request?.user;

    if (!user) return false;
    if (!eventId) return true; // Skip endpoints without IDs

    const event: IEventModel = await this.getOneEventUseCase.execute({
      id: eventId,
    });

    if (event?.organization?.id !== user.organizationId) return false;

    return true;
  }
}
