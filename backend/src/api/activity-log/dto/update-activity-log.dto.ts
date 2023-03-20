import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateActivityLogByAdminDto } from './create-activity-log-by-admin.dto';

export class UpdateActivityLogDto extends PartialType(
  OmitType(CreateActivityLogByAdminDto, ['volunteerId']),
) {}
