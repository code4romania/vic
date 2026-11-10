import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { MobileProfileGuard } from '../common/guards/mobile-profile.guard';
import { MobileOwnershipService } from 'src/usecases/volunteer/mobile-ownership.service';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { OrganizationStructureItemPresenter } from './presenters/organization-structure-item.presenter';
import { GetAllOrganizationStructureByTypeUseCase } from 'src/usecases/organization/organization-structure/get-all-organization-structure-by-type.usecase';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard, MobileProfileGuard)
@Controller('mobile/organization-structure')
export class MobileOrganizationStructureController {
  constructor(
    private readonly getAllStructureUsecase: GetAllOrganizationStructureByTypeUseCase,
    private readonly ownership: MobileOwnershipService,
  ) {}

  @ApiParam({ name: 'type', type: String, enum: OrganizationStructureType })
  @ApiParam({
    name: 'organizationId',
    type: String,
  })
  @Get(':type/organization/:organizationId')
  async getAll(
    @Param('type') type: OrganizationStructureType,
    @Param('organizationId', UuidValidationPipe) organizationId: string,
    @ExtractUser() { id }: IRegularUserModel,
  ): Promise<OrganizationStructureItemPresenter[]> {
    // Only for the NGOs the user volunteers in (not blocked)
    if (!(await this.ownership.volunteerInOrganization(id, organizationId))) {
      return [];
    }

    const structures = await this.getAllStructureUsecase.execute(
      type,
      organizationId,
    );

    return structures.map(
      (structure) => new OrganizationStructureItemPresenter(structure),
    );
  }
}
