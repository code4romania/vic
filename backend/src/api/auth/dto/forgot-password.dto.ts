import { ApiProperty } from '@nestjs/swagger';
import { IsNormalizedEmail } from './validators';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ana@example.ro' })
  @IsNormalizedEmail()
  email: string;
}
