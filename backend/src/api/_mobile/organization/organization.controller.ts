import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { GetOrganizationsUseCase } from 'src/usecases/organization/get-organizations.usecase';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { OrganizationListItemPresenter } from './presenters/organization-list-item.presenter';
import { GetManyOrganizationsDto } from './dto/get-many-organizations.dto';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/organization')
export class MobileOrganizationController {
  constructor(
    private readonly getOrganizationsUseCase: GetOrganizationsUseCase,
  ) {}

  @Get()
  @ApiPaginatedResponse(OrganizationListItemPresenter)
  async getAll(
    @Query() filters: GetManyOrganizationsDto,
    @ExtractUser() user: IRegularUserModel,
  ): Promise<PaginatedPresenter<OrganizationListItemPresenter>> {
    const organizations = await this.getOrganizationsUseCase.execute({
      ...filters,
    });

    return new PaginatedPresenter<OrganizationListItemPresenter>({
      ...organizations,
      items: organizations.items.map(
        (organization) => new OrganizationListItemPresenter(organization),
      ),
    });
  }
}
