import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import { GetOneOrganizationStructureUseCase } from 'src/usecases/organization/organization-structure/get-one-organization-structure.usecase';
import { IOrganizationStructureModel } from '../models/organization-structure.model';

@Injectable()
export class OrganizationStructureGuard implements CanActivate {
  constructor(
    private getOneOrganizationStructureUseCase: GetOneOrganizationStructureUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const organizationStructureId: string = request?.params?.id;
    const user: AdminUserEntity = request.user;

    if (!user) return false;
    if (!organizationStructureId) return true;

    const organizationStructure: IOrganizationStructureModel =
      await this.getOneOrganizationStructureUseCase.execute({
        id: organizationStructureId,
      });

    if (organizationStructure.organizationId !== user.organizationId)
      return false;

    return true;
  }
}
