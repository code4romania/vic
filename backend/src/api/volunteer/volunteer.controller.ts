import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { PaginatedPresenter } from 'src/infrastructure/presenters/generic-paginated.presenter';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetManyVolunteersUseCase } from 'src/usecases/volunteer/get-many-volunteers.usecase';
import { GetOneVolunteerUsecase } from 'src/usecases/volunteer/get-one-volunteer.usecase';
import { GetVolunteersDto } from './dto/get-volunteers.dto';
import { VolunteerPresenter } from './presenters/volunteer.presenter';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('volunteer')
export class VolunteerController {
  constructor(
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly getManyVolunteersUsecase: GetManyVolunteersUseCase,
  ) {}

  @Get()
  // @ApiPaginatedResponse(AccessRequestPresenter)
  async getMany(
    @Query() filters: GetVolunteersDto,
    @ExtractUser() user: IAdminUserModel,
  ): Promise<PaginatedPresenter<unknown>> {
    const volunteers = await this.getManyVolunteersUsecase.execute(
      user.organizationId,
    );

    return new PaginatedPresenter({
      ...volunteers,
      // items: volunteers.items.map(
      //   (accessRequest) => new AccessRequestPresenter(accessRequest),
      // ),
    });
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getOne(
    @Param('id', UuidValidationPipe) volunteerId: string,
  ): Promise<VolunteerPresenter> {
    const volunteer = await this.getOneVolunteerUsecase.execute(volunteerId);
    return new VolunteerPresenter(volunteer);
  }
}
