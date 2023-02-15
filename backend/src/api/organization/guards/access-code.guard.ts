import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import { GetAccessCodeUseCase } from 'src/usecases/access-code/get-access-code.usecase';
import { IAccessCodeModel } from 'src/modules/organization/models/access-code.model';

@Injectable()
export class AccessCodeGuard implements CanActivate {
  constructor(private getAccessCodeUseCase: GetAccessCodeUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const accessCodeId: string = request?.params?.id;
    const user: AdminUserEntity = request.user;

    if (!user) return false;
    if (!accessCodeId) return true;

    const accessCode: IAccessCodeModel =
      await this.getAccessCodeUseCase.execute(accessCodeId);

    if (accessCode.organizationId !== user.organizationId) return false;

    return true;
  }
}
