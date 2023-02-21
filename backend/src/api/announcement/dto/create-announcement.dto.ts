import {
  IsArray,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { REGEX } from 'src/common/constants/patterns';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';

export class CreateAnnouncementDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Matches(REGEX.NAME_REGEX)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  description: string;

  @IsEnum(AnnouncementStatus)
  status: AnnouncementStatus;

  @IsArray()
  targets: string[];
}
