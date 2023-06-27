import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRegularUserDto } from './create-regular-user.dto';

export class UpdateRegularUserDto extends PartialType(
  OmitType(CreateRegularUserDto, ['email']),
) {}
