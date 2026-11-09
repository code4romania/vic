import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { RegistrationExportField } from 'src/modules/event/enums/registration-export-field.enum';

export class DownloadRegistrationsDto {
  // comma separated, e.g. fields=name,email,hours; left out: every field
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value
          .split(',')
          .map((field) => field.trim())
          .filter(Boolean)
      : value,
  )
  @IsArray()
  @IsEnum(RegistrationExportField, { each: true })
  fields?: RegistrationExportField[];
}
