import { Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { VolunteerProfilePresenter } from 'src/api/volunteer/presenters/volunteer-profile.presenter';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { CreateVolunteerProfileUseCase } from 'src/usecases/volunteer/create-volunteer-profile.usecase';
import { CreateVolunteerProfileDto } from './dto/create-volunteer-profile.dto';
import { JoinByAccessCodeDto } from './dto/join-by-access-code.dto';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { JoinOrganizationByAccessCodeUsecase } from 'src/usecases/volunteer/join-organization-by-access-code.usecase';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { VolunteerPresenter } from 'src/api/volunteer/presenters/volunteer.presenter';
import { VolunteerMobileGuard } from './guards/volunteer-mobile.guard';
import { GetVolunteerProfileUsecase } from 'src/usecases/volunteer/get-volunteer-profile.usecase';
import { UpdateVolunteerProfileDto } from './dto/update-volunteer-profile.dto';
import { UpdateVolunteerProfileUsecase } from 'src/usecases/volunteer/update-volunteer-profile.usecase';
import { GetVolunteerOrganizationStatusUsecase } from 'src/usecases/volunteer/get-volunteer-organization-status.usecase';
import { VolunteerStatsPresenter } from './presenters/volunteer-stats.presenter';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile/volunteer')
export class MobileVolunteerController {
  constructor(
    private readonly createVolunteerProfileUseCase: CreateVolunteerProfileUseCase,
    private readonly joinOrganizationByAccessCodeUsecase: JoinOrganizationByAccessCodeUsecase,
    private readonly getVolunteerProfileUsecase: GetVolunteerProfileUsecase,
    private readonly updateVolunteerProfileUsecase: UpdateVolunteerProfileUsecase,
    private readonly getVolunteerOrganizationStatusUsecase: GetVolunteerOrganizationStatusUsecase,
  ) {}

  @Get(':id')
  async getVolunteerProfile(
    @Param('id', UuidValidationPipe) volunteerId: string,
  ): Promise<VolunteerPresenter> {
    const volunteer = await this.getVolunteerProfileUsecase.execute(
      volunteerId,
    );

    return new VolunteerPresenter(volunteer);
  }

  @Get(':id/organization')
  async getVolunteerOrganizationStats(
    @Param('id', UuidValidationPipe) volunteerId: string,
  ): Promise<VolunteerStatsPresenter> {
    const volunteer = await this.getVolunteerOrganizationStatusUsecase.execute(
      volunteerId,
    );

    return new VolunteerStatsPresenter(volunteer);
  }

  @ApiBody({ type: JoinByAccessCodeDto })
  @Post('access-code')
  async joinOrganizationByAccessCode(
    @Body() { code, organizationId }: JoinByAccessCodeDto,
    @ExtractUser() user: IRegularUserModel,
  ): Promise<VolunteerPresenter> {
    const volunteer = await this.joinOrganizationByAccessCodeUsecase.execute({
      code,
      organizationId,
      requestedById: user.id,
    });

    return new VolunteerPresenter(volunteer);
  }

  @UseGuards(VolunteerMobileGuard)
  @ApiBody({ type: CreateVolunteerProfileDto })
  @Post(':id/profile')
  async createProfile(
    @Param('id', UuidValidationPipe) volunteerId: string,
    @Body() profileDTO: CreateVolunteerProfileDto,
  ): Promise<VolunteerProfilePresenter> {
    const profile = await this.createVolunteerProfileUseCase.execute({
      email: profileDTO.email,
      phone: profileDTO.phone,
      activeSince: profileDTO.activeSince,
      branchId: profileDTO.branchId,
      departmentId: profileDTO.departmentId,
      roleId: profileDTO.roleId,
      volunteerId,
    });

    return new VolunteerProfilePresenter(profile);
  }

  @UseGuards(VolunteerMobileGuard)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateVolunteerProfileDto })
  @Patch(':id/profile')
  async update(
    @Param('id', UuidValidationPipe) volunteerId: string,
    @Body() updatesDTO: UpdateVolunteerProfileDto,
    @ExtractUser() user: IRegularUserModel,
  ): Promise<VolunteerPresenter> {
    const volunteer = await this.updateVolunteerProfileUsecase.execute(
      volunteerId,
      updatesDTO,
      user,
    );
    return new VolunteerPresenter(volunteer);
  }
}
