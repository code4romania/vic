import { PartialType } from '@nestjs/swagger';
import { CreateVolunteerProfileDto } from './create-volunteer-profile.dto';

export class UpdateVolunteerProfileDto extends PartialType(
  CreateVolunteerProfileDto,
) {}
