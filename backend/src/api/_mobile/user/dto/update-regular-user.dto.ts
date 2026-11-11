import { OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CreateRegularUserDto } from './create-regular-user.dto';

export class UpdateRegularUserDto extends PartialType(
  OmitType(CreateRegularUserDto, ['email', 'phone']),
) {
  @Transform(({ value }) =>
    typeof value === 'string' && !value.trim() ? null : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string | null;

  // The date of birth can be changed but not removed (mandatory since VIC 2.0)
  @ValidateIf((dto) => dto.birthday !== undefined)
  @IsDate()
  birthday?: Date;
}
