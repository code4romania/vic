import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { GetOneRegularUserUseCase } from './get-one-regular-user.usecase';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { SwitchOrganizationUsecase } from '../organization/switch-organization.usecase';

@Injectable()
export class SyncUserOrganizationsUsecase implements IUseCaseService<void> {
  constructor(
    private readonly getRegularUserUsecase: GetOneRegularUserUseCase,
    private readonly organizationsFacade: OrganizationFacadeService,
    private readonly switchOrganizationUsecase: SwitchOrganizationUsecase,
    private readonly userFacade: UserFacadeService,
  ) {}

  async execute(userId: string, removedOrganizationId: string): Promise<void> {
    const user = await this.getRegularUserUsecase.execute({
      id: userId,
    });

    // 2. check if the active organization is the one archived/blocked
    if (user.activeOrganization?.id === removedOrganizationId) {
      // 2.1 get my organization profiles
      const profiles = await this.organizationsFacade.findMyOrganizations(
        user.id,
      );

      // 2.2. swith organization to one of the other profiles
      if (profiles.length > 0) {
        await this.switchOrganizationUsecase.execute(profiles[0].id, user.id);
      } else {
        // 2.2.1 if there is no other profile set use active organization to null
        this.userFacade.updateRegularUser(user.id, {
          activeOrganizationId: null,
        });
      }
    }
  }
}
