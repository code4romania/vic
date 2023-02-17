import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import { GetAccessRequestUseCase } from 'src/usecases/access-request/get-access-request.usecase';
import { IAccessRequestModel } from 'src/modules/access-request/model/access-request.model';

@Injectable()
export class AccessRequestGuard implements CanActivate {
  constructor(private getAccessRequestUseCase: GetAccessRequestUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const accessRequestId: string = request?.params?.id;
    const user: AdminUserEntity = request.user;

    if (!user) return false;
    if (!accessRequestId) return true;

    const accessRequest: IAccessRequestModel =
      await this.getAccessRequestUseCase.execute(accessRequestId);

    if (accessRequest.organizationId !== user.organizationId) return false;

    return true;
  }
}
