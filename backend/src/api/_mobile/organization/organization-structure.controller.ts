import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { OrganizationStructureGuard } from 'src/api/organization/guards/organization-structure.guard';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { OrganizationStructureItemPresenter } from './presenters/organization-structure-item.presenter';
import { GetAllOrganizationStructureByTypeUseCase } from 'src/usecases/organization/organization-structure/get-all-organization-structure-by-type.usecase';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard, OrganizationStructureGuard)
@Controller('mobile/organization-structure')
export class MobileOrganizationStructureController {
  constructor(
    private readonly getAllStructureUsecase: GetAllOrganizationStructureByTypeUseCase,
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
    // @ExtractUser() { id }: IRegularUserModel, // TODO: validate user
  ): Promise<OrganizationStructureItemPresenter[]> {
    const structures = await this.getAllStructureUsecase.execute(
      type,
      organizationId,
    );

    return structures.map(
      (structure) => new OrganizationStructureItemPresenter(structure),
    );
  }
}
