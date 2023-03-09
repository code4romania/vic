import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { IAnnouncementModel } from 'src/modules/announcement/models/announcement.model';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import { GetOneAnnouncementUseCase } from 'src/usecases/announcement/get-one-announcement.usecase';

@Injectable()
export class AnnouncementGuard implements CanActivate {
  constructor(private getOneAnnouncementUseCase: GetOneAnnouncementUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const announcementId: string = request?.params?.id;
    const user: AdminUserEntity = request.user;

    if (!user) return false;
    if (!announcementId) return true;

    const announcement: IAnnouncementModel =
      await this.getOneAnnouncementUseCase.execute({
        id: announcementId,
      });

    if (announcement.organizationId !== user.organizationId) return false;

    return true;
  }
}
