import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

// @Roles(Role.ADMIN)
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('organization-structure')
export class OrganizationStructureController {
  constructor(
    private readonly createStructureUsecase: CreateOrganizationStructureUseCase,
    private readonly getAllStructureUsecase: GetAllOrganizationStructureUseCase,
    private readonly deleteStructureUsecase: DeleteOrganizationStructureUseCase,
    private readonly updateStructureUsecase: UpdateOrganizationStructureUseCase,
  ) {}

  @ApiParam({ name: 'type', type: String, enum: OrganizationStructureType })
  @Get(':type')
  async getAll(
    @Param('type') type: OrganizationStructureType,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<OrganizationStructurePresenter[]> {
    const accessCodes = await this.getAllStructureUsecase.execute({
      type,
      organizationId,
    });

    return accessCodes.map(
      (accessCode) => new OrganizationStructurePresenter(accessCode),
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
  async delete(
    @Param('id', UuidValidationPipe) id: string,
  ): Promise<OrganizationStructurePresenter> {
    const removed = await this.deleteStructureUsecase.execute(id);
    return new OrganizationStructurePresenter(removed);
  }
}
