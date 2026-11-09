import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { AnnouncementType } from 'src/modules/announcement/enums/announcement-type.enum';

export class CreateAnnouncementDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(225)
  description: string;

  @IsEnum(AnnouncementType)
  type: AnnouncementType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100000)
  volunteersNeeded?: number;

  @IsDate()
  displayStartDate: Date;

  @ValidateIf(
    (dto) => dto.displayEndDate !== undefined && dto.displayEndDate !== null,
  )
  @IsDate()
  displayEndDate?: Date;

  // "Activează imediat după creare": active right away, otherwise inactive
  @IsOptional()
  @IsBoolean()
  publishNow?: boolean;
}
