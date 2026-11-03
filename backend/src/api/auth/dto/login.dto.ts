import { ApiProperty } from '@nestjs/swagger';
import { IsPasswordInput, IsNormalizedEmail } from './validators';

export class LoginDto {
  @ApiProperty({ example: 'ana@example.ro' })
  @IsNormalizedEmail()
  email: string;

  @ApiProperty()
  @IsPasswordInput()
  password: string;
}
