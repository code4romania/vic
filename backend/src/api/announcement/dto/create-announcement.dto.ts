import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsOnlyDepartments } from 'src/common/decorators/is-only-departments.decorator';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';

export class CreateAnnouncementDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  description: string;

  @IsEnum(AnnouncementStatus)
  status: AnnouncementStatus;

  @IsArray()
  @IsOptional()
  @IsOnlyDepartments()
  targetsIds?: string[];
}
