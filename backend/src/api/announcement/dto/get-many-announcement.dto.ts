import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';

export class GetManyAnnouncementDto extends BasePaginationFilterDto {
  @IsEnum(AnnouncementStatus)
  @IsOptional()
  status?: AnnouncementStatus;

  @IsArray()
  @IsOptional()
  targetsIds?: string[];
}
