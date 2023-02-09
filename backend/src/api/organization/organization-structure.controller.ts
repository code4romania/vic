import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { CreateOrganizationStructureUseCase } from 'src/usecases/organization/organization-structure/create-organization-structure.usecase';
import { DeleteOrganizationStructureUseCase } from 'src/usecases/organization/organization-structure/delete-organization-structure.usecase';
import { GetAllOrganizationStructureUseCase } from 'src/usecases/organization/organization-structure/get-all-organization-structure.usecase';
import { UpdateOrganizationStructureUseCase } from 'src/usecases/organization/organization-structure/update-organization-structure.usecase';
import { CreateOrganizationStructureDto } from './dto/create-org-structure.dto';
import { UpdateOrganizationStructureDto } from './dto/update-org-structure.dto';
import { OrganizationStructurePresenter } from './presenters/organization-structure.presenter';

// @Roles(Role.ADMIN)
// @UseGuards(WebJwtAuthGuard)
// @UsePipes(new UuidValidationPipe())
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
  ): Promise<OrganizationStructurePresenter[]> {
    const accessCodes = await this.getAllStructureUsecase.execute({
      type,
      organizationId: '3631315f-02f1-42c9-a418-8bff2e15fb2d', // TODO: replace with organization from @User request
    });

    return accessCodes.map(
      (accessCode) => new OrganizationStructurePresenter(accessCode),
    );
  }

  @ApiBody({ type: CreateOrganizationStructureDto })
  @Post()
  async create(
    @Body() { name, type }: CreateOrganizationStructureDto,
  ): Promise<OrganizationStructurePresenter> {
    const structure = await this.createStructureUsecase.execute({
      name,
      type,
      organizationId: '3631315f-02f1-42c9-a418-8bff2e15fb2d', // TODO: replace with organization from @User request
      createdById: '6e5ca126-2c04-4403-a641-53345da26ef8', // TODO: replace with user from @User request
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
