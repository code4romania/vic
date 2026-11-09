import { OmitType, PartialType } from '@nestjs/swagger';
import { IsDate, ValidateIf } from 'class-validator';
import { CreateRegularUserDto } from './create-regular-user.dto';

export class UpdateRegularUserDto extends PartialType(
  OmitType(CreateRegularUserDto, ['email']),
) {
  // The date of birth can be changed but not removed (mandatory since VIC 2.0)
  @ValidateIf((dto) => dto.birthday !== undefined)
  @IsDate()
  birthday?: Date;
}
