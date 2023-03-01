import { Body, Param } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { VolunteerProfilePresenter } from 'src/api/volunteer/presenters/volunteer-profile.presenter';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { CreateVolunteerProfileUseCase } from 'src/usecases/volunteer/create-volunteer-profile.usecase';
import { CreateVolunteerProfileDto } from './dto/create-volunteer-profile.dto';

// TODO: add MobileJwtAuthGuard and VolunteerGuard
@ApiBearerAuth()
@Controller('mobile/volunteer')
export class MobileVolunteerController {
  constructor(
    private readonly createVolunteerProfileUseCase: CreateVolunteerProfileUseCase,
  ) {}

  @ApiBody({ type: CreateVolunteerProfileDto })
  @Post(':id/profile')
  async createProfile(
    // TODO: add ExtractUser - add guard to check if the userId is in the volunteer
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
