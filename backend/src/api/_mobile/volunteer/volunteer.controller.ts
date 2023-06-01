import { Body, Param, UseGuards } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
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

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile/volunteer')
export class MobileVolunteerController {
  constructor(
    private readonly createVolunteerProfileUseCase: CreateVolunteerProfileUseCase,
    private readonly joinOrganizationByAccessCodeUsecase: JoinOrganizationByAccessCodeUsecase,
  ) {}

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
      volunteerId: volunteerId,
    });

    return new VolunteerProfilePresenter(profile);
  }
}
