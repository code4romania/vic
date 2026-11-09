import { IsEnum, IsOptional } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementType } from 'src/modules/announcement/enums/announcement-type.enum';

export class GetManyAnnouncementDto extends BasePaginationFilterDto {
  @IsEnum(AnnouncementStatus)
  @IsOptional()
  status?: AnnouncementStatus;

  @IsEnum(AnnouncementType)
  @IsOptional()
  type?: AnnouncementType;
}
