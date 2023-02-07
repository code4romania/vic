import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { ICreateAccessCodeModel } from 'src/modules/organization/models/access-code.model';
import { CreateAccessCodeUseCase } from 'src/usecases/access-code/create-access-code.usecase';
import { GetOrganizationUseCaseService } from 'src/usecases/organization/get-organization-use-case.service';
import { UpdateOrganizationDescriptionUseCaseService } from 'src/usecases/organization/update-organization-description-use-case.service';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { UpdateOrganizationDescriptionDto } from './dto/update-organization-description.dto';
import { AccessCodePresenter } from './presenters/access-code.presenter';
import { IOrganizationPresenter } from './presenters/organization-presenter.interface';

// @Roles(Role.ADMIN)
// @UseGuards(WebJwtAuthGuard)
// @UsePipes(new UuidValidationPipe())
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly getOrganizationUseCase: GetOrganizationUseCaseService,
    private readonly updateOrganizationDescriptionUseCase: UpdateOrganizationDescriptionUseCaseService,
    private readonly createAccessCodeUseCase: CreateAccessCodeUseCase,
  ) {}

  // TODO: the organization id will be retrieved from the user once it is implemented
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  getOrganization(
    @Param('id') organizationid: string,
  ): Promise<IOrganizationPresenter> {
    return this.getOrganizationUseCase.execute(organizationid);
  }

  // TODO: the organization id will be retrieved from the user once it is implemented
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateOrganizationDescriptionDto })
  @Patch(':id')
  patchOrganization(
    @Param('id') organizationid: string,
    @Body() { description }: UpdateOrganizationDescriptionDto,
  ): Promise<IOrganizationPresenter> {
    return this.updateOrganizationDescriptionUseCase.execute(
      organizationid,
      description,
    );
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: CreateAccessCodeDto })
  @Post(':id/access-code')
  async createAccessCode(
    @Param('id') organizationid: string,
    @Body() { code, startDate, endDate }: CreateAccessCodeDto,
  ): Promise<AccessCodePresenter> {
    const accessCodeModel = await this.createAccessCodeUseCase.execute({
      code,
      startDate,
      endDate,
      organizationId: organizationid,
      createdById: '6e5ca126-2c04-4403-a641-53345da26ef8',
    });
    return new AccessCodePresenter(accessCodeModel);
  }
}
