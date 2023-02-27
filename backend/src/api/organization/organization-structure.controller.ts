import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { CreateOrganizationStructureUseCase } from 'src/usecases/organization/organization-structure/create-organization-structure.usecase';
import { DeleteOrganizationStructureUseCase } from 'src/usecases/organization/organization-structure/delete-organization-structure.usecase';
import { GetAllOrganizationStructureUseCase } from 'src/usecases/organization/organization-structure/get-all-organization-structure.usecase';
import { UpdateOrganizationStructureUseCase } from 'src/usecases/organization/organization-structure/update-organization-structure.usecase';
import { CreateOrganizationStructureDto } from './dto/create-org-structure.dto';
import { UpdateOrganizationStructureDto } from './dto/update-org-structure.dto';
import { OrganizationStructurePresenter } from './presenters/organization-structure.presenter';
import { OrganizationStructureGuard } from 'src/api/organization/guards/organization-structure.guard';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { GetAllOrganizationStructureByTypeUseCase } from 'src/usecases/organization/organization-structure/get-all-organization-structure-by-type.usecase';
import { OrganizationStructureListItemPresenter } from './presenters/organization-structure-list-item.presenter';

// @Roles(Role.ADMIN)
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard, OrganizationStructureGuard)
@Controller('organization-structure')
export class OrganizationStructureController {
  constructor(
    private readonly createStructureUsecase: CreateOrganizationStructureUseCase,
    private readonly getAllStructureUsecase: GetAllOrganizationStructureUseCase,
    private readonly deleteStructureUsecase: DeleteOrganizationStructureUseCase,
    private readonly updateStructureUsecase: UpdateOrganizationStructureUseCase,
    private readonly getAllStructureByTypeUseCase: GetAllOrganizationStructureByTypeUseCase,
  ) {}

  @ApiParam({ name: 'type', type: String, enum: OrganizationStructureType })
  @ApiPaginatedResponse(OrganizationStructurePresenter)
  @Get(':type')
  async getAllPaginated(
    @Param('type') type: OrganizationStructureType,
    @Query() filters: BasePaginationFilterDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<OrganizationStructurePresenter>> {
    const accessCodes = await this.getAllStructureUsecase.execute({
      ...filters,
      type,
      organizationId,
    });

    return new PaginatedPresenter({
      ...accessCodes,
      items: accessCodes.items.map(
        (accessCode) => new OrganizationStructurePresenter(accessCode),
      ),
    });
  }

  // TODO: Add cacheing on this one
  @ApiParam({ name: 'type', type: String, enum: OrganizationStructureType })
  @Get(':type/all')
  async getAll(
    @Param('type') type: OrganizationStructureType,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<OrganizationStructureListItemPresenter[]> {
    const organizationStructures =
      await this.getAllStructureByTypeUseCase.execute(type, organizationId);

    return organizationStructures.map(
      (structure) => new OrganizationStructureListItemPresenter(structure),
    );
  }

  @ApiBody({ type: CreateOrganizationStructureDto })
  @Post()
  async create(
    @Body() { name, type }: CreateOrganizationStructureDto,
    @ExtractUser() { organizationId, id }: IAdminUserModel,
  ): Promise<OrganizationStructurePresenter> {
    const structure = await this.createStructureUsecase.execute({
      name,
      type,
      organizationId: organizationId,
      createdById: id,
    });
    return new OrganizationStructurePresenter(structure);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateOrganizationStructureDto })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() { name }: UpdateOrganizationStructureDto,
  ): Promise<OrganizationStructurePresenter> {
    const accessCodeModel = await this.updateStructureUsecase.execute({
      id,
      name,
    });
    return new OrganizationStructurePresenter(accessCodeModel);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(@Param('id', UuidValidationPipe) id: string): Promise<string> {
    return this.deleteStructureUsecase.execute(id);
  }
}
