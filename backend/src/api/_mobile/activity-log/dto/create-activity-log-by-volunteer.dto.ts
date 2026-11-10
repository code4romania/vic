import { IsOptional, IsUUID } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { CreateActivityLogByAdminDto } from 'src/api/activity-log/dto/create-activity-log-by-admin.dto';

// Mobile: the volunteer comes from the token (the user's volunteer in the active organization).
export class CreateActivityLogByVolunteerDto extends OmitType(
  CreateActivityLogByAdminDto,
  ['volunteerId'] as const,
) {
  // Ignored unless it differs from the user's own volunteer (then 404); older apps send it.
  @IsUUID()
  @IsOptional()
  volunteerId?: string;
}
