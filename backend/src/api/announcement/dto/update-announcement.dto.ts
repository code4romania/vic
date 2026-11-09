import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAnnouncementDto } from './create-announcement.dto';

// Activation and archiving have their own endpoints
export class UpdateAnnouncementDto extends PartialType(
  OmitType(CreateAnnouncementDto, ['publishNow']),
) {}
